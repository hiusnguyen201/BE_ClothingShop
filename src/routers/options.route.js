// import express from "express";
// const router = express.Router();

// import {
//     createOptionController,
//     getAllOptionsController,
//     getOptionByIdController,
//     updateOptionByIdController,
//     removeOptionByIdController,
//     isExistOptionNameController,
// } from "#src/modules/options/options.controller";
// import { createOptionDto } from "#src/modules/options/dto/create-option.dto";
// import { updateOptionDto } from "#src/modules/options/dto/update-option.dto";
// import { checkExistOptionNameDto } from "#src/modules/options/dto/check-exist-option-name.dto";
// import {
//     validateBody,
// } from "#src/core/validations/request.validation";
// // import { hasPermission, isAuthorized } from "#src/middlewares/jwt-auth.middleware";

// router.post(
//     "/is-exist-option-name",
//     validateBody(checkExistOptionNameDto),
//     isExistOptionNameController);

// // router.use([isAuthorized, hasPermission])
// router
//     .get("/get-options", getAllOptionsController)
//     .get("/get-option-by-id/:id", getOptionByIdController)
//     .post(
//         "/create-option",
//         validateBody(createOptionDto),
//         createOptionController
//     )
//     .patch(
//         "/update-option-by-id/:id",
//         validateBody(updateOptionDto),
//         updateOptionByIdController
//     )
//     .delete("/remove-option-by-id/:id", removeOptionByIdController)

// export default router;
