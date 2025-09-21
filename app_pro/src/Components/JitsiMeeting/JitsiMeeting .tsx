import React from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';

interface Props {
    callId: string;
    roomName: string;
    displayName: string;
}


const JitsiComponent: React.FC<Props> = ({ roomName, displayName }) => {
    const handleApiReady = (api: string) => {
        // Here you can attach event listeners and execute commands
        // for example: api.addEventListener('participantJoined', handleParticipantJoined);
    };

    return (
        <JitsiMeeting
            domain="meet.jit.si" // Use your self-hosted Jitsi server domain here if you have one
            roomName={roomName}

            configOverwrite={{
                startWithAudioMuted: false,
                startWithVideoMuted: false,
            }}

            interfaceConfigOverwrite={{
                filmStripOnly: false,
                // Add other UI overrides here
            }}
            userInfo={{
                displayName,

            }}
            onApiReady={handleApiReady}
        // You can also use onReadyToClose, getIFrameRef, etc.
        />
    );
};

export default JitsiComponent;