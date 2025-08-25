const ApiError = require("./ApiError.utils");
const fs = require("fs");

require("dotenv").config();

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(path) {
  try {
    const upload = await cloudinary.uploader.upload(path, {});

    if (!upload.public_id) {
      fs.unlinkSync(path);
      throw new ApiError(500, "Error in Upload on cloudinary");
    }
    fs.unlinkSync(path);

    const url = await cloudinary.url(upload.public_id, { format: "webp" });
    upload.url = url;

    return upload;
  } catch (error) {
    fs.unlinkSync(path);
    throw new ApiError(500, "Error in Upload on cloudinary");
  }
}

async function uploadRawToCloudinary(path) {
  try {
    const upload = await cloudinary.uploader.upload(path, {
      resource_type: "raw",
      folder: "documents",
    });

    fs.unlinkSync(path);

    return {
      file_type: upload.type,
      link: upload.url,
      public_id: upload.public_id,
    };
  } catch (error) {
    fs.unlinkSync(path);
    throw new ApiError(500, "Error in Upload on cloudinary");
  }
}

async function removeFromCloudinary(public_id) {
  try {
    await cloudinary.uploader.destroy(public_id);
  } catch (error) {
    throw new ApiError(500, "Error in remove from cloudinary");
  }
}

module.exports = {
  uploadToCloudinary,
  uploadRawToCloudinary,
  removeFromCloudinary,
};
