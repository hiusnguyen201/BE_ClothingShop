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
import { Code } from "#src/core/code/Code";
import { ApiResponse } from "#src/core/api/ApiResponse";
import { ModelDto } from "#src/core/dto/ModelDto";
import { TagDto } from "#src/app/tags/dtos/tag-dto";

export const createTagController = async (req) => {
    const { name } = req.body;
    const isExistTag = await checkExistTagNameService(name);

    if (isExistTag) {
        throw HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Tag already exist' });
    }

    const newTag = await createTagService({
        ...req.body,
        slug: makeSlug(name),
    });

    const tagDto = ModelDto.new(TagDto, newTag);
    return ApiResponse.success(tagDto);
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

    const tagsDto = ModelDto.newList(TagDto, tags);
    return ApiResponse.success({ meta: metaData, list: tagsDto });
};

export const getTagByIdController = async (req) => {
    const { id } = req.params;
    const existTag = await getTagByIdService(id);
    if (!existTag) {
        throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Tag not found' });
    }

    const tagDto = ModelDto.new(TagDto, existTag);
    return ApiResponse.success(tagDto);
};

export const updateTagByIdController = async (req) => {
    const { id } = req.params;
    const { name } = req.body;
    const existTag = await getTagByIdService(id, "_id");
    if (!existTag) {
        throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Tag not found' });
    }

    if (name) {
        const isExistTagName = await checkExistTagNameService(name, existTag._id);
        if (isExistTagName) {
            throw HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Tag name already exist' });
        }
        req.body.slug = makeSlug(name);
    }

    const updatedTag = await updateTagByIdService(id, req.body);

    const tagDto = ModelDto.new(TagDto, updatedTag);
    return ApiResponse.success(tagDto);
};

export const removeTagByIdController = async (req) => {
    const { id } = req.params;
    const existTag = await getTagByIdService(id, "_id");
    if (!existTag) {
        throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Tag not found' });
    }

    await removeTagByIdService(id);

    return ApiResponse.success();
};

export const isExistTagNameController = async (req) => {
    const { name } = req.body;
    const isExistTag = await checkExistTagNameService(name);

    return ApiResponse.success(isExistTag);
};