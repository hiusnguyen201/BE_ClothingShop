import HttpStatus from "http-status-codes";
import { BadRequestException } from "#src/core/exception/http-exception"
import {
  loginService,
  registerService,
  forgotPasswordService,
  resetPasswordService
} from "#src/modules/auth/auth.service";
import { checkExistedUserById } from "#src/modules/users/users.service";

export const registerController = async (req, res, next) => {
  try {
    const existedUser = await checkExistedUserById(req.body.email);
    if (existedUser) {
      throw new BadRequestException("Email already exist");
    }

    const data = await registerService(req.body, req.file);
    return res.json({
      statusCode: HttpStatus.CREATED,
      message: "Register successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const loginController = async (req, res, next) => {
  try {
    const data = await loginService(req.body);
    return res.json({
      statusCode: HttpStatus.OK,
      message: "Login successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const forgotPasswordController = async (req, res, next) => {
  try {
    const data = await forgotPasswordService(req.body, req.params)
    return res.json({
      statusCode: HttpStatus.OK,
      message: "Required Forgot Password Success"
    })
  } catch (err) {
    next(err)
  }
}

export const resetPasswordController = async (req, res, next) => {
  try {
    const data = await resetPasswordService(req.body, req.params)
    return res.json({
      statusCode: HttpStatus.OK,
      message: 'Reset Password'
    })
  } catch (err) {
    next(err)
  }
}
