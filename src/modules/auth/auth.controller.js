import HttpStatus from "http-status-codes";
import {
  registerService,
  forgotPasswordService,
  resetPasswordByTokenService,
  verifyOtpService,
  sendOtpViaEmailService,
  authenticateService,
} from "#src/modules/auth/auth.service";

export const registerController = async (req, res, next) => {
  try {
    const data = await registerService({ ...req.body, file: req.file });
    return res.json({
      statusCode: HttpStatus.OK,
      message: "Register successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const loginController = async (req, res, next) => {
  try {
    const data = await authenticateService(req.body);
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
    await sendOtpViaEmailService(req.body);
    return res.json({
      statusCode: HttpStatus.NO_CONTENT,
      message: "Send otp via email successfully",
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
    await forgotPasswordService(req.body);
    return res.json({
      statusCode: HttpStatus.NO_CONTENT,
      message: "Required Forgot Password Success",
    });
  } catch (err) {
    next(err);
  }
};

export const resetPasswordController = async (req, res, next) => {
  try {
    await resetPasswordByTokenService(req.params.token, req.body);
    return res.json({
      statusCode: HttpStatus.NO_CONTENT,
      message: "Reset password successfully",
    });
  } catch (err) {
    next(err);
  }
};
