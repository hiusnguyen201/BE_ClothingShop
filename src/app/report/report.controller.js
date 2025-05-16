import { getCustomerReportByDateRangeService } from '#src/app/customers/customers.service';
import {
  getSalesReportByDateRangeService,
  getOrderReportByDateRangeService,
  getRevenueReportByDateRangeService,
  getRecentOrdersService,
} from '#src/app/orders/orders.service';
import { getTopProductVariantsService } from '#src/app/product-variants/product-variants.service';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { validateSchema } from '#src/core/validations/request.validation';
import { GetTopProductVariantsDto } from '#src/app/report/dtos/get-top-product-variants.dto';
import { ModelDto } from '#src/core/dto/ModelDto';
import { ProductVariantDto } from '#src/app/product-variants/dtos/product-variant.dto';
import { GetCustomerReportDto } from '#src/app/report/dtos/get-customer-report.dto';
import { GetOrderReportDto } from '#src/app/report/dtos/get-order-report.dto';
import { GetRevenueReportDto } from '#src/app/report/dtos/get-revenue-report.dto';
import { GetSalesReportDto } from '#src/app/report/dtos/get-sales-report.dto';
import { GetRecentOrdersDto } from '#src/app/report/dtos/get-recent-orders.dto copy';
import { OrderDto } from '#src/app/orders/dtos/order.dto';

export async function getCustomerReportController(req) {
  const adapter = await validateSchema(GetCustomerReportDto, req.query);

  const report = await getCustomerReportByDateRangeService(adapter);

  return ApiResponse.success(report, 'Get customer report successfully');
}

export async function getOrderReportController(req) {
  const adapter = await validateSchema(GetOrderReportDto, req.query);

  const report = await getOrderReportByDateRangeService(adapter);

  return ApiResponse.success(report, 'Get order report successfully');
}

export async function getRevenueReportController(req) {
  const adapter = await validateSchema(GetRevenueReportDto, req.query);

  const report = await getRevenueReportByDateRangeService(adapter);

  return ApiResponse.success(report, 'Get revenue report successfully');
}

export async function getTopProductVariantsController(req) {
  const adapter = await validateSchema(GetTopProductVariantsDto, req.query);

  const variants = await getTopProductVariantsService(adapter);

  const variantsDto = ModelDto.newList(ProductVariantDto, variants);
  return ApiResponse.success(variantsDto, 'Get product variants successfully');
}

export async function getSalesReportController(req) {
  const adapter = await validateSchema(GetSalesReportDto, req.query);

  const sales = await getSalesReportByDateRangeService(adapter);

  return ApiResponse.success(sales, 'Get sales successfully');
}

export async function getRecentOrdersController(req) {
  const adapter = await validateSchema(GetRecentOrdersDto, req.query);

  const [_, orders] = await getRecentOrdersService(adapter);

  const ordersDto = ModelDto.newList(OrderDto, orders);
  return ApiResponse.success(ordersDto, 'Get product variants successfully');
}
