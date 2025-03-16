import express from 'express';
const router = express.Router();

import {
  createCategoryController,
  getAllCategoriesController,
  getCategoryByIdController,
  updateCategoryByIdController,
  removeCategoryByIdController,
  isExistCategoryNameController,
  showCategoryByIdController,
  hideCategoryByIdController,
} from '#src/app/v1/categories/categories.controller';
import { CreateCategoryDto } from '#src/app/v1/categories/dtos/create-category.dto';
import { UpdateCategoryDto } from '#src/app/v1/categories/dtos/update-category.dto';
import { CheckExistCategoryNameDto } from '#src/app/v1/categories/dtos/check-exist-category-name.dto';
import { validateBody, validateFile } from '#src/core/validations/request.validation';
import { UploadUtils } from '#src/utils/upload.util';
import { ALLOW_IMAGE_MIME_TYPES } from '#src/core/constant';
import { isAuthorizedAndHasPermission } from '#src/middlewares/jwt-auth.middleware';
const upload = UploadUtils.config({
  allowedMimeTypes: ALLOW_IMAGE_MIME_TYPES,
});

router.post('/is-exist-category-name', validateBody(CheckExistCategoryNameDto), isExistCategoryNameController);

router.use([isAuthorizedAndHasPermission]);
router
  .get('/get-categories', getAllCategoriesController)
  .get('/get-category-by-id/:id', getCategoryByIdController)
  .post(
    '/create-category',
    validateFile(upload.single('image')),
    validateBody(CreateCategoryDto),
    createCategoryController,
  )
  .patch(
    '/update-category-by-id/:id',
    validateFile(upload.single('image')),
    validateBody(UpdateCategoryDto),
    updateCategoryByIdController,
  )
  .delete('/remove-category-by-id/:id', removeCategoryByIdController)
  .patch('/show-category-by-id/:id', showCategoryByIdController)
  .patch('/hide-category-by-id/:id', hideCategoryByIdController);

export default router;
