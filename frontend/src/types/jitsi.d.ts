// interface JitsiParticipant {
//   id: string;
//   displayName: string;
// }

interface JitsiEventMap {
  participantJoined: { id: string; displayName: string };
  participantLeft: { id: string };
  videoConferenceJoined: { roomName: string; id: string; displayName: string };
  videoConferenceLeft: void; // no payload
  audioMuteStatusChanged: { muted: boolean };
  videoMuteStatusChanged: { muted: boolean };
  readyToClose: void; 
}

// const events = "participantJoined"
//       | "participantLeft"
//       | "videoConferenceJoined"
//       | "videoConferenceLeft"
//       | "audioMuteStatusChanged"
//       | "videoMuteStatusChanged"

interface JitsiMeetAPI {
  addEventListener<K extends keyof JitsiEventMap>(
    event: K,
    listener: (payload: JitsiEventMap[K]) => void
  ): void;

  removeEventListener<K extends keyof JitsiEventMap>(
    event: K,
    listener: (payload: JitsiEventMap[K]) => void
  ): void;

  executeCommand(command: "hangup" | "toggleAudio" | "toggleVideo", ...args: unknown[]): void;
  dispose(): void;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: new (
      domain: string,
      options: Record<string, unknown>
    ) => JitsiMeetAPI;
  }
}

export { };
