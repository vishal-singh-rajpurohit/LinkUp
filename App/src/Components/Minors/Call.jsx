import React, { useCallback, useContext, useEffect, useState } from 'react';
import profile from '../../Assets/ggg.jpg'
import '../../Styles/calling.css';
import '../../Styles/VideoCallModal.css';

import {
    FaMicrophone,
    FaMicrophoneSlash,
    FaVideo,
    FaVideoSlash,
    FaPhoneSlash,
    FaExpand
} from 'react-icons/fa';
import ChatContext from '../../context/ChatContext.context';
import { setSteams } from '../../functions/callSlice';
import axios from 'axios';


export const CallRequestModal = () => {
    const { isIncoming, selectedContact, isCallRequest, declineVideoCall } = useContext(ChatContext)
    const { answerVideoCall } = useContext(ChatContext)
    return (
        <div className="call-modal-backdrop" style={{ display: isCallRequest ? 'flex' : 'none' }}>
            <div className="call-modal">
                <div className="call-avatar pulse-ring">
                    <img
                        src={selectedContact.Avatar || profile}
                        alt="Caller Avatar"
                        className="avatar-img"
                    />
                </div>
                <h2>{isIncoming ? 'Incoming Video Call' : 'Calling...'}</h2>
                <p className="caller-name">{selectedContact.userName}</p>
                <div className="ringing-animation">
                    <span className="dot dot1" />
                    <span className="dot dot2" />
                    <span className="dot dot3" />
                </div>

                <div className="call-actions">
                    <button className="btn decline" onClick={declineVideoCall}>Decline</button>
                    <button className="btn accept" onClick={answerVideoCall} style={{ display: isIncoming ? 'initial' : 'none' }}>Accept</button>
                </div>
            </div>
        </div>
    );
};

export const VideoCallModal = () => {
    const { myStream, otherStream, sendStream, selectedContact, localPc, onEndCall, micOn, cameraOn, toggleMic, toggleCamera, onFullScreen, dispatch, remoteStream, setStream } = useContext(ChatContext)
    // const { getUserMediaStream } = useContext(ChatContext)

    const [localStream, setLocalStream] = useState(null);

    const handleNegotiation = useCallback(async () => {
        try {
            const localOffer = await localPc.createOffer();

            const response = await axios.post(`process.env.REACT_APP_CHAT_API}/chat//call/call-nego`,
                {
                    reciverId: selectedContact.callerId,
                    contactId: selectedContact._id,
                    Offer: localOffer,
                },
                {
                    withCredentials: true
                })

            console.log("Negosiation needed: ", response)
        } catch (error) {
            console.log("Error in nego: ", error)
        }

    }, [])

    const getUserMediaStream = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        });
        await setStream(stream)
        setLocalStream(stream)
        // dispatch(setSteams({ myStream: stream, otherStream: null }));
    }, []);

    useEffect(() => {
        localPc.addEventListener('negotiationneeded', handleNegotiation);
        return () => {
            localPc.removeEventListener('negotiationneeded', handleNegotiation);
        }
    }, [localPc])


    useEffect(() => {
        getUserMediaStream()
    }, [getUserMediaStream])





    return (
        <div className="video-call-container">
            <div className="video-call-grid">
                <video
                    className="remote-video"
                    autoPlay
                    playsInline
                    ref={(video) => {
                        if (video && localStream) video.srcObject = localStream;
                    }}
                />
                <video
                    className="local-video"
                    muted
                    autoPlay
                    playsInline
                    ref={(video) => {
                        if (video && remoteStream) video.srcObject = remoteStream;
                    }}
                />
            </div>

            <div className="video-call-controls">
                <button className="control-btn" >
                    {micOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
                </button>
                <button className="control-btn" >
                    {cameraOn ? <FaVideo /> : <FaVideoSlash />}
                </button>
                <button className="control-btn end-call" >
                    <FaPhoneSlash />
                </button>
                <button className="control-btn">
                    <FaExpand />
                </button>
            </div>
        </div>
    );
};


