import HttpStatus from "http-status-codes";
import { NotFoundException } from "#src/core/exception/http-exception";
import {
  createRoleService,
  findAllRolesService,
  findRoleByIdService,
  removeRoleByIdService,
  updateRoleByIdService,
} from "#src/modules/roles/roles.service";

export const createRoleController = async (req, res, next) => {
  try {
    const data = await createRoleService({ ...req.body, file: req.file });
    return res.json({
      statusCode: HttpStatus.CREATED,
      message: "Create role successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllRolesController = async (req, res, next) => {
  try {
    const data = await findAllRolesService(req.query);
    return res.json({
      statusCode: HttpStatus.OK,
      message: "Get all roles successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getRoleByIdController = async (req, res, next) => {
  try {
    const data = await findRoleByIdService(req.params.id);
    if (!data) {
      throw new NotFoundException("Role not found");
    }

    return res.json({
      statusCode: HttpStatus.OK,
      message: "Get one role successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const updateRoleByIdController = async (req, res, next) => {
  try {
    const data = await updateRoleByIdService(req.params.id, {
      ...req.body,
      file: req.file,
    });
    return res.json({
      statusCode: HttpStatus.OK,
      message: "Update role successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const removeRoleByIdController = async (req, res, next) => {
  try {
    const data = await removeRoleByIdService(req.params.id);
    return res.json({
      statusCode: HttpStatus.OK,
      message: "Remove role successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};
