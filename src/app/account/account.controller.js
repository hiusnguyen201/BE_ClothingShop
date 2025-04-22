import { ModelDto } from '#src/core/dto/ModelDto';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { HttpException } from '#src/core/exception/http-exception';
import {
  checkExistEmailService,
  getListPermissionNameInUserService,
  getUserByIdService,
  updateUserInfoByIdService,
} from '#src/app/users/users.service';
import { UserDto } from '#src/app/users/dtos/user.dto';
import { comparePasswordService } from '#src/app/account/account.service';
import { changePasswordByIdService } from '#src/app/auth/auth.service';
import { Code } from '#src/core/code/Code';
import { validateSchema } from '#src/core/validations/request.validation';
import { EditProfileDto } from '#src/app/account/dtos/edit-profile.dto';
import { ChangePasswordDto } from '#src/app/account/dtos/change-password.dto';
import { uploadImageBufferService } from '#src/modules/cloudinary/cloudinary.service';
import { AccountPermissionDto } from '#src/app/account/dtos/account-permission.dto';

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

  if (adapter.avatar && adapter.avatar instanceof Buffer) {
    const result = await uploadImageBufferService({ buffer: adapter.avatar, folderName: 'avatar' });
    adapter.avatar = result.url;
  }

  const updatedUser = await updateUserInfoByIdService(userId, adapter);

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

export const getListPermissionsInUserController = async (req) => {
  const userId = req.user.id;

  const permissions = await getListPermissionNameInUserService(userId);

  const permissionsDto = ModelDto.newList(AccountPermissionDto, permissions);
  return ApiResponse.success(permissionsDto, 'Get list permission successful');
};
