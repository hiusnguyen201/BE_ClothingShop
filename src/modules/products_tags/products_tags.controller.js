import HttpStatus from "http-status-codes";
import {
  NotFoundException,
} from "#src/core/exception/http-exception";

import {
  createProductTagsService,
  getTagByIdService,
  getProductByIdService,
  countAllProductsTagsService,
  getAllProductsTagsService,
  getProductTagByIdService,
  removeProductTagByIdService,
  getExistProductTagService,
} from "#src/modules/products_tags/products_tags.service"
import { calculatePagination } from "#src/utils/pagination.util";

export const createProductTagsController = async (req) => {
  const { product, tags } = req.body;
  const isExistProduct = await getProductByIdService(product);

  if (!isExistProduct) {
    throw new NotFoundException("Product not found");
  }

  const uniqueTags = [...new Set(tags)];
  const uniqueTagsValid = await Promise.all(
    uniqueTags.map(async (item) => {
      return getTagByIdService(item);
    })
  );
  const tagIds = uniqueTagsValid.filter(Boolean).map(tag => tag._id);

  const existingTags = await getExistProductTagService(isExistProduct._id, tagIds);

  const tagsCanAdd = tagIds.filter(
    tag => !existingTags.some(existing => existing.tag.toString() === tag.toString())
  );

  const tagDocs = tagsCanAdd.map(tag => ({
    product: isExistProduct._id,
    tag: tag
  }));

  const result = await createProductTagsService(tagDocs);

  return {
    statusCode: HttpStatus.CREATED,
    message: "Create product tags successfully",
    data: result,
  };
};

export const getAllProductsTagsController = async (req) => {
  let { product = "", tag = "", limit = 10, page = 1 } = req.query;

  const filterOptions = {
    ...(product ? { product } : {}),
    ...(tag ? { tag } : {})
  };

  const totalCount = await countAllProductsTagsService(filterOptions);
  const metaData = calculatePagination(page, limit, totalCount);

  const productsTags = await getAllProductsTagsService({
    filters: filterOptions,
    offset: metaData.offset,
    limit: metaData.limit,
  });

  return {
    statusCode: HttpStatus.OK,
    message: "Get all products tags successfully",
    data: {
      meta: metaData,
      list: productsTags,
    },
  };
};

export const getProductTagByIdController = async (req) => {
  const { id } = req.params;
  const existProductTag = await getProductTagByIdService(id);
  if (!existProductTag) {
    throw new NotFoundException("Product tag not found");
  }

  return {
    statusCode: HttpStatus.OK,
    message: "Get one product tag successfully",
    data: existProductTag,
  };
};

export const removeProductTagByIdController = async (req) => {
  const { productId } = req.params;
  const { tags } = req.body;
  const isExistProduct = await getProductByIdService(productId);
  if (!isExistProduct) {
    throw new NotFoundException("Product not found");
  }

  const uniqueTags = [...new Set(tags)];

  const removedTag = await removeProductTagByIdService(productId, uniqueTags);

  return {
    statusCode: HttpStatus.OK,
    message: "Remove tag successfully",
    data: removedTag,
  };
};