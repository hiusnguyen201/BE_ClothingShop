import express from 'express';
const router = express.Router();

import {
  createProductController,
  getAllProductsController,
  getProductByIdController,
  updateProductVariantsController,
  removeProductByIdController,
  isExistProductNameController,
  updateProductInfoController,
} from '#src/app/products/products.controller';
import { CreateProductDto } from '#src/app/products/dtos/create-product.dto';
import { updateProductInfoDto } from '#src/app/products/dtos/update-product-info.dto';
import { checkExistProductNameDto } from '#src/app/products/dtos/check-exist-product-name.dto';
import { validateBody, validateParams, validateQuery } from '#src/core/validations/request.validation';
import { isAuthorizedAndHasPermission } from '#src/middlewares/jwt-auth.middleware';
import { GetListProductDto } from '#src/app/products/dtos/get-list-product.dto';
import { GetProductDto } from '#src/app/products/dtos/get-product.dto';
import { UploadUtils } from '#src/utils/upload.util';
import { updateProductVariantsDto } from '#src/app/products/dtos/update-product-variants.dto';

router.post('/is-exist-product-name', validateBody(checkExistProductNameDto), isExistProductNameController);

router
  .post(
    '/create-product',
    isAuthorizedAndHasPermission,
    UploadUtils.single({ field: 'thumbnail' }),
    validateBody(CreateProductDto),
    createProductController,
  )
  .get('/get-products', isAuthorizedAndHasPermission, validateQuery(GetListProductDto), getAllProductsController)
  .get(
    '/get-product-by-id/:productId',
    isAuthorizedAndHasPermission,
    validateParams(GetProductDto),
    getProductByIdController,
  )
  .put(
    '/update-product-info/:productId',
    isAuthorizedAndHasPermission,
    UploadUtils.single({ field: 'thumbnail' }),
    validateParams(GetProductDto),
    validateBody(updateProductInfoDto),
    updateProductInfoController,
  )
  .put(
    '/update-product-variants/:productId',
    isAuthorizedAndHasPermission,
    validateParams(GetProductDto),
    validateBody(updateProductVariantsDto),
    updateProductVariantsController,
  )
  .delete(
    '/remove-product-by-id/:productId',
    isAuthorizedAndHasPermission,
    validateParams(GetProductDto),
    removeProductByIdController,
  );

export default router;
