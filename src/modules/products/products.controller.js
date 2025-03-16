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
  updateProductTagsByProductIdService,
  deleteProductTagsByProductIdService,
  updateProductOptionsByProductIdService,
  deleteProductOptionsByProductIdService,
} from "#src/modules/products/products.service";
import { calculatePagination } from "#src/utils/pagination.util";
import { makeSlug } from "#src/utils/string.util";
import { getOrCreateTagByName } from "#src/modules/tags/tags.service";
import { createOptionService, getOptionByIdService, updateOptionByIdService } from "#src/modules/options/options.service";
import { createOptionValueService, getOptionValueByIdService } from "#src/modules/option-values/option-values.service";
import { createProductVariantService, updateProductVariantValueByIdService } from "#src/modules/product-variants/product-variants.service";

export const createProductController = async (req) => {
  let { name, tags, product_variants } = req.body;
  delete req.body.product_variants;
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

  if (product_variants && product_variants.length > 0) {

    let uniqueProductVariants = []
    let uniqueVariantValues = new Set();
    product_variants.map((variant, i) => {
      const { variant_values } = variant;
      const variantKey = variant_values.map(value => JSON.stringify(value)).sort().join("|");
      if (!uniqueVariantValues.has(variantKey)) {
        uniqueProductVariants.push(variant)
        uniqueVariantValues.add(variantKey)
      }
    })


    const productVariantsIds = await Promise.all(
      uniqueProductVariants.map(async (product_variant) => {
        const { variant_values } = product_variant;
        delete product_variant.variant_values;


        const newProductVariant = await createProductVariantService(product_variant);

        // if (product_variant.image) {
        //   /// create
        //   console.log("create img");
        // }

        await Promise.all(
          variant_values.map(async (variant_value) => {
            const option = await getOptionByIdService(variant_value.option);

            if (!option) {
              throw new NotFoundException("Option not found");
            }

            if (!option.option_values.includes(variant_value.option_value)) {
              throw new ConflictException("Option value not match option")
            }

            const optionValue = await getOptionValueByIdService(variant_value.option_value);

            if (!optionValue) {
              throw new NotFoundException("Option value not found");
            }

            await updateProductVariantValueByIdService(newProductVariant._id, variant_value)
          })
        )

        return newProductVariant._id;
      })
    )

    updateProduct.product_variants = productVariantsIds
  }

  if (tags && tags.length > 0) {
    const tagsIds = await Promise.all(
      tags.map(async (name) => {
        const tag = await getOrCreateTagByName(name, newProduct._id);
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
  const existProduct = await getProductByIdService(id, "_id product_options");
  if (!existProduct) {
    throw new NotFoundException("Product not found");
  }

  const { name, tags, tags_to_delete, product_options, update_product_options, detele_product_options, delete_option_sizes } = req.body;
  delete req.body.product_options;
  delete req.body.tags;
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
    const createOptionSize = async (optionSizes) => {
      const optionSizesIds = await Promise.all(
        optionSizes.map(async (optionSize) => {
          const newOptionSize = await createOptionValueService(optionSize);
          return newOptionSize._id;
        })
      )
      return optionSizesIds;
    }

    const productOptionsIds = await Promise.all(
      product_options.map(async (productOption) => {
        const newProductOption = await createOptionService({
          color: productOption.color,
          image: productOption.image
        });
        const newOptionSizeIds = await createOptionSize(productOption.option_sizes);

        await updateProductOptionByIdService(newProductOption._id, {
          option_sizes: newOptionSizeIds
        })

        return newProductOption._id;
      })
    )

    await updateProductOptionsByProductIdService(existProduct._id, productOptionsIds);
  }

  if (update_product_options) {
    await Promise.all(
      update_product_options.map(async (update_product_option) => {
        const { option_sizes, _id } = update_product_option;
        delete update_product_option.option_sizes;
        delete update_product_option._id;
        if (Object.keys(update_product_option).length > 0) {
          await updateProductOptionByIdService(_id, update_product_option);
        }

        if (option_sizes) {
          await Promise.all(
            option_sizes.map(async (optionSize) => {
              const { _id } = optionSize
              delete optionSize._id;
              await updateOptionValueByIdService(_id, optionSize)
            })
          )
        }
      })
    )
  }

  if (detele_product_options) {
    await Promise.all(
      detele_product_options.map(async (detele_product_option) => {
        const productOption = await getProductOptionByIdService(detele_product_option);

        if (productOption && productOption.option_sizes && productOption.option_sizes.length) {
          await Promise.all(
            productOption.option_sizes.map(async (option_size) => await removeOptionValueByIdService(option_size))
          )
        }
      })
    )
    await deleteProductOptionsByProductIdService(existProduct._id, detele_product_options);
  }

  if (delete_option_sizes) {
    await Promise.all(
      delete_option_sizes.map(async (detele_option_size) => {
        return detele_option_size
        await removeOptionValueByIdService(detele_option_size);
      })
    )
    // await removeProductOptionSizesByIdService(existProduct._id, detele_product_options);
  }

  if (tags && tags.length > 0) {
    const tagsIds = await Promise.all(
      tags.map(async (name) => {
        const tag = await getOrCreateTagByName(name, existProduct._id);
        return tag._id;
      })
    )
    await updateProductTagsByProductIdService(existProduct._id, tagsIds);
  }

  if (tags_to_delete && tags_to_delete.length > 0) {
    await deleteProductTagsByProductIdService(existProduct._id, tags_to_delete);
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