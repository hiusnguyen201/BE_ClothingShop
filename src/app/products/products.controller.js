import {
  removeProductByIdService,
  checkExistProductNameService,
  createProductService,
  getAllProductsService,
  getProductByIdOrFailService,
  updateProductInfoOrFailService,
  updateProductVariantsService,
} from '#src/app/products/products.service';
import { ProductDto } from '#src/app/products/dtos/product.dto';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { ModelDto } from '#src/core/dto/ModelDto';
import { validateSchema } from '#src/core/validations/request.validation';
import { CheckExistProductNameDto } from '#src/app/products/dtos/check-exist-product-name.dto';
import { CreateProductDto } from '#src/app/products/dtos/create-product.dto';
import { UpdateProductInfoDto } from '#src/app/products/dtos/update-product-info.dto';
import { GetListProductDto } from '#src/app/products/dtos/get-list-product.dto';
import { GetProductDto } from '#src/app/products/dtos/get-product.dto';
import { UpdateProductVariantsDto } from '#src/app/products/dtos/update-product-variants.dto';
import { generateProductExcelBufferService } from '#src/modules/file-handler/excel/product-excel.service';

export const isExistProductNameController = async (req) => {
  const adapter = await validateSchema(CheckExistProductNameDto, req.body);

  const isExistName = await checkExistProductNameService(adapter, adapter);

  return ApiResponse.success(isExistName);
};

export const createProductController = async (req) => {
  const adapter = await validateSchema(CreateProductDto, req.body);

  const product = await createProductService(adapter);

  const productDto = ModelDto.new(ProductDto, product);
  return ApiResponse.success(productDto);
};

export const getAllProductsController = async (req) => {
  const adapter = await validateSchema(GetListProductDto, req.query);

  const [totalCount, products] = await getAllProductsService(adapter);

  const productsDto = ModelDto.newList(ProductDto, products);
  return ApiResponse.success({ totalCount, list: productsDto });
};

export const exportProductsController = async (req, res) => {
  const adapter = await validateSchema(GetListProductDto, req.query);

  const [_, products] = await getAllProductsService(adapter);

  const { buffer, fileName, contentType } = await generateProductExcelBufferService(products);

  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
  res.send(buffer);
};

export const getProductByIdController = async (req) => {
  const adapter = await validateSchema(GetProductDto, req.params);

  const product = await getProductByIdOrFailService(adapter);

  const productDto = ModelDto.new(ProductDto, product);
  return ApiResponse.success(productDto);
};

export const updateProductInfoController = async (req) => {
  const adapter = await validateSchema(UpdateProductInfoDto, { ...req.params, ...req.body });

  const updatedProduct = await updateProductInfoOrFailService(adapter);

  const productDto = ModelDto.new(ProductDto, updatedProduct);
  return ApiResponse.success(productDto);
};

export const updateProductVariantsController = async (req) => {
  const adapter = await validateSchema(UpdateProductVariantsDto, { ...req.params, ...req.body });

  await updateProductVariantsService(adapter);

  const product = await getProductByIdOrFailService(adapter);

  const productDto = ModelDto.new(ProductDto, product);
  return ApiResponse.success(productDto);
};

export const removeProductByIdController = async (req) => {
  const adapter = await validateSchema(GetProductDto, req.params);

  const data = await removeProductByIdService(adapter);

  return ApiResponse.success(data, 'Remove product successful');
};
