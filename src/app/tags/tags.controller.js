import HttpStatus from "http-status-codes";
import {
  HttpException,
} from "#src/core/exception/http-exception";

import {
  createTagService,
  getAllTagsService,
  getTagByIdService,
  updateTagByIdService,
  removeTagByIdService,
  countAllTagsService,
  checkExistTagNameService,
} from "#src/app/tags/tags.service"
import { calculatePagination } from "#src/utils/pagination.util";
import { makeSlug } from "#src/utils/string.util";

export const createTagController = async (req) => {
  const { name } = req.body;
  const isExistTag = await checkExistTagNameService(name);

  if (isExistTag) {
    throw new ConflictException("Tag already exist");
  }

  const newTag = await createTagService({
    ...req.body,
    slug: makeSlug(name),
  });

  return {
    statusCode: HttpStatus.CREATED,
    message: "Create tag successfully",
    data: newTag,
  };
};

export const getAllTagsController = async (req) => {
  let { keyword = "", limit = 10, page = 1 } = req.query;

  const filterOptions = {
    $or: [
      { name: { $regex: keyword, $options: "i" } },
    ],
  };

  const totalCount = await countAllTagsService(filterOptions);
  const metaData = calculatePagination(page, limit, totalCount);

  const tags = await getAllTagsService({
    filters: filterOptions,
    offset: metaData.offset,
    limit: metaData.limit,
  });

  return {
    statusCode: HttpStatus.OK,
    message: "Get all tags successfully",
    data: {
      meta: metaData,
      list: tags,
    },
  };
};

export const getTagByIdController = async (req) => {
  const { id } = req.params;
  const existTag = await getTagByIdService(id);
  if (!existTag) {
    throw new NotFoundException("Tag not found");
  }

  return {
    statusCode: HttpStatus.OK,
    message: "Get one tag successfully",
    data: existTag,
  };
};

export const updateTagByIdController = async (req) => {
  const { id } = req.params;
  const { name } = req.body;
  const existTag = await getTagByIdService(id, "_id");
  if (!existTag) {
    throw new NotFoundException("Tag not found");
  }

  if (name) {
    const isExistTagName = await checkExistTagNameService(name, existTag._id);
    if (isExistTagName) {
      throw new ConflictException("Tag name already exist");
    }
    req.body.slug = makeSlug(name);
  }

  const updatedTag = await updateTagByIdService(id, req.body);

  return {
    statusCode: HttpStatus.OK,
    message: "Update tag successfully",
    data: updatedTag,
  };
};

export const removeTagByIdController = async (req) => {
  const { id } = req.params;
  const existTag = await getTagByIdService(id, "_id");
  if (!existTag) {
    throw new NotFoundException("Tag not found");
  }

  const removedTag = await removeTagByIdService(id);

  return {
    statusCode: HttpStatus.OK,
    message: "Remove tag successfully",
    data: removedTag,
  };
};

export const isExistTagNameController = async (req) => {
  const { name } = req.body;
  const isExistTag = await checkExistTagNameService(name);

  return {
    statusCode: HttpStatus.OK,
    message: isExistTag
      ? "Tag name exists"
      : "Tag name does not exist",
    data: isExistTag,
  };
};