import {
  createUserService,
  getUserByIdOrFailService,
  removeUserByIdOrFailService,
  checkExistEmailService,
  getAllUsersService,
  updateUserByIdOrFailService,
  resetPasswordUserByIdOrFailService,
} from '#src/app/users/users.service';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { ModelDto } from '#src/core/dto/ModelDto';
import { UserDto } from '#src/app/users/dtos/user.dto';
import {
  CheckExistEmailDto,
  CreateUserDto,
  GetListUserDto,
  GetUserDto,
  UpdateUserDto,
} from '#src/app/users/dtos/index';
import { validateSchema } from '#src/core/validations/request.validation';
import { generateUserExcelBufferService } from '#src/modules/file-handler/excel/user-excel.service';

export const checkExistEmailController = async (req) => {
  const adapter = await validateSchema(CheckExistEmailDto, req.body);

  const isExistEmail = await checkExistEmailService(adapter);

  return ApiResponse.success(isExistEmail);
};

export const createUserController = async (req) => {
  const adapter = await validateSchema(CreateUserDto, req.body);

  const user = await createUserService(adapter);

  const userDto = ModelDto.new(UserDto, user);
  return ApiResponse.success(userDto);
};

export const getAllUsersController = async (req) => {
  const adapter = await validateSchema(GetListUserDto, req.query);

  const [totalCount, users] = await getAllUsersService(adapter);

  const usersDto = ModelDto.newList(UserDto, users);
  return ApiResponse.success({ totalCount: totalCount, list: usersDto }, 'Get list user successful');
};

export const exportUsersController = async (req, res) => {
  const adapter = await validateSchema(GetListUserDto, req.query);

  const [_, users] = await getAllUsersService(adapter);

  const { buffer, fileName, contentType } = await generateUserExcelBufferService(users);

  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
  res.send(buffer);
};

export const getUserByIdController = async (req) => {
  const adapter = await validateSchema(GetUserDto, req.params);

  const user = await getUserByIdOrFailService(adapter);

  const userDto = ModelDto.new(UserDto, user);
  return ApiResponse.success(userDto, 'Get one user successful');
};

export const updateUserByIdController = async (req) => {
  const adapter = await validateSchema(UpdateUserDto, { ...req.params, ...req.body });

  const updatedUser = await updateUserByIdOrFailService(adapter);

  const userDto = ModelDto.new(UserDto, updatedUser);
  return ApiResponse.success(userDto);
};

export const removeUserByIdController = async (req) => {
  const adapter = await validateSchema(GetUserDto, req.params);

  const data = await removeUserByIdOrFailService(adapter);

  return ApiResponse.success(data, 'Remove user successful');
};

export const resetPasswordUserController = async (req) => {
  const adapter = await validateSchema(GetUserDto, req.params);

  const data = await resetPasswordUserByIdOrFailService(adapter);

  return ApiResponse.success(data, 'Reset user password successful');
};
