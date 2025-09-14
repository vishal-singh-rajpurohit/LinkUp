const os = require("os");
const {} = require("mediasoup");

const config = {
  listenIp: "0.0.0.0",
  listenPort: 3016,

  mediasoup: {
    numWorkers: Object.keys(os.cpus()).length,
    worker: {
      rtcMinPort: 10000,
      rtcMaxPort: 10100,
      logLevel: "debug",
      logTags: ["info", "ice", "dtls", "rtp", "srtp", "rtcp"],

      router: {
        mediaCodes: [
          {
            kind: "audio",
            mimeType: "audio/opus",
            clockRate: 48000,
            channels: 2,
          },
          {
            king: "video",
            mimeType: "video/VP8",
            clockRate: 90000,
            parameters: {
              "x-google-start-bitrate": 1000,
            },
          },
        ],
        headerExtensions: [
          {
            kind: "video",
            uri: "urn:ietf:params:rtp-hdrext:sdes:mid",
            preferredId: 1,
          },
          {
            kind: "video",
            uri: "http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time",
            preferredId: 3,
          },
        ],
      },
    },
    webRtcTransport: {
      listenIps: [
        {
          ip: "0.0.0.0",
          announcedIp: "127.0.0.1", // Change with public ip of server
        },
      ],
      maxIncomeBitRate : 1500000,
      initialAvilableOutgoingBitrate: 1000000
    },
  },
};

module.exports = config;
