class PeerPackages {
    peer: RTCPeerConnection | null = null;
    isVideoOn: boolean = true;
    isAudioOn: boolean = true;
    private pendingIceCandidates: RTCIceCandidateInit[] = [];

    constructor() {
        this.initPeer();
    }

    initPeer(): RTCPeerConnection {
        if (this.peer) {
            try {
                this.peer.close();
            } catch { }
        }
        this.isVideoOn = true;
        this.isAudioOn = true;
        this.pendingIceCandidates = [];
        this.peer = new RTCPeerConnection({
            iceServers: [
                {
                    urls: [
                        "stun:stun.l.google.com:19302",
                        "stun:global.stun.twilio.com:3478",
                    ],
                },
            ],
        });
        return this.peer;
    }

    setVideo(trigger: boolean, localStream?: MediaStream | null) {
        this.isVideoOn = trigger;
        if (localStream) {
            localStream.getVideoTracks().forEach((track) => {
                track.enabled = trigger;
            });
        }
    }

    setAudio(trigger: boolean, localStream?: MediaStream | null) {
        this.isAudioOn = trigger;
        if (localStream) {
            localStream.getAudioTracks().forEach((track) => {
                track.enabled = trigger;
            });
        }
    }

    async createOffer() {
        if (this.peer) {
            const offer = await this.peer.createOffer();
            await this.peer.setLocalDescription(new RTCSessionDescription(offer));
            return offer;
        }
    }

    async getAnswer(offer: RTCSessionDescriptionInit) {
        if (this.peer) {
            await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
            await this.flushPendingCandidates();
            const ans = await this.peer.createAnswer();
            await this.peer.setLocalDescription(new RTCSessionDescription(ans));
            return ans;
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
            try {
                await this.peer.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (err) {
                console.error("Error adding ice candidate:", err);
            }
        }
    }

    private async flushPendingCandidates() {
        if (!this.peer || !this.peer.remoteDescription) return;
        while (this.pendingIceCandidates.length) {
            const candidate = this.pendingIceCandidates.shift();
            if (!candidate) continue;
            try {
                await this.peer.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (err) {
                console.error("Error flushing candidate:", err);
            }
        }
    }

    async resetPeer() {
        if (this.peer) {
            this.peer.getSenders().forEach((sender) => {
                try {
                    sender.track?.stop();
                    this.peer?.removeTrack(sender);
                } catch { }
            });

            this.peer.getReceivers().forEach((receiver) => {
                try {
                    receiver.track?.stop();
                } catch { }
            });

            try {
                this.peer.close();
            } catch { }
        }

        this.peer = null;
        this.initPeer();
    }
}

export default new PeerPackages();
