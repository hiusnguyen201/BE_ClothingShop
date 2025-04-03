import express from "express";
const router = express.Router();

import {
    createTagController,
    getAllTagsController,
    getTagByIdController,
    updateTagByIdController,
    removeTagByIdController,
    isExistTagNameController,
} from "#src/app/tags/tags.controller";
import { createTagDto } from "#src/app/tags/dtos/create-tag.dto";
import { updateTagDto } from "#src/app/tags/dtos/update-tag.dto";
import { checkExistTagNameDto } from "#src/app/tags/dtos/check-exist-tag-name.dto";
import {
    validateBody,
} from "#src/core/validations/request.validation";
// import { hasPermission, isAuthorized } from "#src/middlewares/jwt-auth.middleware";

router.post(
    "/is-exist-tag-name",
    validateBody(checkExistTagNameDto),
    isExistTagNameController
);

// router.use([isAuthorized, hasPermission])
router
    .get("/get-tags", getAllTagsController)
    .get("/get-tag-by-id/:id", getTagByIdController)
    .post(
        "/create-tag",
        validateBody(createTagDto),
        createTagController
    )
    .patch(
        "/update-tag-by-id/:id",
        validateBody(updateTagDto),
        updateTagByIdController
    )
    .delete("/remove-tag-by-id/:id", removeTagByIdController)

export default router;
