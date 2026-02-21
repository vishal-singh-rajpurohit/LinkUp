// import { useCallback, useContext, useEffect, useRef, useState } from "react"
// import { WSContext } from "../context/Contexts"
// import { useAppSelector } from "../app/hooks"
// import peer from "../context/PeerPackages"
// import { callEventEnum } from "../context/constant"

// export const useCall = () => {
//     const selectedContact = useAppSelector((state) => state.temp.selectedContact);
//     const call = useAppSelector(state => state.call.callingDet);
//     const user = useAppSelector((state) => state.auth.user);


//     // Local Video
//     const localStreamRef = useRef<MediaStream | null>(null);
//     const localVideoRef = useRef<HTMLVideoElement | null>(null);

//     // Remote Video
//     const remoteStreamRef = useRef<MediaStream | null>(null);
//     const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

//     const socketContext = useContext(WSContext)

//     if (!socketContext) {
//         throw new Error("Socket not found");
//     }

//     const { socket } = socketContext;


//     const makeACall = useCallback(async () => {
//         try {
//             const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })

//             const offer = await peer.createOffer()

//             socket?.emit(callEventEnum.MAKE_VIDEO_CALL, { contactId: selectedContact._id, offer });
//             localStreamRef.current = stream;

//         } catch (error) {
//             if (error instanceof Error) {
//                 throw new Error('Error in make a call function: ' + error.message)
//             }
//         }
//     }, [localStreamRef, socket, selectedContact, peer])

//     useEffect(() => {
//         if (localVideoRef.current)
//             localVideoRef.current.srcObject = localStreamRef.current
//     }, [localStreamRef])

//     return {
//         makeACall,
//         video: {
//             localVideoRef,
//             remoteVideoRef,
//             localStreamRef,
//             remoteStreamRef
//         }
//     }
// }


// // export function useMeshRemoteMedia() {
// //     const pcsRef = useRef<Map<PeerId, RTCPeerConnection>>(new Map());
// //     const [remote, setRemote] = useState<RemoteState>({});

// //     const registerPeer = useCallback((peerId: PeerId, pc: RTCPeerConnection) => {
// //         pcsRef.current.set(peerId, pc);

// //         const onTrack = (ev: RTCTrackEvent) => {
// //             const track = ev.track;
// //             const streamHint = ev.streams?.[0]; // often provided
// //             setRemote(prev => PeerPackages.upsertRemoteTrack(prev, peerId, track, streamHint));

// //             track.onended = () => {
// //                 setRemote(prev => PeerPackages.removeRemoteTrack(prev, peerId, track));
// //             };
// //         };

// //         const onConnState = () => {
// //             const s = pc.connectionState;
// //             if (s === "failed" || s === "closed" || s === "disconnected") {
// //                 // In mesh, you usually remove peer on disconnect
// //                 setRemote(prev => PeerPackages.removePeer(prev, peerId));
// //             }
// //         };

// //         pc.addEventListener("track", onTrack);
// //         pc.addEventListener("connectionstatechange", onConnState);

// //         // return an unsubscribe if you want
// //         return () => {
// //             pc.removeEventListener("track", onTrack);
// //             pc.removeEventListener("connectionstatechange", onConnState);
// //             pcsRef.current.delete(peerId);
// //             setRemote(prev => PeerPackages.removePeer(prev, peerId));
// //             try { pc.close(); } catch { }
// //         };
// //     }, []);

// //     const unregisterPeer = useCallback((peerId: PeerId) => {
// //         const pc = pcsRef.current.get(peerId);
// //         pcsRef.current.delete(peerId);
// //         setRemote(prev => PeerPackages.removePeer(prev, peerId));
// //         if (pc) {
// //             try { pc.close(); } catch { }
// //         }
// //     }, []);
// // }