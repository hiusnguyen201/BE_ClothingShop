import HttpStatus from "http-status-codes";
import { NotFoundException } from "#src/core/exception/http-exception";
import {
  createRoleService,
  getAllRolesService,
  getRoleByIdService,
  removeRoleByIdService,
  updateRolePermissionsByIdService,
  updateRoleIconByIdService,
  updateRoleInfoByIdService,
  checkExistRoleNameService,
} from "#src/modules/roles/roles.service";
import { makeSlug } from "#src/utils/string.util";

export const createRoleController = async (req, res, next) => {
  try {
    const { name, permissions } = req.body;
    const isExistName = await checkExistRoleNameService(name);
    if (isExistName) {
      throw new ConflictException("Role name already exist");
    }

    const newRole = await createRoleService({
      ...req.body,
      slug: makeSlug(name),
    });

    // Update permissions
    if (permissions && permissions.length > 0) {
      await updateRolePermissionsByIdService(newRole._id, permissions);
    }

    // Update icon
    if (req.file) {
      await updateRoleIconByIdService(newRole._id, req.file);
    }

    const formatterRole = await getRoleByIdService(newRole._id);

    return res.json({
      statusCode: HttpStatus.CREATED,
      message: "Create role successfully",
      data: formatterRole,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllRolesController = async (req, res, next) => {
  try {
    const data = await getAllRolesService(req.query);
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
    const { id } = req.params;
    const existRole = await getRoleByIdService(id);
    if (!existRole) {
      throw new NotFoundException("Role not found");
    }

    return res.json({
      statusCode: HttpStatus.OK,
      message: "Get one role successfully",
      data: existRole,
    });
  } catch (err) {
    next(err);
  }
};

export const updateRoleByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existRole = await getRoleByIdService(id, "_id");
    if (!existRole) {
      throw new NotFoundException("Role not found");
    }

    const { name, permissions } = req.body;
    if (name) {
      const isExistName = await checkExistRoleNameService(name, id);
      if (isExistName) {
        throw new ConflictException("Role name already exist");
      }
      req.body.slug = makeSlug(name);
    }

    // Update basic info
    let updatedRole = await updateRoleInfoByIdService(id, req.body);

    // Update icon
    if (req.file) {
      updatedRole = await updateRoleIconByIdService(
        id,
        req.file,
        updatedRole?.icon
      );
    }

    // Update permissions
    if (permissions && permissions.length > 0) {
      updatedRole = await updateRolePermissionsByIdService(
        id,
        permissions
      );
    }

    return res.json({
      statusCode: HttpStatus.OK,
      message: "Update role successfully",
      data: updatedRole,
    });
  } catch (err) {
    next(err);
  }
};

export const removeRoleByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existRole = await getRoleByIdService(id);
    if (!existRole) {
      throw new NotFoundException("Role not found");
    }

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
