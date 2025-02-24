import HttpStatus from 'http-status-codes';
import userService from '#app/v2/users/UserService';
import { CreateUserAdapter } from '#app/v2/users/adapters/CreateUserAdapter';
import { GetUserListAdapter } from '#app/v2/users/adapters/GetUserListAdapter';
import { GetUserByIdAdapter } from '#app/v2/users/adapters/GetUserByIdAdapter';
import { CheckExistEmailAdapter } from '#app/v2/users/adapters/CheckExistEmailAdapter';
import { UpdateUserInfoByIdAdapter } from '#app/v2/users/adapters/UpdateUserInfoByIdAdapter';
import { UpdateUserAvatarByIdAdapter } from '#app/v2/users/adapters/UpdateUserAvatarByIdAdapter';
import { RemoveUserByIdAdapter } from '#app/v2/users/adapters/RemoveUserByIdAdapter';
import { ApiResponse } from '#core/api/ApiResponse';

class UserController {
  createUser = async (req) => {
    const adapter = await CreateUserAdapter.new({
      avatar: req.body.avatar,
      name: req.body.name,
      email: req.body.email,
      gender: req.body.gender,
      roleId: req.body.roleId,
      phone: req.body.phone,
    });

    const createdUser = await userService.createUser(adapter);

    return ApiResponse.statusCode(HttpStatus.CREATED).success(createdUser);
  };

  getUserList = async (req) => {
    const adapter = await GetUserListAdapter.new({
      keyword: req.query.keyword,
      limit: req.query.limit,
      page: req.query.page,
      status: req.query.status,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
    });

    const data = await userService.getUserList(adapter);

    return ApiResponse.statusCode(HttpStatus.OK).success(data);
  };

  getUserById = async (req) => {
    const adapter = await GetUserByIdAdapter.new({
      userId: req.params.userId,
    });

    const user = await userService.getUserById(adapter);

    return ApiResponse.statusCode(HttpStatus.OK).success(user);
  };

  updateUserInfoById = async (req) => {
    const adapter = await UpdateUserInfoByIdAdapter.new({
      userId: req.params.userId,
      name: req.body.name,
      email: req.body.email,
      gender: req.body.gender,
      roleId: req.body.roleId,
      phone: req.body.phone,
    });

    const updatedUser = await userService.updateUserInfoById(adapter);

    return ApiResponse.statusCode(HttpStatus.OK).success(updatedUser);
  };

  updateUserAvatarById = async (req) => {
    const adapter = await UpdateUserAvatarByIdAdapter.new({
      userId: req.params.userId,
      avatar: req.body.avatar,
    });

    const updatedUser = await userService.updateUserAvatarById(adapter);

    return ApiResponse.statusCode(HttpStatus.OK).success(updatedUser);
  };

  removeUserById = async (req) => {
    const adapter = await RemoveUserByIdAdapter.new({
      userId: req.params.userId,
    });

    const removedUser = await userService.removeUserById(adapter);

    return ApiResponse.statusCode(HttpStatus.OK).success(removedUser);
  };

  checkExistEmail = async (req) => {
    const adapter = await CheckExistEmailAdapter.new({
      email: req.body.email,
    });

    const isExistEmail = await userService.checkExistUser(adapter);

    return ApiResponse.statusCode(HttpStatus.OK).success(isExistEmail);
  };
}

export default new UserController();
