import HttpStatus from "http-status-codes";
import { NotFoundException } from "#src/core/exception/http-exception";
import {
  createUserService,
  findAllUsersService,
  findUserByIdService,
  removeUserByIdService,
  updateUserByIdService,
} from "#src/modules/users/users.service";

export const createUserController = async (req, res, next) => {
  try {
    const data = await createUserService({ ...req.body, file: req.file });
    return res.json({
      statusCode: HttpStatus.CREATED,
      message: "Create user successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllUsersController = async (req, res, next) => {
  try {
    const { list, meta } = await findAllUsersService(req.query);
    return res.json({
      statusCode: HttpStatus.OK,
      message: "Get all users successfully",
      data: list,
      meta,
    });
  } catch (err) {
    next(err);
  }
};

export const getUserByIdController = async (req, res, next) => {
  try {
    const data = await findUserByIdService(req.params.id);
    if (!data) {
      throw new NotFoundException("User not found");
    }

    return res.json({
      statusCode: HttpStatus.OK,
      message: "Get one user successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const updateUserByIdController = async (req, res, next) => {
  try {
    const data = await updateUserByIdService(req.params.id, {
      ...req.body,
      file: req.file,
    });
    return res.json({
      statusCode: HttpStatus.OK,
      message: "Update user successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const removeUserByIdController = async (req, res, next) => {
  try {
    const data = await removeUserByIdService(req.params.id);
    return res.json({
      statusCode: HttpStatus.OK,
      message: "Remove user successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};
