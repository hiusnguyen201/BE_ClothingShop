// import express from "express";
// const router = express.Router();

// import {
//     createProductOptionController,
//     getAllProductOptionsController,
//     getProductOptionByIdController,
//     updateProductOptionByIdController,
//     removeProductOptionByIdController,
// } from "#src/modules/product_options/product_options.controller";
// import { createProductOptionDto } from "#src/modules/product_options/dto/create-product-options.dto";
// import { updateProductOptionDto } from "#src/modules/product_options/dto/update-product-options.dto";
// import {
//     validateSchema,
// } from "#src/middlewares/validate-request.middleware";
// // import { hasPermission, isAuthorized } from "#src/middlewares/jwt-auth.middleware";

// // router.use([isAuthorized, hasPermission])
// router
//     .get("/get-product-options", getAllProductOptionsController)
//     .get("/get-product-option-by-id/:id", getProductOptionByIdController)
//     .post(
//         "/create-product-option",
//         validateSchema(createProductOptionDto),
//         createProductOptionController
//     )
//     .patch(
//         "/update-product-option-by-id/:id",
//         validateSchema(updateProductOptionDto),
//         updateProductOptionByIdController
//     )
//     .delete("/remove-product-option-by-id/:id", removeProductOptionByIdController)

// export default router;
