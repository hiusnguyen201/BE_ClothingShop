import HttpStatus from "http-status-codes";
import usersService from "#src/modules/users/users.service";

export const create = async (req, res, next) => {
  try {
    const data = await usersService.create(req.body);
    return res.json({
      statusCode: HttpStatus.CREATED,
      message: "Create",
      data,
    });
  } catch (error) {
    console.log(error);
  }

};

export const findAll = async (req, res, next) => {
  try {
    const data = await usersService.findAll(req.query);
    return res.json({
      statusCode: HttpStatus.OK,
      message: "Find all",
      data,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      statusCode: HttpStatus.OK,
      message: "Error",
      data,
    });
  }
};

export const findOne = async (req, res, next) => {
  try {
    const data = await usersService.findOne(req.params.identify);
    return res.json({
      statusCode: HttpStatus.OK,
      message: "Find one",
      data,
    });
  } catch (error) {
    console.log(error);
  }
};

export const update = async (req, res, next) => {
  try {    
    const data = await usersService.update(req.params.identify, req.body);
    return res.json({
      statusCode: HttpStatus.OK,
      message: "Update",
      data: data,
    });
  } catch (error) {
    console.log(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const data = await usersService.remove(req.params.identify);
    return res.json({
      statusCode: HttpStatus.OK,
      message: "Remove",
      data,
    });
  } catch (error) {
    console.log(error);
  }
};
