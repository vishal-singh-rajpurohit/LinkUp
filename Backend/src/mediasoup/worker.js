const mediasoup = require("mediasoup");
const config = require("./mediasoup-config");

let worker;
let router;
let rtpParameters;
let nextMediaSoupWorkerIdx = 0;

const startMediaSoup = async () => {
  
  const worker = await mediasoup.createWorker({
    logTags: config.mediasoup.worker.logTags,
    logLevel: config.mediasoup.worker.logLevel,
    rtcMinPort: config.mediasoup.worker.rtcMinPort,
    rtcMaxPort: config.mediasoup.worker.rtcMaxPort,
  });

  console.log(`worker pid: ${worker.pid}`)

  worker.on("died", () => {
    console.log("media soup connnection died: ", worker.pid);
    setTimeout(() => {
      process.exit(1);
    }, 2000);
  });

  const mediaSoupCodecs = config.mediasoup.worker.router.mediaCodes;
  const localRouter = await worker.createRouter({
    mediaCodecs: mediaSoupCodecs,
  });

  console.log("media soup startede " )
  
  return localRouter

};

const createWebRtcTransport = async(callback) =>{
    try {
      const {
        maxIncomeBitRate,
        initialAvilableOutgoingBitrate,
      } = config.mediasoup.webRtcTransport;
  
      const transport = await router.createWebRtcTransport({
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
  
      transport.on('dtlsstatechange', dtlsState => {
         if (dtlsState === 'closed') {
           transport.close();
         }
       });
  
       transport.on('close', () => {
         console.log('Transport closed');
       });

       callback({
        params: {
          id: transport.id,
          iceParameters: transport.iceParameters,
          iceCandidates: transport.iceCandidates,
          dtlsParameters: transport.dtlsParameters,
        }
       })

       console.log("treanport created")

      return transport
    } catch (error) {
      console.log("Error in creating the transport: ", error )
      callback({
        params: {
          error: error
        }
      })
    }
}

const routerRtpCapabilities = {
  codecs: config.mediasoup.worker.router.mediaCodes,
  headerExtensions: config.mediasoup.worker.router.headerExtensions,
};


module.exports = {
  worker,
  startMediaSoup,
  routerRtpCapabilities,
  createWebRtcTransport
};


// 15