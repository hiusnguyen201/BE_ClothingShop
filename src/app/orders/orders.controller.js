import {
  getOrderByIdService,
  createOrderService,
  cancelOrderService,
  confirmOrderService,
  createShippingOrderService,
  getAllOrdersService,
  processingOrderService,
  webHookUpdateOrderService,
  removeOrderByIdService,
} from '#src/app/orders/orders.service';
import { getTrackingDetailsService } from '#src/modules/GHN/ghn.service';
import { ModelDto } from '#src/core/dto/ModelDto';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { OrderDto } from '#src/app/orders/dtos/order.dto';
import { validateSchema } from '#src/core/validations/request.validation';
import { CreateOrderDto } from '#src/app/orders/dtos/create-order.dto';
import { GetListOrderDto } from '#src/app/orders/dtos/get-list-order.dto';
import { GetOrderDto } from '#src/app/orders/dtos/get-order.dto';
import { CreateOrderGhnDto } from '#src/app/orders/dtos/create-order-ghn.dto';
import { generateOrderExcelBufferService } from '#src/modules/file-handler/excel/order-excel.service';
import { WebHookOrderStatusDto } from '#src/app/orders/dtos/webhook-order-status.dto';

export async function createOrderController(req) {
  const adapter = await validateSchema(CreateOrderDto, req.body);

  const order = await createOrderService({ ...adapter, baseUrl: req.protocol + '://' + req.get('host') });

  const orderDto = ModelDto.new(OrderDto, order);
  return ApiResponse.success(orderDto);
}

export async function getAllOrdersController(req) {
  const adapter = await validateSchema(GetListOrderDto, req.query);

  const [totalCount, orders] = await getAllOrdersService(adapter);

  const ordersDto = ModelDto.newList(OrderDto, orders);
  return ApiResponse.success({ totalCount, list: ordersDto });
}

export async function exportOrdersController(req, res) {
  const adapter = await validateSchema(GetListOrderDto, req.query);

  const [_, orders] = await getAllOrdersService(adapter);

  const { buffer, fileName, contentType } = await generateOrderExcelBufferService(orders);

  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
  res.send(buffer);
}

export async function getOrderByIdController(req) {
  const adapter = await validateSchema(GetOrderDto, req.params);

  const order = await getOrderByIdService(adapter);

  const trackingLog = order.trackingNumber ? await getTrackingDetailsService(order.trackingNumber) : null;

  const orderDto = ModelDto.new(OrderDto, { ...order, trackingLog });
  return ApiResponse.success(orderDto);
}

export async function confirmOrderController(req) {
  const adapter = await validateSchema(GetOrderDto, req.body);

  const order = await confirmOrderService(adapter);

  const orderDto = ModelDto.new(OrderDto, order);
  return ApiResponse.success(orderDto);
}

export async function processingOrderController(req) {
  const adapter = await validateSchema(GetOrderDto, req.body);

  const order = await processingOrderService(adapter);

  const orderDto = ModelDto.new(OrderDto, order);
  return ApiResponse.success(orderDto);
}

export async function cancelOrderController(req) {
  const adapter = await validateSchema(CreateOrderGhnDto, req.body);

  const order = await cancelOrderService(adapter);

  const orderDto = ModelDto.new(OrderDto, order);
  return ApiResponse.success(orderDto);
}

export async function createShippingOrderController(req) {
  const adapter = await validateSchema(CreateOrderGhnDto, req.body);

  const order = await createShippingOrderService(adapter);

  const orderDto = ModelDto.new(OrderDto, order);
  return ApiResponse.success(orderDto);
}

export async function removeOrderController(req) {
  const adapter = await validateSchema(GetOrderDto, req.params);

  const data = await removeOrderByIdService(adapter);

  return ApiResponse.success(data, 'Remove order successful');
}

export async function webHookUpdateOrderController(req) {
  const adapter = await validateSchema(WebHookOrderStatusDto, req.body);

  await webHookUpdateOrderService(adapter);

  return ApiResponse.success(null);
}
