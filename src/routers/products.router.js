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
import { isAuthorizedAndHasPermission } from '#src/middlewares/jwt-auth.middleware';
import { UploadUtils } from '#src/utils/upload.util';

router.post('/is-exist-product-name', isExistProductNameController);

router
  .post(
    '/create-product',
    isAuthorizedAndHasPermission,
    UploadUtils.single({ field: 'thumbnail' }),
    createProductController,
  )
  .get('/get-products', isAuthorizedAndHasPermission, getAllProductsController)
  .get('/get-product-by-id/:productId', isAuthorizedAndHasPermission, getProductByIdController)
  .put(
    '/update-product-info/:productId',
    isAuthorizedAndHasPermission,
    UploadUtils.single({ field: 'thumbnail' }),
    updateProductInfoController,
  )
  .put('/update-product-variants/:productId', isAuthorizedAndHasPermission, updateProductVariantsController)
  .delete('/remove-product-by-id/:productId', isAuthorizedAndHasPermission, removeProductByIdController);

export default router;
