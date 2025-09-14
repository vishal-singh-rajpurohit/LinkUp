const mediasoup = require("mediasoup");
const config = require("./config");

const worker = [];

let nextMediaSoupWorkerIdx = 0;

const createWorker = async () => {
  const worker = await mediasoup.createWorker({
    logTags: config.mediasoup.worker.logTags,
    logLevel: config.mediasoup.worker.logLevel,
    rtcMinPort: config.mediasoup.worker.rtcMinPort,
    rtcMaxPort: config.mediasoup.worker.rtcMaxPort,
  });

  worker.on("died", () => {
    console.log("media soup connnection died: ", worker.pid);

    setTimeout(() => {
      process.exit(1);
    }, 2000);
  });

  const mediaSoupCodecs = config.mediasoup.worker.router.mediaCodes;
  const mediasoupRouter = await worker.createRouter({
    mediaCodecs: mediaSoupCodecs,
  });
  return mediasoupRouter;
};

const createWebRtcTransport= async(mediasoupRouter) =>{
    const {
      maxIncomeBitRate,
      initialAvilableOutgoingBitrate,
    } = config.mediasoup.webRtcTransport;

    const transport = mediasoupRouter.createTransport({
      listenIps: config.mediasoup.webRtcTransport.listenIps,
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
      initialAvilableOutgoingBitrate
    });

    if(maxIncomeBitRate){
      try {
        await transport.setMaxIncomingBitrate(maxIncomeBitRate)
      } catch (error) {
        console.error(error)        
      }
    }

    return {
      transport,
      params: {
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
      }
    }
}

const routerRtpCapabilities = {
  codecs: config.mediasoup.worker.router.mediaCodes,
  headerExtensions: config.mediasoup.worker.router.headerExtensions,
};


module.exports = {
  createWorker,
  routerRtpCapabilities,
  createWebRtcTransport
};


// 15