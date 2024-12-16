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
  showCategoryService,
  hideCategoryService,
  getMaxLevelToRoot,
  getMaxLevelToLeaf,
} from "#src/modules/categories/categories.service";
import { makeSlug } from "#src/utils/string.util";

export const createCategoryController = async (req, res, next) => {
  try {
    const { name, parent } = req.body;
    const isExistName = await checkExistCategoryNameService(name);
    if (isExistName) {
      throw new ConflictException("Category name already exist");
    }

    if (parent) {
      const existParent = await getCategoryByIdService(
        parent
      );

      if (!existParent) {
        throw new NotFoundException("Parent category not found");
      }

      if (existParent.isHide) {
        throw new ConflictException("Parent category is hide");
      }

      const level = await getMaxLevelToRoot(existParent._id);

      if (level >= 3) {
        throw new ConflictException("Parent category is reach limit");
      }

    }

    const newCategory = await createCategoryService({
      ...req.body,
      slug: makeSlug(name),
    });

    // Update Icon
    if (req.file) {
      await updateCategoryIconByIdService(newCategory._id, req.file);
    }

    const formatterCategory = await getCategoryByIdService(newCategory._id);

    return res.json({
      statusCode: HttpStatus.CREATED,
      message: "Create category successfully",
      data: formatterCategory,
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

    const { name, parent } = req.body;
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

    if (parent) {
      const existParent = await getCategoryByIdService(
        parent
      );
      if (!existParent) {
        throw new NotFoundException("Parent category not found");
      }

      if (existParent.isHide) {
        throw new ConflictException("Parent category is hide");
      }

      const parentLevel = await getMaxLevelToRoot(existParent._id);
      
      const currentCategoryLevel = await getMaxLevelToLeaf(existCategory._id);
      
      const sumLevel = parentLevel + currentCategoryLevel

      if (sumLevel > 3) {
        throw new ConflictException("Parent category is reach limit");
      }

    }

    let updatedCategory = await updateCategoryInfoByIdService(id, {
      ...req.body,
      // [status && "isHidden"]: status === CATEGORY_STATUS.HIDDEN,
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

export const isExistCategoryNameController = async (req, res, next) => {
  try {
    const { name } = req.body;
    const isExistName = await checkExistCategoryNameService(name);

    return res.json({
      statusCode: HttpStatus.OK,
      message: "Get category successfully",
      data: isExistName,
    });

  } catch (err) {
    next(err);
  }
}

export const showCategoryByIdController = async (req, res, next) => {
  try {
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

  } catch (err) {
    next(err);
  }
}

export const hideCategoryByIdController = async (req, res, next) => {
  try {
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

  } catch (err) {
    next(err);
  }
}