import { Code } from '#src/core/code/Code';
import { ALLOW_IMAGE_MIME_TYPES, MAX_UPLOAD_FILE_SIZE } from '#src/core/constant';
import { HttpException } from '#src/core/exception/http-exception';
import multer from 'multer';

export class UploadUtils {
  static single({ field, allowedMimeTypes = ALLOW_IMAGE_MIME_TYPES }) {
    const storage = multer.memoryStorage();

    const multerUpload = multer({
      storage,
      limits: { files: 1, fileSize: MAX_UPLOAD_FILE_SIZE },
      fileFilter: (req, file, cb) => {
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return cb(new Error('Invalid file type'));
        }
        cb(null, true);
      },
    }).single(field);

    return (req, res, next) => {
      multerUpload(req, res, (err) => {
        if (!err || err.code === 'MISSING_FIELD_NAME') {
          if (req.file) req.body[field] = req?.file?.buffer;
          return next();
        }

        switch (err.code) {
          case 'LIMIT_FILE_SIZE':
            return next(
              HttpException.new({
                code: Code.FILE_TOO_LARGE,
                overrideMessage: `File too large! Maximum size is ${MAX_UPLOAD_FILE_SIZE / (1024 * 1024)}MB`,
              }),
            );
          case 'LIMIT_FILE_COUNT':
            return next(
              HttpException.new({
                code: Code.TOO_MANY_FILES,
                overrideMessage: `Too many files! Only 1 file is allowed`,
              }),
            );
          default:
            return next(
              HttpException.new({
                code: Code.BAD_FILE_TYPE,
                overrideMessage: `Invalid file type! Support ${JSON.stringify(ALLOW_IMAGE_MIME_TYPES)}`,
              }),
            );
        }
      });
    };
  }
}
