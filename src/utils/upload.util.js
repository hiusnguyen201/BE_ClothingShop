'use strict';
import { MAX_UPLOAD_FILE_SIZE } from '#src/core/constant';
import multer from 'multer';

export class UploadUtils {
  static config({ allowedMimeTypes = [], maxFiles = 1 }) {
    const storage = multer.memoryStorage();

    return multer({
      storage,
      limits: { files: maxFiles, fileSize: MAX_UPLOAD_FILE_SIZE },
      fileFilter: (req, file, cb) => {
        if (allowedMimeTypes.length > 0) {
          allowedMimeTypes.includes(file.mimetype) ? cb(null, true) : cb(new Error());
        } else {
          cb(null, true);
        }
      },
    });
  }
}
