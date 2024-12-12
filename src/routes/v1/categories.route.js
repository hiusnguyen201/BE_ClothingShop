import express from "express";
const router = express.Router();

import {
    createCategoryController,
    getAllCategoriesController,
    getCategoryByIdController,
    updateCategoryByIdController,
    removeCategoryByIdController
} from "#src/modules/categories/categories.controller";
import { createCategoryDto } from "#src/modules/categories/dto/create-category.dto";
import { updateCategoryDto } from "#src/modules/categories/dto/update-category.dto";
import {
    validateSchema,
    validateFile,
} from "#src/middlewares/validate-request.middleware";
import { UploadUtils } from "#src/utils/upload.util";
import { ALLOW_ICON_MIME_TYPES } from "#src/core/constant";
const upload = UploadUtils.config({
    allowedMimeTypes: ALLOW_ICON_MIME_TYPES,
});

router
    .get("/get-categories", getAllCategoriesController)
    .get("/get-category-by-id/:id", getCategoryByIdController)
    .post(
        "/create-category",
        validateFile(upload.single("icon")),
        validateSchema(createCategoryDto),
        createCategoryController
    )
    .patch(
        "/update-category-by-id/:id",
        validateFile(upload.single("icon")),
        validateSchema(updateCategoryDto),
        updateCategoryByIdController
    )
    .delete("/remove-category-by-id/:id", removeCategoryByIdController);

export default router;
