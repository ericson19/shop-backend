const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudinaryConfig = async (file) => {
  try {
    const uploadResult = await cloudinary.uploader.upload(file, {
      folder: "uploads/products",
      use_filename: true,
      unique_filename: false,
    });
    console.log("Cloudinary upload result:", uploadResult);
    return uploadResult;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image to Cloudinary");
  }
};
module.exports = cloudinaryConfig;
