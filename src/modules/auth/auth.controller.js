import HttpStatus from "http-status-codes";
import {
  loginService,
  registerService,
  forgotPasswordService,
  resetPasswordService,
  verifyOtpService,
  sendOtpViaEmailService,
} from "#src/modules/auth/auth.service";

export const registerController = async (req, res, next) => {
  try {
    const data = await registerService(req.body, req.file, res);
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

export const sendOtpViaEmailController = async (req, res, next) => {
  try {
    const data = await sendOtpViaEmailService(req.body);
    return res.json({
      statusCode: HttpStatus.OK,
      message: "Verify Email Successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const verifyOtpController = async (req, res, next) => {
  try {
    const data = await verifyOtpService(req.body);
    return res.json({
      statusCode: HttpStatus.OK,
      message: "Verify otp successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const forgotPasswordController = async (req, res, next) => {
  try {
    const data = await forgotPasswordService(
      req.body,
      req.params,
      req.originalUrl
    );
    return res.json({
      statusCode: HttpStatus.OK,
      message: "Required Forgot Password Success",
    });
  } catch (err) {
    next(err);
  }
};

export const resetPasswordController = async (req, res, next) => {
  try {
    const data = await resetPasswordService(req.body, req.params.token);
    return res.json({
      statusCode: HttpStatus.OK,
      message: "Reset Password",
    });
  } catch (err) {
    next(err);
  }
};
