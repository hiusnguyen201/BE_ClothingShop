import HttpStatus from "http-status-codes";
import {
  NotFoundException,
  ConflictException,
  PreconditionFailedException,
} from "#src/core/exception/http-exception";
import {
  createCategoryService,
  getAllCategoriesService,
  getCategoryByIdService,
  updateCategoryInfoByIdService,
  removeCategoryByIdService,
  checkExistCategoryNameService,
  updateCategoryImageByIdService,
  showCategoryService,
  hideCategoryService,
} from "#src/modules/categories/categories.service";
import { makeSlug } from "#src/utils/string.util";

const MAX_LEVEL_CHILDREN = 2;

export const createCategoryController = async (req, res, next) => {
  let { name, parent, level = 1 } = req.body;
  const isExistName = await checkExistCategoryNameService(name);
  if (isExistName) {
    throw new ConflictException("Category name already exist");
  }

  if (parent) {
    const existParent = await getCategoryByIdService(parent);

    if (!existParent) {
      throw new NotFoundException("Parent category not found");
    }

    if (existParent.isHide) {
      throw new ConflictException("Parent category is hidden");
    }

    const newCategoryLevel = existParent.level + 1;
    if (existParent.level > MAX_LEVEL_CHILDREN) {
      throw new ConflictException("Parent category is reach limit");
    }
    level = newCategoryLevel;
  }

  const newCategory = await createCategoryService({
    ...req.body,
    level,
    slug: makeSlug(name),
  });

  // Update Image
  if (req.file) {
    await updateCategoryImageByIdService(newCategory._id, req.file);
  }

  const formatterCategory = await getCategoryByIdService(newCategory._id);

  return res.json({
    statusCode: HttpStatus.CREATED,
    message: "Create category successfully",
    data: formatterCategory,
  });
};

export const getAllCategoriesController = async (req, res, next) => {
  const data = await getAllCategoriesService(req.query);
  return res.json({
    statusCode: HttpStatus.OK,
    message: "Get all categories successfully",
    data,
  });
};

export const getCategoryByIdController = async (req, res, next) => {
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
};

export const updateCategoryByIdController = async (req, res, next) => {
  const { id } = req.params;
  const existCategory = await getCategoryByIdService(id, "_id");
  if (!existCategory) {
    throw new NotFoundException("Category not found");
  }

  const { name } = req.body;
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

  let updatedCategory = await updateCategoryInfoByIdService(id, req.body);

  if (req.file) {
    updatedCategory = await updateCategoryImageByIdService(
      id,
      req.file,
      updatedCategory?.image
    );
  }

  return res.json({
    statusCode: HttpStatus.OK,
    message: "Update category successfully",
    data: updatedCategory,
  });
};

export const removeCategoryByIdController = async (req, res, next) => {
  const { id } = req.params;
  const existCategory = await getCategoryByIdService(id);
  if (!existCategory) {
    throw new NotFoundException("Category not found");
  }

  if (!existCategory.isHide) {
    throw new PreconditionFailedException("Category is public");
  }

  const removedCategory = await removeCategoryByIdService(id);
  return res.json({
    statusCode: HttpStatus.OK,
    message: "Remove category successfully",
    data: removedCategory,
  });
};

export const isExistCategoryNameController = async (req, res, next) => {
  const { name } = req.body;
  const isExistName = await checkExistCategoryNameService(name);

  return res.json({
    statusCode: HttpStatus.OK,
    message: isExistName
      ? "Category name exists"
      : "Category name does not exist",
    data: isExistName,
  });
};

export const showCategoryByIdController = async (req, res, next) => {
  const { id } = req.params;
  const existCategory = await getCategoryByIdService(id, "_id");
  if (!existCategory) {
    throw new NotFoundException("Category not found");
  }

  await showCategoryService(id);

  return res.json({
    statusCode: HttpStatus.NO_CONTENT,
    message: "Show category successfully",
  });
};

export const hideCategoryByIdController = async (req, res, next) => {
  const { id } = req.params;
  const existCategory = await getCategoryByIdService(id, "_id");
  if (!existCategory) {
    throw new NotFoundException("Category not found");
  }

  await hideCategoryService(id);

  return res.json({
    statusCode: HttpStatus.NO_CONTENT,
    message: "Hide category successfully",
  });
};
