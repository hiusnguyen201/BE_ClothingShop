import HttpStatus from "http-status-codes";
import { NotFoundException } from "#src/core/exception/http-exception";
import {
  createUser,
  findAllUsers,
  findUserById,
  removeUserById,
  updateUserById,
  checkExistedUserById,
} from "#src/modules/users/users.service";

export const createUserController = async (req, res, next) => {
  try {
    const data = await createUser({ ...req.body, file: req.file });
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
    const data = await findAllUsers(req.query);
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
    const data = await findUserById(req.params.id);
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
    const { id } = req.params;
    const checkExistedUser = await checkExistedUserById(id, "_id");
    if (!checkExistedUser) {
      throw new NotFoundException("User not found");
    }

    const data = await updateUserById(id, {
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
    const { id } = req.params;
    const checkExistedUser = await checkExistedUserById(id, "_id");
    if (!checkExistedUser) {
      throw new NotFoundException("User not found");
    }

    const data = await removeUserById(id);
    return res.json({
      statusCode: HttpStatus.OK,
      message: "Remove user successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};
