import { v2 as cloudinary } from "cloudinary";
import config from "#src/config";
import moment from "moment-timezone";
import { v4 as uuidv4 } from "uuid";

cloudinary.config({
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  cloud_name: config.cloudinary.cloudName,
});

/**
 * Upload image buffer
 * @param {*} param0
 * @returns
 */
export async function uploadImageBufferService({ file, folderName }) {
  const base64 = Buffer.from(file.buffer).toString("base64");
  const url = "data:" + file.mimetype + ";base64," + base64;
  const result = await cloudinary.uploader.upload(url, {
    folder: folderName,
    public_id: moment().valueOf() + "_" + uuidv4(),
    resource_type: "image",
  });
  return result;
}

/**
 * Remove image by publicId
 * @param {*} arrayPublicId
 * @returns
 */
export const removeImageByPublicIdService = async (publicId) => {
  const result = await cloudinary.uploader.destroy(publicId);
  return result;
};

/**
 * Remove images by array publicId
 * @param {*} arrayPublicId
 * @returns
 */
export const removeImagesByArrayPublicIdService = async (
  arrayPublicId = []
) => {
  const result = await cloudinary.api.delete_resources(
    Array.isArray(arrayPublicId) ? arrayPublicId : [arrayPublicId]
  );
  return result;
};
