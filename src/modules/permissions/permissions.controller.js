import HttpStatus from "http-status-codes";
import { NotFoundException } from "#src/core/exception/http-exception";
import {
  createPermissionService,
  findAllPermissionsService,
  findPermissionByIdService,
  removePermissionByIdService,
  updatePermissionByIdService,
} from "#src/modules/permissions/permissions.service.js";

export const createPermissionController = async (req, res, next) => {
  try {
    const data = await createPermissionService(req.body);
    return res.json({
      statusCode: HttpStatus.CREATED,
      message: "Create permission successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllPermissionsController = async (req, res, next) => {
  try {
    const data = await findAllPermissionsService(req.query);
    return res.json({
      statusCode: HttpStatus.OK,
      message: "Get all permissions successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getPermissionByIdController = async (req, res, next) => {
  try {
    const data = await findPermissionByIdService(req.params.id);
    if (!data) {
      throw new NotFoundException("Permission not found");
    }

    return res.json({
      statusCode: HttpStatus.OK,
      message: "Get one permission successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const updatePermissionByIdController = async (req, res, next) => {
  try {
    const data = await updatePermissionByIdService(
      req.params.id,
      req.body
    );
    return res.json({
      statusCode: HttpStatus.OK,
      message: "Update permission successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const removePermissionByIdController = async (req, res, next) => {
  try {
    const data = await removePermissionByIdService(req.params.id);
    return res.json({
      statusCode: HttpStatus.OK,
      message: "Remove permission successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};
