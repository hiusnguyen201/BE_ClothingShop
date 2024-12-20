import multer from "multer";

const MAX_UPLOAD_FILE_SIZE = 1024 * 1024 * 1; // 2 MB

export class UploadUtils {
  static config({ allowedMimeTypes = [], maxFiles = 1 }) {
    let storage = multer.memoryStorage();

    const uploadOptions = {
      storage: storage,
      limits: { files: maxFiles, fileSize: MAX_UPLOAD_FILE_SIZE },
      fileFilter: (req, file, cb) => {
        if (allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error());
        }
      },
    };

    return multer(uploadOptions);
  }
}
