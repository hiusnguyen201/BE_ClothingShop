'use strict';
import { ModelDto } from '#src/core/dto/ModelDto';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { HttpException } from '#src/core/exception/http-exception';
import { checkExistEmailService, getUserByIdService, updateUserInfoByIdService } from '#src/app/users/users.service';
import { UserDto } from '#src/app/users/dtos/user.dto';
import { comparePasswordService } from '#src/app/account/account.service';
import { changePasswordByIdService } from '#src/app/auth/auth.service';
import { Code } from '#src/core/code/Code';

export const getProfileController = async (req) => {
  const user = await getUserByIdService(req.user.id);
  const userDto = ModelDto.new(UserDto, user);
  return ApiResponse.success(userDto);
};

export const editProfileController = async (req) => {
  const userId = req.user.id;
  const { email } = req.body;

  const isExistEmail = await checkExistEmailService(email, userId);
  if (isExistEmail) {
    throw HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Email already exist' });
  }

  const updatedUser = await updateUserInfoByIdService(userId, req.body);

  const userDto = ModelDto.new(UserDto, updatedUser);
  return ApiResponse.success(userDto);
};

export const changePasswordController = async (req) => {
  const userId = req.user.id;
  const { password, newPassword } = req.body;

  const isMatch = await comparePasswordService(userId, password);
  if (!isMatch) {
    throw HttpException.new({ code: Code.UNAUTHORIZED, overrideMessage: 'Password is incorrect' });
  }

  await changePasswordByIdService(userId, newPassword);

  return ApiResponse.success(true);
};
