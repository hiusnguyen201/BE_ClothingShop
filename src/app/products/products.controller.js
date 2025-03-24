import { HttpException } from "#src/core/exception/http-exception";

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
  updateProductVariantsByProductIdService,
} from "#src/app/products/products.service";
import { calculatePagination } from "#src/utils/pagination.util";
import { makeSlug } from "#src/utils/string.util";
import {
  getOrCreateTagByName,
  getTagByIdService,
  removeProductTagByIdService,
  updateProductTagByIdService
} from "#src/app/tags/tags.service";
import {
  getOptionByIdService
} from "#src/app/options/options.service";
import {
  getOptionValueByIdService
} from "#src/app/option-values/option-values.service";
import {
  createProductVariantService,
  getAllProductVariantsService,
  getProductVariantByIdService,
  removeProductVariantByIdService,
  updateProductVariantValueByIdService
} from "#src/app/product-variants/product-variants.service";
import { Code } from "#src/core/code/Code";
import { ProductDto } from "#src/app/products/dtos/product.dto";
import { ApiResponse } from "#src/core/api/ApiResponse";
import { ModelDto } from "#src/core/dto/ModelDto";
import { getCategoryByIdService } from "#src/app/categories/categories.service";
import { isVariantValuesDuplicated, uniqueProductVariants } from "#src/utils/object.util";

export const createProductController = async (req) => {
  let { name, tags, product_variants, category } = req.body;

  delete req.body.product_variants;
  delete req.body.tags;


  // const isExistProduct = await checkExistProductNameService(name);
  // if (isExistProduct) {
  //   throw HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: "Product name already exist" });
  // }

  // const isExistCategory = await getCategoryByIdService(category);
  // if (!isExistCategory) {
  //   throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: "Category not found" });
  // }

  const newProduct = await createProductService({
    ...req.body,
    slug: makeSlug(name),
  });

  const updateProduct = {};

  if (product_variants && product_variants.length > 0) {
    product_variants = uniqueProductVariants(product_variants)

    const productVariantsIds = await Promise.all(
      product_variants.map(async (product_variant) => {
        const { variant_values } = product_variant;
        delete product_variant.variant_values;

        const newProductVariant = await createProductVariantService({
          ...product_variant,
          product: newProduct._id
        });

        // if (product_variant.image) {
        //   /// create
        //   console.log("create img");
        // }

        await Promise.all(
          variant_values.map(async (variant_value) => {
            const option = await getOptionByIdService(variant_value.option);

            if (!option) {
              throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: "Option not found" });
            }

            if (!option.option_values.includes(variant_value.option_value)) {
              throw HttpException.new({ code: Code.CONFLICT, overrideMessage: "Option value not match option" });
            }

            const optionValue = await getOptionValueByIdService(variant_value.option_value);

            if (!optionValue) {
              throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: "Option value not found" });
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

    await Promise.all(
      tagsIds.map(async tagId => {
        await updateProductTagByIdService(tagId, newProduct._id);
      }))
  }

  const product = await updateProductByIdService(newProduct._id, updateProduct);

  const productDto = ModelDto.new(ProductDto, product);
  return ApiResponse.success(productDto);
};

export const getAllProductsController = async (req) => {
  let { keyword = "", category, tag, is_hidden = false, limit = 10, page = 1 } = req.query;

  const filterOptions = {
    $or: [
      { name: { $regex: keyword, $options: "i" } },
    ],
    ...(is_hidden ? { is_hidden } : {}),
    ...(category ? { category } : {}),
  };

  if (tag) {
    const tagResult = await getTagByIdService(tag);
    if (tagResult) {
      filterOptions._id = { $in: tagResult.products }
    }
  }

  const totalCount = await countAllProductsService(filterOptions);
  const metaData = calculatePagination(page, limit, totalCount);

  const products = await getAllProductsService({
    filters: filterOptions,
    offset: metaData.offset,
    limit: metaData.limit,
  });

  const productsDto = ModelDto.newList(ProductDto, products);
  return ApiResponse.success({ meta: metaData, list: productsDto });
};

export const getProductByIdController = async (req) => {
  const { id } = req.params;
  const existProduct = await getProductByIdService(id);
  if (!existProduct) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: "Product not found" });
  }

  const productDto = ModelDto.new(ProductDto, existProduct);
  return ApiResponse.success(productDto);
};

