require("dotenv").config();
const { server } = require("./app");
const conn = require("./db/conn");

let port = process.env.PORT;

console.log('the ATLAS_LINK: ', process.env.ATLAS_LINK);

conn()
  .then(() => {
    server.on("error", (error) => {
      throw error;
    });

    server.listen(port, () => {
      console.log("app is listning ", port);
    });
  })
  .catch((error) => {
    console.log("error while connectiong to the db ", error);
  });
