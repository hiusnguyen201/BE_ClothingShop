import HttpStatus from "http-status-codes";
import usersService from "#src/modules/users/users.service";

export const create = (req, res, next) => {
  const data = usersService.create();
  return res.json({
    statusCode: HttpStatus.CREATED,
    message: "Create",
    data,
  });
};

export const findAll = (req, res, next) => {
  const data = usersService.findAll();
  return res.json({
    statusCode: HttpStatus.OK,
    message: "Find all",
    data,
  });
};

export const findOne = (req, res, next) => {
  const data = usersService.findOne();
  return res.json({
    statusCode: HttpStatus.OK,
    message: "Find one",
    data,
  });
};

export const update = (req, res, next) => {
  const data = usersService.update();
  return res.json({
    statusCode: HttpStatus.OK,
    message: "Update",
    data: "Update",
  });
};

export const remove = (req, res, next) => {
  const data = usersService.remove();
  return res.json({
    statusCode: HttpStatus.OK,
    message: "Remove",
    data,
  });
};
