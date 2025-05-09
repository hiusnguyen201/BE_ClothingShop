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
import { isAuthorized, can } from '#src/middlewares/jwt-auth.middleware';
import { CATEGORIES_PERMISSIONS } from '#src/database/data/permissions-data';

router.post('/is-exist-category-name', isExistCategoryNameController);

router
  .post(
    '/create-category',
    isAuthorized,
    can([CATEGORIES_PERMISSIONS.CREATE_CATEGORY.name]),
    UploadUtils.single({ field: 'image' }),
    createCategoryController,
  )
  .get('/get-categories', isAuthorized, can([CATEGORIES_PERMISSIONS.GET_CATEGORIES.name]), getAllCategoriesController)
  .get(
    '/get-category-by-id/:categoryId',
    isAuthorized,
    can([CATEGORIES_PERMISSIONS.GET_CATEGORY_DETAILS.name]),
    getCategoryByIdController,
  )
  .put(
    '/update-category-by-id/:categoryId',
    isAuthorized,
    can([CATEGORIES_PERMISSIONS.EDIT_CATEGORY.name]),
    UploadUtils.single({ field: 'image' }),
    updateCategoryByIdController,
  )
  .delete(
    '/remove-category-by-id/:categoryId',
    isAuthorized,
    can([CATEGORIES_PERMISSIONS.REMOVE_CATEGORY.name]),
    removeCategoryByIdController,
  )
  .get(
    '/:categoryId/subcategories',
    isAuthorized,
    can([CATEGORIES_PERMISSIONS.GET_SUB_CATEGORIES.name]),
    getAllSubcategoriesController,
  );

export default router;
