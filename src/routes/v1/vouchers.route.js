import express from "express";
const router = express.Router();

import {
  createVoucherController,
  getAllVouchersController,
  getVoucherByIdController,
  updateVoucherByIdController,
  removeVoucherByIdController,
  isExistVoucherCodeController,
} from "#src/modules/vouchers/vouchers.controller";
import { validateSchema } from "#src/middlewares/validate-request.middleware";
import { createVoucherDto } from "#src/modules/vouchers/dto/create-voucher.dto";
import { updateVoucherDto } from "#src/modules/vouchers/dto/update-voucher.dto";
import { isExistVoucherCodeDto } from "#src/modules/vouchers/dto/is-exist-voucher-code.dto";
// import {
//   hasPermission,
//   isAuthorized,
// } from "#src/middlewares/jwt-auth.middleware";

router.post(
  "/is-exist-voucher-code",
  validateSchema(isExistVoucherCodeDto),
  isExistVoucherCodeController
);

// router.use([isAuthorized, hasPermission]);
router
  .get("/get-vouchers", getAllVouchersController)
  .get("/get-voucher-by-id/:id", getVoucherByIdController)
  .post(
    "/create-voucher",
    validateSchema(createVoucherDto),
    createVoucherController
  )
  .patch(
    "/update-voucher-by-id/:id",
    validateSchema(updateVoucherDto),
    updateVoucherByIdController
  )
  .delete("/remove-voucher-by-id/:id", removeVoucherByIdController);

export default router;
