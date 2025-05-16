import {
  addToCartService,
  getCartService,
  removeFromCartService,
  clearCartService,
} from '#src/app/carts/carts.service';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { ModelDto } from '#src/core/dto/ModelDto';
import { HttpException } from '#src/core/exception/http-exception';
import { getProductVariantByIdRepository } from '#src/app/product-variants/product-variants.repository';
import { Code } from '#src/core/code/Code';
import { CartDto } from '#src/app/carts/dtos/cart.dto';
import { validateSchema } from '#src/core/validations/request.validation';
import { AddToCartDto } from '#src/app/carts/dtos/add-to-cart.dto';
import { RemoveFromCartDto } from '#src/app/carts/dtos/remove-from-cart.dto';

export const addToCartController = async (req) => {
  const adapter = await validateSchema(AddToCartDto, req.body);

  const productVariant = await getProductVariantByIdRepository(adapter.productVariantId);
  if (!productVariant) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Product variant not found' });
  }

  if (productVariant.quantity < adapter.quantity) {
    throw HttpException.new({ code: Code.CONFLICT, overrideMessage: 'Product variant stock not enough' });
  }

  const productData = {
    productId: productVariant.product._id,
    productVariantId: productVariant._id,
    quantity: adapter.quantity,
  };
  await addToCartService(req.user.id, productData);

  const cartsDto = ModelDto.new(CartDto, {
    _id: req.user.id,
    ...productData,
  });
  return ApiResponse.success(cartsDto);
};

export const getCartController = async (req) => {
  const carts = await getCartService(req.user.id);
  const cartPopulate = await Promise.all(
    carts.map(async (cart) => {
      const productVariant = await getProductVariantByIdRepository(
        cart.productVariantId,
        'price product quantity sku sold variantValues',
      );
      return {
        productVariant: productVariant,
        quantity: cart.quantity,
      };
    }),
  );

  return ApiResponse.success(cartPopulate);
};

export const removeFromCartController = async (req) => {
  const adapter = await validateSchema(RemoveFromCartDto, req.params);
  await removeFromCartService(req.user.id, adapter.productVariantId);
  return ApiResponse.success({ customerId: req.user.id, productVariantId: adapter.productVariantId });
};

export const clearCartController = async (req) => {
  await clearCartService(req.user.id);
  return ApiResponse.success({ customerId: req.user.id });
};
