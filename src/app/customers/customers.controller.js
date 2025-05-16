import { ApiResponse } from '#src/core/api/ApiResponse';
import { ModelDto } from '#src/core/dto/ModelDto';
import { CustomerDto } from '#src/app/customers/dtos/customer.dto';
import { GetListCustomerDto } from '#src/app/customers/dtos/get-list-customer.dto';
import { GetCustomerDto } from '#src/app/customers/dtos/get-customer.dto';
import { CreateCustomerDto } from '#src/app/customers/dtos/create-customer.dto';
import { UpdateCustomerDto } from '#src/app/customers/dtos/update-customer.dto';
import { validateSchema } from '#src/core/validations/request.validation';
import {
  createCustomerService,
  getAllCustomersService,
  getCustomerByIdOrFailService,
  removeCustomerByIdOrFailService,
  updateCustomerByIdOrFailService,
} from '#src/app/customers/customers.service';
import { generateCustomerExcelBufferService } from '#src/modules/file-handler/excel/customer-excel.service';

export const createCustomerController = async (req) => {
  const adapter = await validateSchema(CreateCustomerDto, req.body);

  const customer = await createCustomerService(adapter);

  const customerDto = ModelDto.new(CustomerDto, customer);
  return ApiResponse.success(customerDto, 'Create customer successful');
};

export const getAllCustomersController = async (req) => {
  const adapter = await validateSchema(GetListCustomerDto, req.query);

  const [totalCount, customers] = await getAllCustomersService(adapter);

  const customersDto = ModelDto.newList(CustomerDto, customers);
  return ApiResponse.success({ totalCount, list: customersDto }, 'Get all customers successful');
};

export const exportCustomersController = async (req, res) => {
  const adapter = await validateSchema(GetListCustomerDto, req.query);

  const [_, customers] = await getAllCustomersService(adapter);

  const { buffer, fileName, contentType } = await generateCustomerExcelBufferService(customers);

  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
  res.send(buffer);
};

export const getCustomerByIdController = async (req) => {
  const adapter = await validateSchema(GetCustomerDto, req.params);

  const customer = await getCustomerByIdOrFailService(adapter);

  const customerDto = ModelDto.new(CustomerDto, customer);
  return ApiResponse.success(customerDto, 'Get customer successful');
};

export const updateCustomerByIdController = async (req) => {
  const adapter = await validateSchema(UpdateCustomerDto, { ...req.params, ...req.body });

  const updatedCustomer = await updateCustomerByIdOrFailService(adapter);

  const customerDto = ModelDto.new(CustomerDto, updatedCustomer);
  return ApiResponse.success(customerDto, 'Update customer successful');
};

export const removeCustomerByIdController = async (req) => {
  const adapter = await validateSchema(GetCustomerDto, req.params);

  const data = await removeCustomerByIdOrFailService(adapter);

  return ApiResponse.success(data, 'Remove customer successful');
};
