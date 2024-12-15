import HttpStatus from "http-status-codes";
import {
  createUserService,
  getAllUsersService,
  getUserByIdService,
  removeUserByIdService,
  checkExistEmailService,
  updateUserAvatarByIdService,
  updateUserInfoByIdService,
} from "#src/modules/users/users.service";
import { getRoleByIdService } from "#src/modules/roles/roles.service";
import { sendPasswordService } from "#src/modules/mailer/mailer.service";
import {
  ConflictException,
  NotFoundException,
} from "#src/core/exception/http-exception";
import { randomStr } from "#src/utils/string.util";
import { USER_TYPES } from "#src/core/constant";

export const createUserController = async (req, res, next) => {
  try {
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
    const newUser = await createUserService({
      ...req.body,
      type: USER_TYPES.USER,
      password,
    });

    // Send password to mail for user
    sendPasswordService(email, password);

    // Update avatar
    if (req.file) {
      await updateUserAvatarByIdService(newUser._id, req.file);
    }

    const formatterUser = await getUserByIdService(newUser._id);

    return res.json({
      statusCode: HttpStatus.CREATED,
      message: "Create user successfully",
      data: formatterUser,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllUsersController = async (req, res, next) => {
  try {
    const data = await getAllUsersService({
      ...req.query,
      type: USER_TYPES.USER,
    });
    return res.json({
      statusCode: HttpStatus.OK,
      message: "Get all users successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getUserByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existUser = await getUserByIdService(id);
    if (!existUser) {
      throw new NotFoundException("User not found");
    }

    return res.json({
      statusCode: HttpStatus.OK,
      message: "Get one user successfully",
      data: existUser,
    });
  } catch (err) {
    next(err);
  }
};

export const updateUserByIdController = async (req, res, next) => {
  try {
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

    return res.json({
      statusCode: HttpStatus.OK,
      message: "Update user successfully",
      data: updatedUser,
    });
  } catch (err) {
    next(err);
  }
};

export const removeUserByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existUser = await getUserByIdService(id);
    if (!existUser) {
      throw new NotFoundException("User not found");
    }

    const removedUser = await removeUserByIdService(id);
    return res.json({
      statusCode: HttpStatus.OK,
      message: "Remove user successfully",
      data: removedUser,
    });
  } catch (err) {
    next(err);
  }
};
