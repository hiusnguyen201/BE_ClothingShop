import express from "express";
const router = express.Router();

import {
  createShippingAddressController,
  getAllShippingAddressController,
  getShippingAddressByIdController,
  updateShippingAddressByIdController,
  removeShippingAddressByIdController,
  setDefaultShippingAddressByIdController,
} from "#src/app/shipping-address/shipping-address.controller";
import { createShippingAddressDto } from "#src/app/shipping-address/dtos/create-shipping-address.dto";
import { updateShippingAddressDto } from "#src/app/shipping-address/dtos/update-shipping-address.dto";
import { isAuthorizedAndIsCustomer } from "#src/middlewares/jwt-auth.middleware";
import {
  validateBody,
  validateQuery
} from '#src/core/validations/request.validation';
import { GetListShippingAddressDto } from "#src/app/shipping-address/dtos/get-list-shipping-address.dto";

router
  .get(
    "/get-shipping-address",
    isAuthorizedAndIsCustomer,
    validateQuery(GetListShippingAddressDto),
    getAllShippingAddressController
  )
  .get(
    "/get-shipping-address-by-id/:shippingAddressId",
    isAuthorizedAndIsCustomer,
    getShippingAddressByIdController
  )
  .post(
    "/create-shipping-address",
    isAuthorizedAndIsCustomer,
    validateBody(createShippingAddressDto),
    createShippingAddressController
  )
  .put(
    "/update-shipping-address-by-id/:shippingAddressId",
    isAuthorizedAndIsCustomer,
    validateBody(updateShippingAddressDto),
    updateShippingAddressByIdController
  )
  .delete(
    "/remove-shipping-address-by-id/:shippingAddressId",
    isAuthorizedAndIsCustomer,
    removeShippingAddressByIdController
  )
  .patch(
    "/set-default-by-id/:shippingAddressId",
    isAuthorizedAndIsCustomer,
    setDefaultShippingAddressByIdController
  );

export default router;
