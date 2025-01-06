import HttpStatus from "http-status-codes";
import {
  createUserService,
  getAllUsersService,
  getUserByIdService,
  removeUserByIdService,
  checkExistEmailService,
  updateUserAvatarByIdService,
  updateUserInfoByIdService,
  countAllUsersService,
} from "#src/modules/users/users.service";
import { getRoleByIdService } from "#src/modules/roles/roles.service";
import { sendPasswordService } from "#src/modules/mailer/mailer.service";
import {
  ConflictException,
  NotFoundException,
} from "#src/core/exception/http-exception";
import { randomStr } from "#src/utils/string.util";
import { USER_TYPES } from "#src/core/constant";
import { makeHash } from "#src/utils/bcrypt.util";
import { calculatePagination } from "#src/utils/pagination.util";

export const createUserController = async (req) => {
  const { email, role } = req.body;
  const isExistEmail = await checkExistEmailService(email);
  if (isExistEmail) {
    throw new ConflictException("Email already exist");
  }

  if (role) {
    const existRole = await getRoleByIdService(role);
    if (!existRole) {
      throw new NotFoundException("Role not found");
    }
  }

  const password = randomStr(32);
  const hashedPassword = makeHash(password);
  const newUser = await createUserService({
    ...req.body,
    password: hashedPassword,
    type: USER_TYPES.USER,
  });

  // Send password to mail for user
  await sendPasswordService(email, password);

  // Update avatar
  if (req.file) {
    await updateUserAvatarByIdService(newUser._id, req.file);
  }

  const formatterUser = await getUserByIdService(newUser._id);

  return {
    statusCode: HttpStatus.CREATED,
    message: "Create user successfully",
    data: formatterUser,
  };
};

export const getAllUsersController = async (req) => {
  let { keyword = "", limit = 10, page = 1 } = req.query;

  const filterOptions = {
    $or: [
      { name: { $regex: keyword, $options: "i" } },
      { email: { $regex: keyword, $options: "i" } },
    ],
    type: USER_TYPES.USER,
  };

  const totalCount = await countAllUsersService(filterOptions);
  const metaData = calculatePagination(page, limit, totalCount);

  const users = await getAllUsersService({
    filters: filterOptions,
    offset: metaData.offset,
    limit: metaData.limit,
  });

  return {
    statusCode: HttpStatus.OK,
    message: "Get all users successfully",
    data: { meta: metaData, list: users },
  };
};

export const getUserByIdController = async (req) => {
  const { id } = req.params;
  const existUser = await getUserByIdService(id);
  if (!existUser) {
    throw new NotFoundException("User not found");
  }

  return {
    statusCode: HttpStatus.OK,
    message: "Get one user successfully",
    data: existUser,
  };
};

export const updateUserByIdController = async (req) => {
  const { id } = req.params;
  const existUser = await getUserByIdService(id, "_id");
  if (!existUser) {
    throw new NotFoundException("User not found");
  }

  const { email, role } = req.body;
  if (email) {
    const isExistEmail = await checkExistEmailService(email, id);
    if (isExistEmail) {
      throw new ConflictException("Email already exist");
    }
  }

  if (role) {
    const existRole = await getRoleByIdService(role);
    if (!existRole) {
      throw new NotFoundException("Role not found");
    }
  }

  // Update basic info
  let updatedUser = await updateUserInfoByIdService(id, req.body);

  // Update avatar
  if (req.file) {
    updatedUser = await updateUserAvatarByIdService(
      id,
      req.file,
      updatedUser?.avatar
    );
  }

  return {
    statusCode: HttpStatus.OK,
    message: "Update user successfully",
    data: updatedUser,
  };
};

export const removeUserByIdController = async (req) => {
  const { id } = req.params;
  const existUser = await getUserByIdService(id);
  if (!existUser) {
    throw new NotFoundException("User not found");
  }

  const removedUser = await removeUserByIdService(id);
  return {
    statusCode: HttpStatus.OK,
    message: "Remove user successfully",
    data: removedUser,
  };
};
