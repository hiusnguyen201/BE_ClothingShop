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
import { isAuthorized, can } from '#src/middlewares/jwt-auth.middleware';
import { UploadUtils } from '#src/utils/upload.util';
import { PRODUCTS_PERMISSIONS } from '#src/database/data/permissions-data';

router.post('/is-exist-product-name', isExistProductNameController);

router
  .post(
    '/create-product',
    isAuthorized,
    can([PRODUCTS_PERMISSIONS.CREATE_PRODUCT.name]),
    UploadUtils.single({ field: 'thumbnail' }),
    createProductController,
  )
  .get('/get-products', isAuthorized, can([PRODUCTS_PERMISSIONS.GET_PRODUCTS.name]), getAllProductsController)
  .get(
    '/get-product-by-id/:productId',
    isAuthorized,
    can([PRODUCTS_PERMISSIONS.GET_DETAILS_PRODUCT.name]),
    getProductByIdController,
  )
  .put(
    '/update-product-info/:productId',
    isAuthorized,
    can([PRODUCTS_PERMISSIONS.EDIT_PRODUCT_INFO.name]),
    UploadUtils.single({ field: 'thumbnail' }),
    updateProductInfoController,
  )
  .put(
    '/update-product-variants/:productId',
    isAuthorized,
    can([PRODUCTS_PERMISSIONS.EDIT_PRODUCT_VARIANTS.name]),
    updateProductVariantsController,
  )
  .delete(
    '/remove-product-by-id/:productId',
    isAuthorized,
    can([PRODUCTS_PERMISSIONS.REMOVE_PRODUCT.name]),
    removeProductByIdController,
  );

export default router;
