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
  updateProductTagsByIdService,
  removeProductByIdService,
  checkExistProductNameService,
  countAllProductsService,
  showProductService,
  hideProductService,
} from "#src/modules/products/products.service";
import { calculatePagination } from "#src/utils/pagination.util";
import { makeSlug } from "#src/utils/string.util";
import { getOrCreateTagByName } from "#src/modules/tags/tags.service";
import { createOptionValueService } from "#src/modules/option-values/option-values.service";
import { createValueImageService } from "#src/modules/value-images/value-images.service";
import {
  createProductOptionService,
  updateProductOptionByIdService
} from "#src/modules/product-options/product-options.service";

export const createProductController = async (req) => {
  const { name, tags, product_options } = req.body;
  delete req.body.product_options;
  delete req.body.tags;
  // const isExistProduct = await checkExistProductNameService(name);
  // if (isExistProduct) {
  //   throw new ConflictException("Product name already exist");
  // }

  const newProduct = await createProductService({
    ...req.body,
    slug: makeSlug(name),
  });

  const updateProduct = {};

  if (product_options && product_options.length > 0) {
    const createProductOptionValue = async (option) => {
      const optionValues = await Promise.all(
        option.values.map(async (value) => {
          const optionValue = await createOptionValueService(value);
          return optionValue._id;
        })
      )
      return {
        option_name: option.option_name,
        hasImages: option.hasImages,
        option_values: optionValues
      }
    }

    const createValueImages = async (images) => {
      const valueImages = await Promise.all(
        images.map(async (image) => {
          const valueImage = await createValueImageService(image);
          return valueImage._id
        })
      )
      return valueImages
    }

    const productOptionsIds = await Promise.all(
      product_options.map(async (productOption) => {
        const newProductOption = await createProductOptionService({
          option_name: productOption.option_name,
          has_images: productOption.has_images,
        });
        return newProductOption._id;
      })
    )

    const optionValuesIds = await Promise.all(
      product_options.values.map(async (optionValue) => {
        const newOptionValue = await createOptionValueService({
          name: optionValue.name
        });
        return newOptionValue._id;
      })
    )



    updateProduct.product_options = productOptionsIds
  }

  if (tags && tags.length > 0) {
    const tagsIds = await Promise.all(
      tags.map(async (name) => {
        const tag = await getOrCreateTagByName(name);
        return tag._id;
      })
    )
    updateProduct.tags = tagsIds;
  }

  const formatterProduct = await updateProductByIdService(newProduct._id, updateProduct);

  return {
    statusCode: HttpStatus.CREATED,
    message: "Create product successfully",
    data: formatterProduct,
  };
};

export const getAllProductsController = async (req) => {
  let { keyword = "", category, tags, is_hidden = false, limit = 10, page = 1 } = req.query;

  const tagArray = tags ? (Array.isArray(tags) ? tags : [tags]) : [];

  const filterOptions = {
    $or: [
      { name: { $regex: keyword, $options: "i" } },
    ],
    ...(is_hidden ? { is_hidden } : {}),
    ...(category ? { category } : {}),
    ...(tagArray.length ? { tags: { $in: tagArray } } : {}),
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
  const existProduct = await getProductByIdService(id, "_id");
  if (!existProduct) {
    throw new NotFoundException("Product not found");
  }

  const { name, tags, product_options } = req.body;
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

  if (product_options && product_options.length > 0) {
    const createProductOptionValue = async (option) => {
      const optionValues = await Promise.all(
        option.values.map(async (value) =>
          await createOptionValueService(value)
        ))
      return {
        option_name: option.option_name,
        hasImages: option.hasImages,
        option_values: optionValues.map(value => value._id)
      }
    }

    const productOptionValues = await Promise.all(
      product_options.map((async (option) =>
        await createProductOptionValue(option)
      )))

    const productOptions = await Promise.all(
      productOptionValues.map((async (productOption) =>
        await createProductOptionService(productOption)))
    )
    req.body.product_options = productOptions.map(option => option._id);
  }

  let updatedProduct = await updateProductByIdService(id, req.body);

  if (tags && tags.length > 0) {
    const uniqueTags = [...new Set(tags)];
    updatedProduct = await updateProductTagsByIdService(id, uniqueTags);
  }

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

  if (!existProduct.is_hidden) {
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