class PeerPackages {
    peer: RTCPeerConnection | null = null;
    isVideoOn: boolean = true;
    isAudioOn: boolean = true;
    private pendingIceCandidates: RTCIceCandidateInit[] = [];
    constructor() {
        if (!this.peer) {
            this.isVideoOn = true;
            this.isAudioOn = true;
            this.peer = new RTCPeerConnection({
                iceServers: [
                    {
                        urls: [
                            "stun:stun.l.google.com:19302",
                            "stun:global.stun.twilio.com:3478",
                        ],
                    },
                ],
            })
        }
    }

    private async createPeer() {
        return new RTCPeerConnection({
            iceServers: [
                {
                    urls: [
                        "stun:stun.l.google.com:19302",
                        "stun:global.stun.twilio.com:3478",
                    ],
                },
            ],
        });
    }

    async setVideo(trigger: boolean){
        this.isVideoOn = trigger;
    }

    async setAudio(trigger: boolean){
        this.isAudioOn = trigger;
    }
    async createOffer() {
        if (this.peer) {
            const offer = await this.peer.createOffer();
            await this.peer.setLocalDescription(new RTCSessionDescription(offer))
            return offer;
        }
    }

    async getAnswer(offer: RTCSessionDescriptionInit) {
        if (this.peer) {

            await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
            await this.flushPendingCandidates();
            const ans = await this.peer.createAnswer();
            await this.peer.setLocalDescription(new RTCSessionDescription(ans));
            return ans
        }
    }

    async setRemoteDescription(ans: RTCSessionDescriptionInit) {
        if (this.peer) {
            await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
            await this.flushPendingCandidates();
        }
    }

    async addIceCandidate(candidate: RTCIceCandidateInit) {
        if (this.peer) {
            if (!this.peer.remoteDescription) {
                this.pendingIceCandidates.push(candidate);
                return;
            }
            await this.peer.addIceCandidate(new RTCIceCandidate(candidate))
        }
    }

    private async flushPendingCandidates() {
        if (!this.peer || !this.peer.remoteDescription) return;
        while (this.pendingIceCandidates.length) {
            const candidate = this.pendingIceCandidates.shift();
            if (!candidate) continue;
            await this.peer.addIceCandidate(new RTCIceCandidate(candidate));
        }
    }

    async resetPeer() {
        if (!this.peer) return;

        this.peer.getSenders().forEach(sender => {
            try {
                sender.track?.stop();
                this.peer?.removeTrack(sender);
            } catch { }
        });

        this.peer.getReceivers().forEach(receiver => {
            try {
                receiver.track?.stop();
            } catch { }
        });

        try {
            this.peer.close();
        } catch { }


        this.peer = null;
        this.createPeer();
        this.isAudioOn = true;
        this.isVideoOn = true;
    }
}

export default new PeerPackages();
