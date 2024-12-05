import HttpStatus from "http-status-codes";
import { NotFoundException, BadRequestException } from "#src/core/exception/http-exception";
import {
  createRole,
  findAllRoles,
  findRoleById,
  removeRoleById,
  updateRoleById,
  checkExistedRoleById,
} from "#src/modules/roles/roles.service";
import { isValidObjectId } from "mongoose";

export const createRoleController = async (req, res, next) => {
  try {
    req.body.permissions.forEach(permission => {
      if (!isValidObjectId(permission)) {
        throw new BadRequestException(`Invalid ObjectId ${permission}`);
      }
    });

    const data = await createRole({ ...req.body, file: req.file });
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
    const data = await findAllRoles(req.query);
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
    const data = await findRoleById(req.params.id);
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
    const { id } = req.params;
    const checkExistedRole = await checkExistedRoleById(id, "_id");
    if (!checkExistedRole) {
      throw new NotFoundException("Role not found");
    }

    req.body.permissions.forEach(permission => {
      if (!isValidObjectId(permission)) {
        throw new BadRequestException(`Invalid ObjectId ${permission}`);
      }
    });

    const data = await updateRoleById(id, {
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
    const { id } = req.params;
    const checkExistedRole = await checkExistedRoleById(id, "_id");
    if (!checkExistedRole) {
      throw new NotFoundException("Role not found");
    }

    const data = await removeRoleById(id);
    return res.json({
      statusCode: HttpStatus.OK,
      message: "Remove role successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};
