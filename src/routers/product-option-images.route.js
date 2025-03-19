// import express from "express";
// const router = express.Router();

// import {
//     createProductOptionImageController,
//     getAllProductOptionImagesController,
//     getProductOptionImageByIdController,
//     updateProductOptionImageByIdController,
//     removeProductOptionImageByIdController,
// } from "#src/modules/product_option_images/product_option_images.controller";
// import { createProductOptionImageDto } from "#src/modules/product_option_images/dto/create-product-option-image.dto";
// import { updateProductOptionImageDto } from "#src/modules/product_option_images/dto/update-product-option-image.dto";
// import {
//     validateBody,
// } from "#src/core/validations/request.validation";
// // import { hasPermission, isAuthorized } from "#src/middlewares/jwt-auth.middleware";

// // router.use([isAuthorized, hasPermission])
// router
//     .get("/get-product-option-images", getAllProductOptionImagesController)
//     .get("/get-product-option-image-by-id/:id", getProductOptionImageByIdController)
//     .post(
//         "/create-product-option-image",
//         validateBody(createProductOptionImageDto),
//         createProductOptionImageController
//     )
//     .patch(
//         "/update-product-option-image-by-id/:id",
//         validateBody(updateProductOptionImageDto),
//         updateProductOptionImageByIdController
//     )
//     .delete("/remove-product-option-image-by-id/:id", removeProductOptionImageByIdController)

// export default router;
