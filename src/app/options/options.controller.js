// import HttpStatus from "http-status-codes";
// import {
//   NotFoundException,
// } from "#src/core/exception/http-exception";

// import {
//   createProductOptionService,
//   getAllProductOptionsService,
//   countAllProductOptionsService,
//   getProductOptionByIdService,
//   updateProductOptionByIdService,
//   removeProductOptionByIdService,
// } from "#src/modules/product_options/product_options.service"
// import { calculatePagination } from "#src/utils/pagination.util";

// export const createProductOptionController = async (req) => {

//   const newProductOption = await createProductOptionService(req.body);

//   return {
//     statusCode: HttpStatus.CREATED,
//     message: "Create product option successfully",
//     data: newProductOption,
//   };
// };

// export const getAllProductOptionsController = async (req) => {
//   let { keyword = "", limit = 10, page = 1 } = req.query;

//   const filterOptions = {
//     $or: [
//       { name: { $regex: keyword, $options: "i" } },
//     ],
//   };

//   const totalCount = await countAllProductOptionsService(filterOptions);
//   const metaData = calculatePagination(page, limit, totalCount);

//   const productOptions = await getAllProductOptionsService({
//     filters: filterOptions,
//     offset: metaData.offset,
//     limit: metaData.limit,
//   });

//   return {
//     statusCode: HttpStatus.OK,
//     message: "Get all product options successfully",
//     data: {
//       meta: metaData,
//       list: productOptions,
//     },
//   };
// };

// export const getProductOptionByIdController = async (req) => {
//   const { id } = req.params;
//   const existProductOption = await getProductOptionByIdService(id);
//   if (!existProductOption) {
//     throw new NotFoundException("Product option not found");
//   }

//   return {
//     statusCode: HttpStatus.OK,
//     message: "Get one product option successfully",
//     data: existProductOption,
//   };
// };

// export const updateProductOptionByIdController = async (req) => {
//   const { id } = req.params;

//   const existProductOption = await getProductOptionByIdService(id, "_id");
//   if (!existProductOption) {
//     throw new NotFoundException("Product optoion not found");
//   }

//   const updatedProductOption = await updateProductOptionByIdService(id, req.body);

//   return {
//     statusCode: HttpStatus.OK,
//     message: "Update product option successfully",
//     data: updatedProductOption,
//   };
// };

// export const removeProductOptionByIdController = async (req) => {
//   const { id } = req.params;
//   const existProductOption = await getProductOptionByIdService(id, "_id");
//   if (!existProductOption) {
//     throw new NotFoundException("Product option not found");
//   }
//   const removedProductOption = await removeProductOptionByIdService(id);

//   return {
//     statusCode: HttpStatus.OK,
//     message: "Remove product option successfully",
//     data: removedProductOption,
//   };
// };