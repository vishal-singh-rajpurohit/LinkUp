import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useEffect, useRef } from 'react';
import { useLoadScript } from '../../hooks/useLoadScript';
import { cancelVideoCall } from '../../app/functions/temp';
import { clearCall } from '../../app/functions/call';
import { useNavigate } from 'react-router-dom';

const JitsiComponent = () => {
    const roomName = useAppSelector((state) => state.call.callingDet.callId);
    const userName = useAppSelector((state) => state.auth.user.searchTag);
    const email = useAppSelector((state) => state.auth.user.email);
    const disp = useAppDispatch();
    const nav = useNavigate()


    const containerRef = useRef<HTMLDivElement>(null);
    const scriptHook = useLoadScript("https://meet.jit.si/external_api.js")


    useEffect(() => {
        if (!scriptHook) return;

        if (!window.JitsiMeetExternalAPI) {
            console.error("Jitsi API script not loaded");
            return;
        }

        const domain = "meet.jit.si";
        const options = {
            roomName,
            parentNode: containerRef.current,
            userInfo: { displayName: userName, email: email },
            configOverwrite: {
                prejoinPageEnabled: false,
            },
            interfaceConfigOverwrite: {
                TOOLBAR_BUTTONS: [
                    "microphone",
                    "camera",
                    "chat",
                    "desktop",
                    "hangup",
                    "participants-pane",
                    "tileview",
                ],
            },
        };

        const api = new window.JitsiMeetExternalAPI(domain, {
            roomName: options.roomName,
            parentNode: options.parentNode,
            userInfo: options.userInfo,
            configOverwrite: options.configOverwrite,
            interfaceConfigOverwrite: options.interfaceConfigOverwrite
        });


        api.addEventListener("participantJoined", () => {
            console.log("Participant joined");
        });

        api.addEventListener("participantLeft", () => {
            console.log("Participant left");
        });

        api.addEventListener("videoConferenceLeft", () => {
            console.log("Participant left the call");
        });

        api.addEventListener("readyToClose", () => {
            console.log("User left the call, cleaning up...");
            api.dispose();
            disp(clearCall());
            nav("/");
        });

        api.addEventListener("participantLeft", () => {
            console.log("A participant has left the call.");
            // You can add logic here if needed, like showing a toast notification.
        });


        disp(cancelVideoCall())

        return () => api.dispose();
    }, [scriptHook, roomName, userName, email]);


    if (!scriptHook) {
        return <div>Loading video call...</div>;
    }

    return <div ref={containerRef} style={{ height: "100vh", width: "100%" }} />;
};

export default JitsiComponent;