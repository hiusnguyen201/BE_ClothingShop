import multer from "multer";

const MAX_UPLOAD_FILE_SIZE = 1024 * 1024 * 1; // 2 MB

export class UploadUtils {
  static config({ allowedMimeTypes = [], maxFiles = 1 }) {
    const storage = multer.memoryStorage();

    return multer({
      storage,
      limits: { files: maxFiles, fileSize: MAX_UPLOAD_FILE_SIZE },
      fileFilter: (req, file, cb) => {
        allowedMimeTypes.includes(file.mimetype)
          ? cb(null, true)
          : cb(new Error());
      },
    });
  }
}
