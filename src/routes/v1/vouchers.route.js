import express from "express";
const router = express.Router();

import {
  createVoucherController,
  getAllVouchersController,
  getVoucherByIdController,
  updateVoucherByIdController,
  removeVoucherByIdController
} from "#src/modules/vouchers/vouchers.controller"

import {
  validateSchema,
  validateFile,
} from "#src/middlewares/validate-request.middleware";
import { UploadUtils } from "#src/utils/upload.util";
import { ALLOW_IMAGE_MIME_TYPES } from "#src/core/constant";
import { createVoucherDto } from "#src/modules/vouchers/dto/create-vouchers.dto";
import { updateVoucherDto } from "#src/modules/vouchers/dto/update-vouchers.dto";
const upload = UploadUtils.config({
  allowedMimeTypes: ALLOW_IMAGE_MIME_TYPES,
});

router
  .get("/get-vouchers", getAllVouchersController)
  .get("/get-voucher-by-id/:id", getVoucherByIdController)
  .post(
    "/create-voucher",
    validateFile(upload.single("image")),
    validateSchema(createVoucherDto),
    createVoucherController
  )
  .patch(
    "/update-voucher-by-id/:id",
    validateFile(upload.single("image")),
    validateSchema(updateVoucherDto),
    updateVoucherByIdController
  )
  .delete("/remove-voucher-by-id/:id", removeVoucherByIdController);

export default router;
