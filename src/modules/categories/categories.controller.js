import HttpStatus from "http-status-codes";
import {
  NotFoundException,
  ConflictException,
} from "#src/core/exception/http-exception";
import {
  createCategoryService,
  getAllCategoriesService,
  getCategoryByIdService,
  updateCategoryInfoByIdService,
  removeCategoryByIdService,
  checkExistCategoryNameService,
  updateCategoryIconByIdService,
} from "#src/modules/categories/categories.services";
import { makeSlug } from "#src/utils/string.util";
import { CATEGORY_STATUS } from "#src/core/constant";

export const createCategoryController = async (req, res, next) => {
  try {
    const { name, parentCategory, status } = req.body;
    const isExistName = await checkExistCategoryNameService(name);
    if (isExistName) {
      throw new ConflictException("Category name already exist");
    }

    if (parentCategory) {
      const existParentCategory = await getCategoryByIdService(
        parentCategory
      );
      if (!existParentCategory) {
        throw new NotFoundException("Parent category not found");
      }
    }

    const newCategory = await createCategoryService({
      ...req.body,
      isHidden: status === CATEGORY_STATUS.HIDDEN,
      slug: makeSlug(name),
    });

    if (req.file) {
      return await updateCategoryIconByIdService(newCategory.id, req.file);
    }

    return res.json({
      statusCode: HttpStatus.CREATED,
      message: "Create category successfully",
      data: newCategory,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllCategoriesController = async (req, res, next) => {
  try {
    const data = await getAllCategoriesService(req.query);
    return res.json({
      statusCode: HttpStatus.OK,
      message: "Get all categories successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getCategoryByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existCategory = await getCategoryByIdService(id);
    if (!existCategory) {
      throw new NotFoundException("Category not found");
    }

    return res.json({
      statusCode: HttpStatus.OK,
      message: "Get one category successfully",
      data: existCategory,
    });
  } catch (err) {
    next(err);
  }
};

export const updateCategoryByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existCategory = await getCategoryByIdService(id, "_id");
    if (!existCategory) {
      throw new NotFoundException("Category not found");
    }

    const { name, parentCategory, status } = req.body;
    if (name) {
      const isExistName = await checkExistCategoryNameService(
        name,
        existCategory._id
      );
      if (isExistName) {
        throw new ConflictException("Category name already exist");
      }
      req.body.slug = makeSlug(name);
    }

    if (parentCategory) {
      const existParentCategory = await getCategoryByIdService(
        parentCategory
      );
      if (!existParentCategory) {
        throw new NotFoundException("Parent category not found");
      }
    }

    let updatedCategory = await updateCategoryInfoByIdService(id, {
      ...req.body,
      [status && "isHidden"]: status === CATEGORY_STATUS.HIDDEN,
    });

    if (req.file) {
      updatedCategory = await updateCategoryIconByIdService(
        id,
        req.file,
        updatedCategory?.icon
      );
    }

    return res.json({
      statusCode: HttpStatus.OK,
      message: "Update category successfully",
      data: updatedCategory,
    });
  } catch (err) {
    next(err);
  }
};

export const removeCategoryByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existCategory = await getCategoryByIdService(id, "_id");
    if (!existCategory) {
      throw new NotFoundException("Category not found");
    }

    const removedCategory = await removeCategoryByIdService(id);
    return res.json({
      statusCode: HttpStatus.OK,
      message: "Remove category successfully",
      data: removedCategory,
    });
  } catch (err) {
    next(err);
  }
};
