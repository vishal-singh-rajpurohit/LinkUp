class PeerPackages {
    peer: RTCPeerConnection | null = null;
    constructor() {
        if (!this.peer) {
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

    async createOffer() {
        if (this.peer) {
            const offer = await this.peer.createOffer();
            await this.peer.setLocalDescription(new RTCSessionDescription(offer))
            console.log(":::: CREATING OFFER")
            return offer;
        }
    }

    async getAnswer(offer: RTCSessionDescription) {
        if (this.peer) {
            console.log("::::: CREATING ANS: ", offer)

            await this.peer.setRemoteDescription(offer);
            const ans = await this.peer.createAnswer();
            await this.peer.setLocalDescription(new RTCSessionDescription(ans));
            return ans
        }
    }

    async setRemoteDescription(ans: RTCSessionDescription) {
        if (this.peer) {
            console.log("::::: SETTING REMOTE DESCRIPTION: ", ans)
            await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
        }
    }

    async addIceCandidate(candidate: RTCIceCandidate) {
        if (this.peer) {
            console.log("::: ADDING ICE CANDIDATES")
            await this.peer.addIceCandidate(new RTCIceCandidate(candidate))
        }
    }

    // ensureTransceivers() {
    //     if (!this.peer) return
    //     if (this.peer.getTransceivers().length === 0) {
    //         this.peer.addTransceiver("audio", { direction: "sendrecv" });
    //         this.peer.addTransceiver("video", { direction: "sendrecv" });
    //     }
    // }

    async resetPeer() {
        if (this.peer) {
            this.peer.ontrack = null;
            this.peer.onicecandidate = null;
            this.peer.close();
        }
        this.peer = await this.createPeer()
    }
}

export default new PeerPackages();