import { MAX_UPLOAD_FILE_SIZE } from '#core/constant';
import { BadRequestException } from '#src/core/exception/http-exception';
import multer from 'multer';

export class UploadUtils {
  static config({ allowedMimeTypes = [], maxFiles = 1 }) {
    const storage = multer.memoryStorage();

    return multer({
      storage,
      limits: { files: maxFiles, fileSize: MAX_UPLOAD_FILE_SIZE },
      fileFilter: (req, file, cb) => {
        if (allowedMimeTypes.length > 0) {
          allowedMimeTypes.includes(file.mimetype) ? cb(null, true) : cb(new Error('Invalid file type'));
        } else {
          cb(null, true);
        }
      },
    });
  }

  static single(field) {
    const storage = multer.memoryStorage();

    const upload = multer({ storage, limits: { fileSize: MAX_UPLOAD_FILE_SIZE } });

    return (req, res, next) => {
      upload.array(field)(req, res, (err) => {
        if (err) return next(new BadRequestException(err.message));
        req.body[field] = req.files[0].buffer;
        next();
      });
    };
  }

  static array(field) {
    const storage = multer.memoryStorage();

    const upload = multer({ storage, limits: { fileSize: MAX_UPLOAD_FILE_SIZE } });

    return (req, res, next) => {
      upload.array(field)(req, res, (err) => {
        if (err) return next(new BadRequestException(err.message));
        req.body[field] = req.files.map((file) => file.buffer);
        next();
      });
    };
  }
}
