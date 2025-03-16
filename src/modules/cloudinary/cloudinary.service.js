import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { v2 as cloudinary } from 'cloudinary';
import moment from 'moment-timezone';
import { ServiceUnavailableException } from '#src/core/exception/http-exception';

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
export async function uploadImageBufferService({ buffer, folderName }) {
  const optimizedImage = await sharp(buffer).resize(500).jpeg().toBuffer();
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folderName,
        public_id: moment().valueOf() + '_' + uuidv4(),
        resource_type: 'image',
      },
      (err, result) => {
        if (err) {
          return reject(new ServiceUnavailableException('Upload image failed'));
        }
        resolve(result);
      },
    );
    uploadStream.end(optimizedImage);
  });
}

/**
 * Remove image by publicId
 * @param {*} arrayPublicId
 * @returns
 */
export const removeImageByPublicIdService = async (publicId) => {
  return cloudinary.uploader.destroy(publicId, { resource_type: 'image' }, (err, result) => {
    if (err) {
      return reject(new ServiceUnavailableException('Remove image failed'));
    }
    resolve(result);
  });
};
