import HttpStatus from "http-status-codes";
import { NotFoundException } from "#src/core/exception/http-exception";
import {
    createCategoryService,
    findAllCategoriesService,
    findCategoryByIdService,
    updateCategoryByIdService,
    removeCategoryByIdService
} from "#src/modules/categories/categories.services";

export const createCategoryController = async (req, res, next) => {    
    try {        
        const data = await createCategoryService({ ...req.body, file: req.file });
        return res.json({
            statusCode: HttpStatus.CREATED,
            message: "Create category successfully",
            data,
        });
    } catch (err) {
        next(err);
    }
};

export const getAllCategoriesController = async (req, res, next) => {
    try {
        const { list, meta } = await findAllCategoriesService(req.query);
        return res.json({
            statusCode: HttpStatus.OK,
            message: "Get all categories successfully",
            data: list,
            meta,
        });
    } catch (err) {
        next(err);
    }
};

export const getCategoryByIdController = async (req, res, next) => {
    try {
        const data = await findCategoryByIdService(req.params.id);
        if (!data) {
            throw new NotFoundException("Category not found");
        }

        return res.json({
            statusCode: HttpStatus.OK,
            message: "Get one category successfully",
            data,
        });
    } catch (err) {
        next(err);
    }
};

export const updateCategoryByIdController = async (req, res, next) => {
    try {
        const data = await updateCategoryByIdService(req.params.id, {
            ...req.body,
            file: req.file,
        });
        return res.json({
            statusCode: HttpStatus.OK,
            message: "Update category successfully",
            data,
        });
    } catch (err) {
        next(err);
    }
};

export const removeCategoryByIdController = async (req, res, next) => {
    try {
        const data = await removeCategoryByIdService(req.params.id);
        return res.json({
            statusCode: HttpStatus.OK,
            message: "Remove category successfully",
            data,
        });
    } catch (err) {
        next(err);
    }
};
