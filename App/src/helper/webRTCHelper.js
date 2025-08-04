export const RtcConfiguration = {
    iceServers:[
        {
            urls: ["stun:stun.l.google.com:19302", "stun:stun.l.google.com:5349", "stun:stun1.l.google.com:3478"]
        }
    ],
    iceCandidatePoolSize: 10,
}