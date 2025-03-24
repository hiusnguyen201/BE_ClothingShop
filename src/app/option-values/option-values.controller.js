// import HttpStatus from "http-status-codes";
// import {
//   HttpException,
// } from "#src/core/exception/http-exception";

// import {
//   createOptionService,
//   countAllOptionsService,
//   getAllOptionsService,
//   getOptionByIdService,
//   updateOptionByIdService,
//   removeOptionByIdService,
//   checkExistOptionNameService,
// } from "#src/modules/options/options.service"
// import { calculatePagination } from "#src/utils/pagination.util";

// export const createOptionController = async (req) => {
//   const { name } = req.body;
//   const isExistOptionName = await checkExistOptionNameService(name);

//   if (isExistOptionName) {
//     throw new ConflictException("Option name is exist");
//   }

//   const newOption = await createOptionService(req.body);

//   return {
//     statusCode: HttpStatus.CREATED,
//     message: "Create option successfully",
//     data: newOption,
//   };
// };

// export const getAllOptionsController = async (req) => {
//   let { keyword = "", limit = 10, page = 1 } = req.query;

//   const filterOptions = {
//     $or: [
//       { name: { $regex: keyword, $options: "i" } },
//     ],
//   };

//   const totalCount = await countAllOptionsService(filterOptions);
//   const metaData = calculatePagination(page, limit, totalCount);

//   const options = await getAllOptionsService({
//     filters: filterOptions,
//     offset: metaData.offset,
//     limit: metaData.limit,
//   });

//   return {
//     statusCode: HttpStatus.OK,
//     message: "Get all options successfully",
//     data: {
//       meta: metaData,
//       list: options,
//     },
//   };
// };

// export const getOptionByIdController = async (req) => {
//   const { id } = req.params;
//   const existOption = await getOptionByIdService(id);
//   if (!existOption) {
//     throw new NotFoundException("Option not found");
//   }

//   return {
//     statusCode: HttpStatus.OK,
//     message: "Get one option successfully",
//     data: existOption,
//   };
// };

// export const updateOptionByIdController = async (req) => {
//   const { id } = req.params;
//   const { name } = req.body;

//   const existOption = await getOptionByIdService(id, "_id");
//   if (!existOption) {
//     throw new NotFoundException("Option not found");
//   }

//   if (name) {
//     const isExistName = await checkExistOptionNameService(
//       name,
//       existOption._id
//     );
//     if (isExistName) {
//       throw new ConflictException("Option name already exist");
//     }
//     req.body.slug = name
//   }

//   const updatedOption = await updateOptionByIdService(id, req.body);

//   return {
//     statusCode: HttpStatus.OK,
//     message: "Update option successfully",
//     data: updatedOption,
//   };
// };

// export const removeOptionByIdController = async (req) => {
//   const { id } = req.params;
//   const existOption = await getOptionByIdService(id, "_id");
//   if (!existOption) {
//     throw new NotFoundException("Option not found");
//   }

//   const removedOption = await removeOptionByIdService(id);

//   return {
//     statusCode: HttpStatus.OK,
//     message: "Remove option successfully",
//     data: removedOption,
//   };
// };

// export const isExistOptionNameController = async (req) => {
//   const { name } = req.body;
//   const isExistName = await checkExistOptionNameService(name);

//   return {
//     statusCode: HttpStatus.OK,
//     message: isExistName
//       ? "Option name exists"
//       : "Option name does not exist",
//     data: isExistName,
//   };
// };