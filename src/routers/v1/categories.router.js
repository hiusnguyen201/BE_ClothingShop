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
} from '#app/categories/categories.controller';
import { createCategoryDto } from '#app/categories/dto/create-category.dto';
import { updateCategoryDto } from '#app/categories/dto/update-category.dto';
import { checkExistCategoryNameDto } from '#app/categories/dto/check-exist-category-name.dto';
import { validateSchema, validateFile } from '#middlewares/validate-request.middleware';
import { UploadUtils } from '#utils/upload.util';
import { ALLOW_IMAGE_MIME_TYPES } from '#core/constant';
import { isAuthorizedAndHasPermission } from '#src/middlewares/jwt-auth.middleware';
const upload = UploadUtils.config({
  allowedMimeTypes: ALLOW_IMAGE_MIME_TYPES,
});

router.post('/is-exist-category-name', validateSchema(checkExistCategoryNameDto), isExistCategoryNameController);

router.use([isAuthorizedAndHasPermission]);
router
  .get('/get-categories', getAllCategoriesController)
  .get('/get-category-by-id/:id', getCategoryByIdController)
  .post(
    '/create-category',
    validateFile(upload.single('image')),
    validateSchema(createCategoryDto),
    createCategoryController,
  )
  .patch(
    '/update-category-by-id/:id',
    validateFile(upload.single('image')),
    validateSchema(updateCategoryDto),
    updateCategoryByIdController,
  )
  .delete('/remove-category-by-id/:id', removeCategoryByIdController)
  .patch('/show-category-by-id/:id', showCategoryByIdController)
  .patch('/hide-category-by-id/:id', hideCategoryByIdController);

export default router;
