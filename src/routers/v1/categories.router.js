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
} from '#app/v1/categories/categories.controller';
import { createCategoryDto } from '#app/v1/categories/dtos/create-category.dto';
import { updateCategoryDto } from '#app/v1/categories/dtos/update-category.dto';
import { checkExistCategoryNameDto } from '#app/v1/categories/dtos/check-exist-category-name.dto';
import { validateBody, validateFile } from '#core/validations/request.validation';
import { UploadUtils } from '#utils/upload.util';
import { ALLOW_IMAGE_MIME_TYPES } from '#core/constant';
import { isAuthorizedAndHasPermission } from '#middlewares/jwt-auth.middleware';
const upload = UploadUtils.config({
  allowedMimeTypes: ALLOW_IMAGE_MIME_TYPES,
});

router.post('/is-exist-category-name', validateBody(checkExistCategoryNameDto), isExistCategoryNameController);

router.use([isAuthorizedAndHasPermission]);
router
  .get('/get-categories', getAllCategoriesController)
  .get('/get-category-by-id/:id', getCategoryByIdController)
  .post(
    '/create-category',
    validateFile(upload.single('image')),
    validateBody(createCategoryDto),
    createCategoryController,
  )
  .patch(
    '/update-category-by-id/:id',
    validateFile(upload.single('image')),
    validateBody(updateCategoryDto),
    updateCategoryByIdController,
  )
  .delete('/remove-category-by-id/:id', removeCategoryByIdController)
  .patch('/show-category-by-id/:id', showCategoryByIdController)
  .patch('/hide-category-by-id/:id', hideCategoryByIdController);

export default router;
