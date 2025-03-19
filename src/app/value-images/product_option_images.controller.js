// import HttpStatus from "http-status-codes";
// import {
//   NotFoundException,
// } from "#src/core/exception/http-exception";

// import {
//   createProductOptionImageService,
//   getAllProductOptionImagesService,
//   countAllProductOptionImagesService,
//   getProductOptionImageByIdService,
//   updateProductOptionImageByIdService,
//   removeProductOptionImageByIdService,
// } from "#src/modules/value_images/product_option_images.service"
// import { calculatePagination } from "#src/utils/pagination.util";

// export const createProductOptionImageController = async (req) => {

//   const newProductOptionImage = await createProductOptionImageService(req.body);

//   return {
//     statusCode: HttpStatus.CREATED,
//     message: "Create product option image successfully",
//     data: newProductOptionImage,
//   };
// };

// export const getAllProductOptionImagesController = async (req) => {
//   let { product_option = "", limit = 10, page = 1 } = req.query;

//   const filterOptionImages = {
//     ...(product_option ? { product_option } : {})
//   };

//   const totalCount = await countAllProductOptionImagesService(filterOptionImages);
//   const metaData = calculatePagination(page, limit, totalCount);

//   const productOptionImages = await getAllProductOptionImagesService({
//     filters: filterOptionImages,
//     offset: metaData.offset,
//     limit: metaData.limit,
//   });

//   return {
//     statusCode: HttpStatus.OK,
//     message: "Get all product option images successfully",
//     data: {
//       meta: metaData,
//       list: productOptionImages,
//     },
//   };
// };

// export const getProductOptionImageByIdController = async (req) => {
//   const { id } = req.params;
//   const existProductOptionImage = await getProductOptionImageByIdService(id);
//   if (!existProductOptionImage) {
//     throw new NotFoundException("Product option image not found");
//   }

//   return {
//     statusCode: HttpStatus.OK,
//     message: "Get one product option image successfully",
//     data: existProductOptionImage,
//   };
// };

// export const updateProductOptionImageByIdController = async (req) => {
//   const { id } = req.params;

//   const existProductOptionImage = await getProductOptionImageByIdService(id, "_id");
//   if (!existProductOptionImage) {
//     throw new NotFoundException("Product option image not found");
//   }

//   const updatedProductOptionImage = await updateProductOptionImageByIdService(id, req.body);

//   return {
//     statusCode: HttpStatus.OK,
//     message: "Update product option image successfully",
//     data: updatedProductOptionImage,
//   };
// };

// export const removeProductOptionImageByIdController = async (req) => {
//   const { id } = req.params;
//   const existProductOptionImage = await getProductOptionImageByIdService(id, "_id");
//   if (!existProductOptionImage) {
//     throw new NotFoundException("Product option image not found");
//   }
//   const removedProductOptionImage = await removeProductOptionImageByIdService(id);

//   return {
//     statusCode: HttpStatus.OK,
//     message: "Remove product option image successfully",
//     data: removedProductOptionImage,
//   };
// };