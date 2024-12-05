import HttpStatus from "http-status-codes";
import { NotFoundException } from "#src/core/exception/http-exception";
import {
  createPermission,
  findAllPermissions,
  findPermissionById,
  updatePermissionById,
  removePermissionById,
  checkExistedPermissionById,
} from "#src/modules/permissions/permissions.service.js";

export const createPermissionController = async (req, res, next) => {
  try {
    const data = await createPermission(req.body);
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
    const data = await findAllPermissions(req.query);
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
    const data = await findPermissionById(req.params.id);
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
    const { id } = req.params;
    const checkExistedPermission = await checkExistedPermissionById(id, "_id");
    if (!checkExistedPermission) {
      throw new NotFoundException("Permission not found");
    }

    const data = await updatePermissionById(id, {
      ...req.body,
      file: req.file,
    });
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
    const { id } = req.params;
    const checkExistedPermission = await checkExistedPermissionById(id, "_id");
    if (!checkExistedPermission) {
      throw new NotFoundException("Permission not found");
    }

    const data = await removePermissionById(id);
    return res.json({
      statusCode: HttpStatus.OK,
      message: "Remove permission successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};