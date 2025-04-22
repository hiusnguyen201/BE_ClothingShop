import { getTodayCustomerReportService } from '#src/app/customers/customers.service';
import {
  getTodaySalesService,
  getTodayOrderReportService,
  getTodayRevenueReportService,
} from '#src/app/orders/orders.service';
import { getTopProductVariantsService } from '#src/app/product-variants/product-variants.service';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { validateSchema } from '#src/core/validations/request.validation';
import { GetTopProductVariantsDto } from '#src/app/report/dtos/get-top-product-variants.dto';
import { ModelDto } from '#src/core/dto/ModelDto';
import { ProductVariantDto } from '#src/app/product-variants/dtos/product-variant.dto';

export async function getTodayCustomerReportController() {
  const report = await getTodayCustomerReportService();
  return ApiResponse.success(report, 'Get customer report successfully');
}

export async function getTodayOrderReportController() {
  const report = await getTodayOrderReportService();
  return ApiResponse.success(report, 'Get order report successfully');
}

export async function getTodayRevenueReportController() {
  const report = await getTodayRevenueReportService();
  return ApiResponse.success(report, 'Get revenue report successfully');
}

export async function getTopProductVariantsController(req) {
  const adapter = await validateSchema(GetTopProductVariantsDto, req.query);
  const variants = await getTopProductVariantsService(adapter.limit);
  const variantsDo = ModelDto.newList(ProductVariantDto, variants);
  return ApiResponse.success(variantsDo, 'Get top product variants successfully');
}

export async function getTodaySalesController() {
  const sales = await getTodaySalesService();
  return ApiResponse.success(sales, 'Get sales successfully');
}
