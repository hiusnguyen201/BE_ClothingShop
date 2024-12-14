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
  // updateCategoryIconByIdService,
  // setIsHideService,
} from "#src/modules/categories/categories.services";
import { makeSlug } from "#src/utils/string.util";
import { CATEGORY_STATUS } from "#src/core/constant";

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

      if (existParent.parent) {
        throw new ConflictException("Parent category is child");
      }

    }

    const newCategory = await createCategoryService({
      ...req.body,
      slug: makeSlug(name),
    });

    // if (req.file) {
    //   return await updateCategoryIconByIdService(newCategory.id, req.file);
    // }

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
      // Check category is root
      req.query.parent = existCategory._id;
      const childCategories = await getAllCategoriesService(req.query, "_id");

      if (childCategories.list.length > 0) {
        throw new ConflictException("This category is root");
      }
      
      const existParent = await getCategoryByIdService(
        parent
      );
      if (!existParent) {
        throw new NotFoundException("Parent category not found");
      }

      if (existParent.isHide) {
        throw new ConflictException("Parent category is hide");
      }

      if (existParent.parent) {
        throw new ConflictException("Parent category is chlid");
      }

    }

    let updatedCategory = await updateCategoryInfoByIdService(id, {
      ...req.body,
      // [status && "isHidden"]: status === CATEGORY_STATUS.HIDDEN,
    });

    // if (req.file) {
    //   updatedCategory = await updateCategoryIconByIdService(
    //     id,
    //     req.file,
    //     updatedCategory?.icon
    //   );
    // }

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

    const category = await updateCategoryInfoByIdService(id, { isHide: false });

    return res.json({
      statusCode: HttpStatus.NO_CONTENT,
      message: "Set category successfully",
      data: category,
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

    const category = await updateCategoryInfoByIdService(id, { isHide: true });

    return res.json({
      statusCode: HttpStatus.NO_CONTENT,
      message: "Set category successfully",
      data: category,
    });

  } catch (err) {
    next(err);
  }
}