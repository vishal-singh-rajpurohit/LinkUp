const multer = require("multer");
const fs = require("fs");
const path = require("path");

const dest = "temp/avatars";
if (!fs.existsSync(dest)) {
  fs.mkdirSync(dest, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (_, _, cb) {
    cb(null, dest);
  },
  filename: function (_, file, cb) {
    cb(
      null,
      `${file.fieldname}-avatar-linkup-${Date.now()}-${path.extname(file.originalname)}`
    );
  },
});

const fileUploader = multer({
  storage: storage,
  limits: {
    files: 1,
  },
});

module.exports = {
  fileUploader,
};
