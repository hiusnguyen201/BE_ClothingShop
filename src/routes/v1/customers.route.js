import express from "express";
const router = express.Router();
import {
  validateSchema,
  validateFile,
} from "#src/middlewares/validate-request.middleware";
import {
  getAllCustomersController,
  createCustomerController,
  getCustomerByIdController,
  updateCustomerByIdController,
  removeCustomerByIdController,
  claimVoucherByCodeController,
  getAllVoucherFromCustomerController,
} from "#src/modules/customers/customers.controller";
import { createCustomerDto } from "#src/modules/customers/dto/create-customer.dto";
import { updateCustomersDto } from "#src/modules/customers/dto/update-customer.dto";

import { UploadUtils } from "#src/utils/upload.util";
import { ALLOW_IMAGE_MIME_TYPES } from "#src/core/constant";
import { claimVoucherByCodeDto } from "#src/modules/customers/dto/claim-voucher-by-code.dto";
const upload = UploadUtils.config({
  allowedMimeTypes: ALLOW_IMAGE_MIME_TYPES,
});
router
  .get("/get-customers", getAllCustomersController)
  .get("/get-customer-by-id/:id", getCustomerByIdController)
  .post(
    "/create-customer",
    validateFile(upload.single("avatar")),
    validateSchema(createCustomerDto),
    createCustomerController
  )
  .patch(
    "/update-customer-by-id/:id",
    validateFile(upload.single("avatar")),
    validateSchema(updateCustomersDto),
    updateCustomerByIdController
  )
  .delete("/remove-customer-by-id/:id", removeCustomerByIdController)

  //claim voucher by code
  .post(
    "/claim-voucher-by-code",
    validateSchema(claimVoucherByCodeDto),
    claimVoucherByCodeController
  )
  .get("/get-voucher-from-customer", getAllVoucherFromCustomerController);
export default router;
