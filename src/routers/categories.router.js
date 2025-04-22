import express from 'express';
const router = express.Router();

import {
  createCategoryController,
  getAllCategoriesController,
  getCategoryByIdController,
  updateCategoryByIdController,
  removeCategoryByIdController,
  isExistCategoryNameController,
  getAllSubcategoriesController,
} from '#src/app/categories/categories.controller';
import { UploadUtils } from '#src/utils/upload.util';
import { isAuthorizedAndHasPermission } from '#src/middlewares/jwt-auth.middleware';

router.post('/is-exist-category-name', isExistCategoryNameController);

router
  .post(
    '/create-category',
    isAuthorizedAndHasPermission,
    UploadUtils.single({ field: 'image' }),
    createCategoryController,
  )
  .get('/get-categories', isAuthorizedAndHasPermission, getAllCategoriesController)
  .get('/get-category-by-id/:categoryId', isAuthorizedAndHasPermission, getCategoryByIdController)
  .put(
    '/update-category-by-id/:categoryId',
    isAuthorizedAndHasPermission,
    UploadUtils.single({ field: 'image' }),
    updateCategoryByIdController,
  )
  .delete('/remove-category-by-id/:categoryId', isAuthorizedAndHasPermission, removeCategoryByIdController)
  .get('/:categoryId/subcategories', isAuthorizedAndHasPermission, getAllSubcategoriesController);

export default router;
