// import express from "express";
// const router = express.Router();

// import {
//     createProductVariantController,
//     getAllProductVariantsController,
//     getProductVariantByIdController,
//     updateProductVariantByIdController,
//     removeProductVariantByIdController,

// } from "#src/modules/productVariants/productVariants.controller"
// import { createProductVariantDto } from "#src/modules/productVariants/dto/create-product-variants.dto";
// import { updateProductVariantDto } from "#src/modules/productVariants/dto/update-product-variants.dto";
// import {
//     validateBody,
// } from "#src/core/validations/request.validation";
// // import { hasPermission, isAuthorized } from "#src/middlewares/jwt-auth.middleware";

// // router.use([isAuthorized, hasPermission])
// router
//     .get("/get-product-variants", getAllProductVariantsController)
//     .get("/get-product-variant-by-id/:id", getProductVariantByIdController)
//     .post(
//         "/create-product-variant",
//         validateBody(createProductVariantDto),
//         createProductVariantController
//     )
//     .patch(
//         "/update-product-variant-by-id/:id",
//         validateBody(updateProductVariantDto),
//         updateProductVariantByIdController
//     )
//     .delete("/remove-product-variant-by-id/:id", removeProductVariantByIdController)

// export default router;
