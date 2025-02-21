import { v2 as cloudinary } from 'cloudinary';
import moment from 'moment-timezone';
import { v4 as uuidv4 } from 'uuid';

cloudinary.config({
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  cloud_name: process.env.CLOUDINARY_NAME,
});

/**
 * Upload image buffer
 * @param {*} param0
 * @returns
 */
export async function uploadImageBufferService({ file, folderName }) {
  const base64 = Buffer.from(file.buffer).toString('base64');
  const url = 'data:' + file.mimetype + ';base64,' + base64;
  return cloudinary.uploader.upload(url, {
    folder: folderName,
    public_id: moment().valueOf() + '_' + uuidv4(),
    resource_type: 'image',
  });
}

/**
 * Remove image by publicId
 * @param {*} arrayPublicId
 * @returns
 */
export const removeImageByPublicIdService = async (publicId) => {
  return cloudinary.uploader.destroy(publicId);
};

/**
 * Remove images by array publicId
 * @param {*} arrayPublicId
 * @returns
 */
export const removeImagesByArrayPublicIdService = async (arrayPublicId = []) => {
  return cloudinary.api.delete_resources(Array.isArray(arrayPublicId) ? arrayPublicId : [arrayPublicId]);
};
