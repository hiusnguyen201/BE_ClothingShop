import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { v2 as cloudinary } from 'cloudinary';
import moment from 'moment-timezone';
import { HttpException } from '#src/core/exception/http-exception';
import { Code } from '#src/core/code/Code';

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
          return reject(HttpException.new({ code: Code.FILE_STORAGE_ERROR, overrideMessage: 'Upload image failed' }));
        }
        resolve(result);
      },
    );
    uploadStream.end(optimizedImage);
  });
}

/**
 * Upload file
 * @param {*} param0
 * @returns
 */
export async function uploadFileBufferService({ buffer, folderName, fileName }) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folderName,
        public_id: fileName,
        resource_type: 'raw',
      },
      (err, result) => {
        if (err) {
          return reject(HttpException.new({ code: Code.FILE_STORAGE_ERROR, overrideMessage: 'Upload file failed' }));
        }
        resolve(result);
      },
    );
    uploadStream.end(buffer);
  });
}

export async function removeFileOnCloudService({ folderName, fileName }) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(`${folderName}/${fileName}`, { resource_type: 'raw' }, (error, result) => {
      if (error) {
        return reject(error);
      }
      resolve(result);
    });
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
      return reject(HttpException.new({ code: Code.FILE_STORAGE_ERROR, overrideMessage: 'Remove image failed' }));
    }
    resolve(result);
  });
};
