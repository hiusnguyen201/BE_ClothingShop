// import HttpStatus from "http-status-codes";
// import {
//   NotFoundException,
// } from "#src/core/exception/http-exception";

// import {
//   createProductVariantService,
//   getAllProductVariantsService,
//   getProductVariantByIdService,
//   updateProductVariantByIdService,
//   removeProductVariantByIdService,
//   countAllProductVariantsService,

// } from "#src/modules/productVariants/productVariants.service"
// import { calculatePagination } from "#src/utils/pagination.util";

// export const createProductVariantController = async (req) => {

//   const newProductVariant = await createProductVariantService({
//     ...req.body,
//   });

//   return {
//     statusCode: HttpStatus.CREATED,
//     message: "Create product variant successfully",
//     data: newProductVariant,
//   };
// };

// export const getAllProductVariantsController = async (req) => {
//   let { keyword = "", available = false, limit = 10, page = 1 } = req.query;

//   const filterOptions = {
//     $or: [
//       { option1: { $regex: keyword, $options: "i" } },
//       { option2: { $regex: keyword, $options: "i" } },
//       { option3: { $regex: keyword, $options: "i" } },
//     ],
//     ...(available ? { available } : {}),
//   };

//   const totalCount = await countAllProductVariantsService(filterOptions);
//   const metaData = calculatePagination(page, limit, totalCount);

//   const productVariants = await getAllProductVariantsService({
//     filters: filterOptions,
//     offset: metaData.offset,
//     limit: metaData.limit,
//   });

//   return {
//     statusCode: HttpStatus.OK,
//     message: "Get all product variants successfully",
//     data: {
//       meta: metaData,
//       list: productVariants,
//     },
//   };
// };

// export const getProductVariantByIdController = async (req) => {
//   const { id } = req.params;
//   const existProductVariant = await getProductVariantByIdService(id);
//   if (!existProductVariant) {
//     throw new NotFoundException("Product variant not found");
//   }

//   return {
//     statusCode: HttpStatus.OK,
//     message: "Get one product variant successfully",
//     data: existProductVariant,
//   };
// };

// export const updateProductVariantByIdController = async (req) => {
//   const { id } = req.params;
//   const existProductVariant = await getProductVariantByIdService(id, "_id");
//   if (!existProductVariant) {
//     throw new NotFoundException("Product variant not found");
//   }

//   const updatedProductVariant = await updateProductVariantByIdService(id, req.body);

//   return {
//     statusCode: HttpStatus.OK,
//     message: "Update product variant successfully",
//     data: updatedProductVariant,
//   };
// };

// export const removeProductVariantByIdController = async (req) => {
//   const { id } = req.params;
//   const existProductVariant = await getProductVariantByIdService(id, "_id");
//   if (!existProductVariant) {
//     throw new NotFoundException("Product variant not found");
//   }

//   const removedProductVariant = await removeProductVariantByIdService(id);

//   return {
//     statusCode: HttpStatus.OK,
//     message: "Remove product variant successfully",
//     data: removedProductVariant,
//   };
// };