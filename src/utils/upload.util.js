import moment from "moment-timezone";
import fs from "fs";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";

const ROOT_UPLOAD_PATH = "./public/uploads";
const MAX_UPLOAD_FILE_SIZE = 1024 * 1024 * 2; // 2 MB

if (!fs.existsSync(ROOT_UPLOAD_PATH)) {
  fs.mkdirSync(ROOT_UPLOAD_PATH);
}

export class UploadUtils {
  static config(allowedMimeTypes = [], maxFiles = 1) {
    const storage = multer.diskStorage({
      destination: ROOT_UPLOAD_PATH,
      filename: function (req, file, cb) {
        const uniquePrefix = moment().valueOf() + "_" + uuidv4();
        cb(null, uniquePrefix);
      },
    });

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

  static clearUploadFile(files) {
    files = files.filter(Boolean);
    files.forEach((e) => {
      if (fs.existsSync(e.path)) {
        fs.unlinkSync(e.path);
      }
    });
  }
}
