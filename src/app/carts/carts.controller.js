import {
    addToCartService,
    getCartService,
    removeFromCartService,
    clearCartService,
} from "#src/app/carts/carts.service";
import { ApiResponse } from "#src/core/api/ApiResponse";
import { ModelDto } from "#src/core/dto/ModelDto";
import { HttpException } from "#src/core/exception/http-exception";
import { getProductVariantByIdService } from "#src/app/product-variants/product-variants.service";
import { Code } from "#src/core/code/Code";
import { CartDto } from "#src/app/carts/dtos/cart.dto";

export const addToCartController = async (req) => {
    const { id } = req.user;
    const { productVariantId, quantity } = req.body;

    const productVariant = await getProductVariantByIdService(productVariantId);
    if (!productVariant) {
        throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Product variant not found' });
    }

    if (productVariant.quantity < quantity) {
        throw HttpException.new({ code: Code.CONFLICT, overrideMessage: 'Product variant stock not enough' });
    }

    const productData = {
        productId: productVariant.product._id,
        productVariantId: productVariant._id,
        name: productVariant.product.name,
        quantity,
    };
    await addToCartService(id, productData);

    const cartsDto = ModelDto.new(CartDto, {
        _id: id,
        ...productData,
    });
    return ApiResponse.success(cartsDto);
};

export const getCartController = async (req) => {
    const { id } = req.user;
    const carts = await getCartService(id);
    // const cartsDto = ModelDto.newList(CartDto, carts);
    return ApiResponse.success(carts);
};

export const removeFromCartController = async (req) => {
    const { id } = req.user;
    const { productVariantId } = req.params;

    await removeFromCartService(id, productVariantId);
    return ApiResponse.success({ customerId: id, productVariantId });
};

export const clearCartController = async (req) => {
    const { id } = req.user;
    await clearCartService(id);
    return ApiResponse.success({ customerId: id });
};