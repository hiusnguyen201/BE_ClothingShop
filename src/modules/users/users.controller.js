import HttpStatus from "http-status-codes";
import usersService from "#src/modules/users/users.service";

export const create = async (req, res, next) => {
  try {
    // const data = await usersService.create(req.body);
    return res.json({
      statusCode: HttpStatus.CREATED,
      message: "Create",
      // data,
    });
  } catch (err) {
    next(err);
  }
};

export const findAll = (req, res, next) => {
  try {
    const data = usersService.findAll();
    return res.json({
      statusCode: HttpStatus.OK,
      message: "Find all",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const findOne = (req, res, next) => {
  try {
    const data = usersService.findOne();
    return res.json({
      statusCode: HttpStatus.OK,
      message: "Find one",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const update = (req, res, next) => {
  try {
    const data = usersService.update();
    return res.json({
      statusCode: HttpStatus.OK,
      message: "Update",
      data: "Update",
    });
  } catch (err) {
    next(err);
  }
};

export const remove = (req, res, next) => {
  try {
    const data = usersService.remove();
    return res.json({
      statusCode: HttpStatus.OK,
      message: "Remove",
      data,
    });
  } catch (err) {
    next(err);
  }
};
