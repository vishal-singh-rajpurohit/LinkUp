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

    async getAnswer(offer: RTCSessionDescription) {
        if (this.peer) {
            await this.peer.setRemoteDescription(offer);
            const ans = await this.peer.createAnswer();
            await this.peer.setLocalDescription(new RTCSessionDescription(ans));
            return ans
        }
    }

    async setLocalDescription(ans: RTCSessionDescription) {
        if (this.peer) {
            await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
        }
    }

    async createOffer() {
        if (this.peer) {
            const offer = await this.peer.createOffer();
            await this.peer.setLocalDescription(new RTCSessionDescription(offer))
            return offer;
        }
    }

    async clearPeer(){
        this.peer?.close()
    }
}

export default new PeerPackages()