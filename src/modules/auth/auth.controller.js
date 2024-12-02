import HttpStatus from "http-status-codes";
import {
  loginService,
  registerService,
} from "#src/modules/auth/auth.service";

export const registerController = async (req, res, next) => {
  try {
    const data = await registerService(req.body, req.file);
    return res.json({
      statusCode: HttpStatus.CREATED,
      message: "Register",
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
      message: "Login",
      data,
    });
  } catch (err) {
    next(err);
  }
};
