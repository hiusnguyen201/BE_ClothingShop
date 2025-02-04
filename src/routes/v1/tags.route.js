import express from "express";
const router = express.Router();

import {
    createTagController,
    getAllTagsController,
    getTagByIdController,
    updateTagByIdController,
    removeTagByIdController,
    isExistTagNameController,
} from "#src/modules/tags/tags.controller";
import { createTagDto } from "#src/modules/tags/dto/create-tag.dto";
import { updateTagDto } from "#src/modules/tags/dto/update-tag.dto";
import { checkExistTagNameDto } from "#src/modules/tags/dto/check-exist-tag-name.dto";
import {
    validateSchema,
} from "#src/middlewares/validate-request.middleware";
// import { hasPermission, isAuthorized } from "#src/middlewares/jwt-auth.middleware";

router.post(
    "/is-exist-tag-name",
    validateSchema(checkExistTagNameDto),
    isExistTagNameController
);

// router.use([isAuthorized, hasPermission])
router
    .get("/get-tags", getAllTagsController)
    .get("/get-tag-by-id/:id", getTagByIdController)
    .post(
        "/create-tag",
        validateSchema(createTagDto),
        createTagController
    )
    .patch(
        "/update-tag-by-id/:id",
        validateSchema(updateTagDto),
        updateTagByIdController
    )
    .delete("/remove-tag-by-id/:id", removeTagByIdController)

export default router;
