import { v2 as cloudinary } from "cloudinary";
import { v4 as uuidv4 } from "uuid";
import moment from "moment-timezone";
import config from "#src/config";

cloudinary.config({
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  cloud_name: config.cloudinary.cloudName,
});

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
 * Ref: https://cloudinary.com/documentation/transformation_reference#c_crop_resize
 * @param {*} param
 * @returns {string}
 */
export function cropImagePathByVersionService({
  width = 500,
  height = 500,
  crop = "fit",
  url,
  version,
}) {
  const segments = url.split("/");
  const versionIndex = segments.indexOf(`v${version}`);
  return [
    ...segments.slice(0, versionIndex),
    `w_${width},h_${height},c_${crop}`,
    ...segments.slice(versionIndex),
  ].join("/");
}
