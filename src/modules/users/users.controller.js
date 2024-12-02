import HttpStatus from "http-status-codes";
import * as usersService from "#src/modules/users/users.service";
import { UploadUtils } from "#src/utils/upload.util";

export const create = async (req, res, next) => {
  try {
    const data = await usersService.createUser(req.body, req.file);
    return res.json({
      statusCode: HttpStatus.CREATED,
      message: "Create",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const findAll = async (req, res, next) => {
  try {
    const data = await usersService.findAllUsers(req.query);
    return res.json({
      statusCode: HttpStatus.OK,
      message: "Find all",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const findOne = async (req, res, next) => {
  try {
    const data = await usersService.findUser(req.params.id);
    return res.json({
      statusCode: HttpStatus.OK,
      message: "Find one",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const data = await usersService.updateUser(req.params.id, req.body);
    return res.json({
      statusCode: HttpStatus.OK,
      message: "Update",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    const data = await usersService.removeUser(req.params.id);
    return res.json({
      statusCode: HttpStatus.OK,
      message: "Remove",
      data,
    });
  } catch (err) {
    next(err);
  }
};
