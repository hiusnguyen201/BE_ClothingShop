import express from 'express';
const router = express.Router();

import {
  createCategoryController,
  getAllCategoriesController,
  getCategoryByIdController,
  updateCategoryByIdController,
  removeCategoryByIdController,
  isExistCategoryNameController,
} from '#src/app/categories/categories.controller';
import { CreateCategoryDto } from '#src/app/categories/dtos/create-category.dto';
import { UpdateCategoryDto } from '#src/app/categories/dtos/update-category.dto';
import { CheckExistCategoryNameDto } from '#src/app/categories/dtos/check-exist-category-name.dto';
import { validateBody, validateQuery } from '#src/core/validations/request.validation';
import { UploadUtils } from '#src/utils/upload.util';
import { isAuthorizedAndHasPermission } from '#src/middlewares/jwt-auth.middleware';
import { GetListCategoryDto } from '#src/app/categories/dtos/get-list-category.dto';

router.post('/is-exist-category-name', validateBody(CheckExistCategoryNameDto), isExistCategoryNameController);

router
  .post(
    '/create-category',
    isAuthorizedAndHasPermission,
    UploadUtils.single({ field: 'image' }),
    validateBody(CreateCategoryDto),
    createCategoryController,
  )
  .get('/get-categories', isAuthorizedAndHasPermission, validateQuery(GetListCategoryDto), getAllCategoriesController)
  .get('/get-category-by-id/:categoryId', isAuthorizedAndHasPermission, getCategoryByIdController)
  .put(
    '/update-category-by-id/:categoryId',
    isAuthorizedAndHasPermission,
    UploadUtils.single({ field: 'image' }),
    validateBody(UpdateCategoryDto),
    updateCategoryByIdController,
  )
  .delete('/remove-category-by-id/:categoryId', isAuthorizedAndHasPermission, removeCategoryByIdController);

export default router;
