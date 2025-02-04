import HttpStatus from "http-status-codes";
import {
  ConflictException,
  NotFoundException,
  PreconditionFailedException,
} from "#src/core/exception/http-exception";

import {
  createProductService,
  getAllProductsService,
  getProductByIdService,
  updateProductByIdService,
  removeProductByIdService,
  checkExistProductNameService,
  countAllProductsService,
  showProductService,
  hideProductService,
} from "#src/modules/products/products.service";
import { calculatePagination } from "#src/utils/pagination.util";
import { makeSlug } from "#src/utils/string.util";

export const createProductController = async (req) => {
  const { name } = req.body;
  const isExistProduct = await checkExistProductNameService(name);
  if (isExistProduct) {
    throw new ConflictException("Product name already exist");
  }

  const newProduct = await createProductService({
    ...req.body,
    slug: makeSlug(name),
  });

  return {
    statusCode: HttpStatus.CREATED,
    message: "Create product successfully",
    data: newProduct,
  };
};

export const getAllProductsController = async (req) => {
  let { keyword = "", is_hidden = false, limit = 10, page = 1 } = req.query;

  const filterOptions = {
    $or: [
      { name: { $regex: keyword, $options: "i" } },
    ],
    ...(is_hidden ? { is_hidden } : {}),
  };

  const totalCount = await countAllProductsService(filterOptions);
  const metaData = calculatePagination(page, limit, totalCount);

  const products = await getAllProductsService({
    filters: filterOptions,
    offset: metaData.offset,
    limit: metaData.limit,
  });

  return {
    statusCode: HttpStatus.OK,
    message: "Get all products successfully",
    data: {
      meta: metaData,
      list: products,
    },
  };
};

export const getProductByIdController = async (req) => {
  const { id } = req.params;
  const existProduct = await getProductByIdService(id);
  if (!existProduct) {
    throw new NotFoundException("Product not found");
  }

  return {
    statusCode: HttpStatus.OK,
    message: "Get one product successfully",
    data: existProduct,
  };
};

export const updateProductByIdController = async (req) => {
  const { id } = req.params;
  const { name } = req.body;

  const existProduct = await getProductByIdService(id, "_id");
  if (!existProduct) {
    throw new NotFoundException("Product not found");
  }

  if (name) {
    const isExistName = await checkExistProductNameService(
      name,
      existProduct._id
    );
    if (isExistName) {
      throw new ConflictException("Product name already exist");
    }
    req.body.slug = makeSlug(name);
  }

  const updatedProduct = await updateProductByIdService(id, req.body);

  return {
    statusCode: HttpStatus.OK,
    message: "Update product successfully",
    data: updatedProduct,
  };
};

export const removeProductByIdController = async (req) => {
  const { id } = req.params;
  const existProduct = await getProductByIdService(id, "_id is_hidden");
  if (!existProduct) {
    throw new NotFoundException("Product not found");
  }

  if (!existProduct) {
    throw new PreconditionFailedException("Product is public");
  }

  const removedProduct = await removeProductByIdService(id);

  return {
    statusCode: HttpStatus.OK,
    message: "Remove product successfully",
    data: removedProduct,
  };
};

export const isExistProductNameController = async (req) => {
  const { name } = req.body;
  const isExistName = await checkExistProductNameService(name);

  return {
    statusCode: HttpStatus.OK,
    message: isExistName
      ? "Product name exists"
      : "Product name does not exist",
    data: isExistName,
  };
};

export const showProductByIdController = async (req) => {
  const { id } = req.params;
  const existProduct = await getProductByIdService(id, "_id");
  if (!existProduct) {
    throw new NotFoundException("Product not found");
  }

  await showProductService(id);

  return {
    statusCode: HttpStatus.NO_CONTENT,
    message: "Show product successfully",
  };
};

export const hideProductByIdController = async (req) => {
  const { id } = req.params;
  const existProduct = await getProductByIdService(id, "_id");
  if (!existProduct) {
    throw new NotFoundException("Product not found");
  }

  await hideProductService(id);

  return {
    statusCode: HttpStatus.NO_CONTENT,
    message: "Hide product successfully",
  };
};