export const updateProductByIdController = async (req) => {
  const { id } = req.params;

  const existProduct = await getProductByIdService(id, "_id");
  if (!existProduct) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: "Product not found" });
  }

  // const isExistCategory = await getCategoryByIdService(category);
  // if (!isExistCategory) {
  //   throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: "Category not found" });
  // }

  let { name, tags, tagsToDelete, product_variants, productVariantsToUpdate, productVariantsToDelete } = req.body;
  delete req.body.product_options;
  delete req.body.tags;
  delete req.body.product_variants;

  if (name) {
    const isExistName = await checkExistProductNameService(name, existProduct._id);
    if (isExistName) {
      throw HttpException.new({ code: Code.CONFLICT, overrideMessage: "Product name already exist" });
    }
    req.body.slug = makeSlug(name);
  }

  if (product_variants && product_variants.length > 0) {
    product_variants = uniqueProductVariants(product_variants);

    const getAllProductVariants = await getAllProductVariantsService({
      filters: {
        product: existProduct._id
      },
      limit: 100,
      selectFields: "-_id variant_values"
    })

    const length = getAllProductVariants && getAllProductVariants.length > 0 && getAllProductVariants[0].variant_values.length;

    const productVariantsIds = await Promise.all(
      product_variants.map(async (product_variant) => {
        const { variant_values } = product_variant;
        delete product_variant.variant_values;

        if (variant_values.length != length) {
          return null;
        }

        const isDuplicated = isVariantValuesDuplicated(getAllProductVariants, variant_values);
        if (isDuplicated) {
          return null;
        }

        const newProductVariant = await createProductVariantService({
          ...product_variant,
          product: existProduct._id
        });

        // if (product_variant.image) {
        //   /// create
        //   console.log("create img");
        // }

        await Promise.all(
          variant_values.map(async (variant_value) => {
            const option = await getOptionByIdService(variant_value.option);

            if (!option) {
              throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: "Option not found" });
            }

            if (!option.option_values.includes(variant_value.option_value)) {
              throw HttpException.new({ code: Code.CONFLICT, overrideMessage: "Option value not match option" });
            }

            const optionValue = await getOptionValueByIdService(variant_value.option_value);

            if (!optionValue) {
              throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: "Option value not found" });
            }

            await updateProductVariantValueByIdService(newProductVariant._id, variant_value)
          })
        )
        return newProductVariant._id;
      })
    )

    const productVariantsIdsFilter = productVariantsIds.filter(item => item != null);
    if (productVariantsIdsFilter && productVariantsIdsFilter.length) {
      await updateProductVariantsByProductIdService(existProduct._id, productVariantsIds);
    }
  }

  if (productVariantsToUpdate && productVariantsToUpdate.length > 0) {
    await Promise.all(
      productVariantsToUpdate.map(async (productVariant) => {
        const getProductVariant = await getProductVariantByIdService(productVariant._id);
        if (getProductVariant) await updateProductVariantValueByIdService(getProductVariant._id, productVariant)
      })
    )
  }

  if (productVariantsToDelete && productVariantsToDelete.length > 0) {
    await Promise.all(
      productVariantsToDelete.map(async (id) => {
        await removeProductVariantByIdService(id);
      })
    )
  }

  if (tags && tags.length > 0) {
    const tagsIds = await Promise.all(
      tags.map(async (name) => {
        const tag = await getOrCreateTagByName(name, existProduct._id);
        return tag._id;
      })
    )

    await Promise.all(
      tagsIds.map(async tagId => {
        await updateProductTagByIdService(tagId, existProduct._id);
      }))
  }

  if (tagsToDelete && tagsToDelete.length > 0) {
    await Promise.all(
      tagsToDelete.map(async (tag) => {
        const getTag = await getTagByIdService(tag);
        if (getTag) await removeProductTagByIdService(getTag._id, existProduct._id);
      }));
  }

  const updatedProduct = await updateProductByIdService(existProduct._id, req.body);

  const productDto = ModelDto.new(ProductDto, updatedProduct);
  return ApiResponse.success(productDto);
};

export const removeProductByIdController = async (req) => {
  const { productId } = req.params;
  const existProduct = await getProductByIdService(productId, "_id is_hidden");
  if (!existProduct) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: "Product not found" });
  }

  if (!existProduct.is_hidden) {
    throw HttpException.new({ code: Code.CONFLICT, overrideMessage: "Product is public" });
  }

  await removeProductByIdService(productId);

  return ApiResponse.success();
};

export const isExistProductNameController = async (req) => {
  const { name } = req.body;
  const isExistName = await checkExistProductNameService(name);

  return ApiResponse.success(isExistName);
};

export const showProductByIdController = async (req) => {
  const { productId } = req.params;
  const existProduct = await getProductByIdService(productId, "_id");
  if (!existProduct) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: "Product not found" });
  }

  await showProductService(productId);

  return ApiResponse.success();
};

export const hideProductByIdController = async (req) => {
  const { productid } = req.params;
  const existProduct = await getProductByIdService(productid, "_id");
  if (!existProduct) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: "Product not found" });
  }

  await hideProductService(productid);

  return ApiResponse.success();
};