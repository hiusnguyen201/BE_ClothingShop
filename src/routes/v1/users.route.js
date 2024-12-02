import express from "express";
const router = express.Router();

import {
  create,
  findAll,
  findOne,
  update,
  remove,
} from "#src/modules/users/users.controller";
import { createUserDto } from "#src/modules/users/dto/create-user.dto";
import {
  validateSchema,
  validateFile,
} from "#src/middlewares/validate-request.middleware";
import { UploadUtils } from "#src/utils/upload.util";
import { ALLOW_IMAGE_MIME_TYPES } from "#src/constants";
const upload = UploadUtils.config({
  allowedMimeTypes: ALLOW_IMAGE_MIME_TYPES,
});

router
  .route("/")
  .get(findAll)
  .post(
    validateSchema(createUserDto),
    validateFile(upload.single("image")),
    create
  );

router.route("/:id").get(findOne).patch(update).delete(remove);

export default router;
