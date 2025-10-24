import { useCallback, useContext, useRef, type ReactNode } from "react";
import { PeerContext, WSContext } from "./Contexts";
import { PeerConfig } from "./constant";

const PeerProvider = ({ children }: { children: ReactNode }) => {
    const peerRef = useRef<RTCPeerConnection | null>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    const wsContext = useContext(WSContext)

    if (!wsContext) {
        throw new Error("context not found");
    }

    const { socket } = wsContext;

    async function createOffer() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            peerRef.current = new RTCPeerConnection(PeerConfig);

            stream.getTracks().forEach(track => peerRef.current!.addTrack(track, stream));

            peerRef.current.ontrack = (e) => {
                if (remoteVideoRef.current && e.streams && e.streams[0]) {
                    remoteVideoRef.current.srcObject = e.streams[0];
                }
            }

            // 4. Handle ICE Candidates
            peerRef.current.onicecandidate = (event) => {
                if (event.candidate && socket) {
                    // Send ICE candidate to the other peer via the signaling server

                    // ws.current.send(JSON.stringify({
                    //     type: 'ice-candidate',
                    //     candidate: event.candidate,
                    //     to: targetUserId,
                    //     from: 'your-user-id' // Replace with actual user ID
                    // }));

                }
            };

            const offer = await peerRef.current.createOffer();
            await peerRef.current.setLocalDescription(offer);

            // Send offer to the other peer via the signaling server
            //   ws.current.send(JSON.stringify({ 
            //     type: 'offer', 
            //     sdp: offer,
            //     to: targetUserId,
            //     from: 'your-user-id'
            //   }));

        } catch (error) {
            if (error instanceof Error) {
                console.log("Error in aprovedCall: ", error)
            }
        }
    }


    const handleSignalingMessage = useCallback(async (message: any) => {
    if (!peerRef.current) return;

    switch (message.type) {
      case 'offer':
        // Receiver of the call
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(message.sdp));
        const answer = await peerRef.current.createAnswer();
        await peerRef.current.setLocalDescription(answer);
        
        // Send answer back to the initiator
        // ws.current?.send(JSON.stringify({ 
        //   type: 'answer', 
        //   sdp: answer,
        //   to: message.from,
        //   from: 'your-user-id'
        // }));

        break;

      case 'answer':
        // Initiator of the call
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(message.sdp));
        break;

      case 'ice-candidate':
        // Both peers handle incoming ICE candidates
        try {
          if (message.candidate) {
            await peerRef.current.addIceCandidate(new RTCIceCandidate(message.candidate));
          }
        } catch (e) {
          console.error('Error adding ICE candidate:', e);
        }
        break;
      
      default:
        console.warn('Unknown message type:', message.type);
    }
  }, []);

    async function answerCall() { }

    async function approvedCall() {
        try {
        } catch (error) {
            if (error instanceof Error) {
                console.log("Error in aprovedCall: ", error)
            }
        }
    }

    async function rejectCall() { }
    return (
        <PeerContext.Provider value={null} >{children}</PeerContext.Provider>
    )
}

export default PeerProvider