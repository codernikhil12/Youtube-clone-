import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// CLOUDINARY CONFIG
cloudinary.config({
  cloud_name: process.env.CLOUDINART_CLOUD_NAME,
  api_key: process.env.CLOUDINART_API_KEY,
  api_secret: process.env.CLOUDINART_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return "Could not find the path";
    //upload file cloudinary
    const uploadfile = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    //file has been uploaded succesfull
    console.log("Upload succesfull", uploadfile.url);
    return uploadfile;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the locally save temorary file as the upload operation got failed
    return null;
  }
};

//UPLOADER FUNCTION
export { uploadOnCloudinary };
