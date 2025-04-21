import { ModelDto } from '#src/core/dto/ModelDto';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { HttpException } from '#src/core/exception/http-exception';
import { checkExistEmailService, getUserByIdService, updateUserInfoByIdService } from '#src/app/users/users.service';
import { UserDto } from '#src/app/users/dtos/user.dto';
import { comparePasswordService } from '#src/app/account/account.service';
import { changePasswordByIdService } from '#src/app/auth/auth.service';
import { Code } from '#src/core/code/Code';
import { validateSchema } from '#src/core/validations/request.validation';
import { EditProfileDto } from '#src/app/account/dtos/edit-profile.dto';
import { ChangePasswordDto } from '#src/app/account/dtos/change-password.dto';

export const getProfileController = async (req) => {
  const user = await getUserByIdService(req.user.id);
  const userDto = ModelDto.new(UserDto, user);
  return ApiResponse.success(userDto);
};

export const editProfileController = async (req) => {
  const userId = req.user.id;
  const adapter = await validateSchema(EditProfileDto, req.body);

  const isExistEmail = await checkExistEmailService(adapter.email, userId);
  if (isExistEmail) {
    throw HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Email already exist' });
  }

  const updatedUser = await updateUserInfoByIdService(userId, req.body);

  const userDto = ModelDto.new(UserDto, updatedUser);
  return ApiResponse.success(userDto);
};

export const changePasswordController = async (req) => {
  const userId = req.user.id;
  const adapter = await validateSchema(ChangePasswordDto, req.body);

  const isMatch = await comparePasswordService(userId, adapter.password);
  if (!isMatch) {
    throw HttpException.new({ code: Code.UNAUTHORIZED, overrideMessage: 'Password is incorrect' });
  }

  await changePasswordByIdService(userId, adapter.newPassword);

  return ApiResponse.success(true);
};
