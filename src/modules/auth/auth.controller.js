import HttpStatus from "http-status-codes";
import path from "path";
import {
  createUserService,
  getUserByIdService,
  checkExistEmailService,
  updateUserAvatarByIdService,
  updateUserVerifiedByIdService,
  changePasswordByIdService,
} from "#src/modules/users/users.service";
import {
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from "#src/core/exception/http-exception";
import { compareHash, makeHash } from "#src/utils/bcrypt.util";
import { generateToken } from "#src/utils/jwt.util";
import { USER_TYPES } from "#src/core/constant";
import {
  createUserOtpService,
  getUserOtpByOtpAndUserIdService,
} from "#src/modules/user-otps/user-otps.service";
import {
  sendOtpCodeService,
  sendResetPasswordRequestService,
  sendResetPasswordSuccessService,
  sendWelcomeEmailService,
} from "#src/modules/mailer/mailer.service";
import {
  createResetPasswordService,
  getResetPasswordByTokenService,
} from "#src/modules/reset-password/reset-password.service";

export const registerController = async (req, res) => {
  const { password, email } = req.body;
  const isExistEmail = await checkExistEmailService(email);
  if (isExistEmail) {
    throw new ConflictException("Email already exist");
  }

  const hashedPassword = makeHash(password);
  const newCustomer = await createUserService({
    ...req.body,
    password: hashedPassword,
    type: USER_TYPES.CUSTOMER,
  });

  if (req.file) {
    return await updateUserAvatarByIdService(newCustomer._id, req.file);
  }

  return res.json({
    statusCode: HttpStatus.OK,
    message: "Register successfully",
    data: {
      isAuthenticated: false,
      accessToken: null,
      is2FactorRequired: true,
      user: {
        _id: newCustomer._id,
        name: newCustomer.name,
        email: newCustomer.email,
      },
    },
  });
};

export const loginController = async (req, res) => {
  const { email, password } = req.body;

  const user = await getUserByIdService(
    email,
    "_id password name email isVerified type"
  );
  if (!user) {
    throw new UnauthorizedException("Invalid Credentials");
  }

  const isMatchPassword = compareHash(password, user.password);
  if (!isMatchPassword) {
    throw new UnauthorizedException("Invalid Credentials");
  }

  const isNeed2Fa = !user.isVerified || user.type === USER_TYPES.USER;

  return res.json({
    statusCode: HttpStatus.OK,
    message: "Login successfully",
    data: {
      isAuthenticated: !isNeed2Fa,
      accessToken: isNeed2Fa ? null : generateToken({ userId: user._id }),
      is2FactorRequired: isNeed2Fa,
      user: { _id: user._id, name: user.name, email: user.email },
    },
  });
};

export const sendOtpViaEmailController = async (req, res) => {
  const { email } = req.body;
  const user = await getUserByIdService(email);
  if (!user) {
    throw new NotFoundException("User not found");
  }

  const userOtp = await createUserOtpService(user._id);
  await sendOtpCodeService(user.email, userOtp.otp);

  return res.json({
    statusCode: HttpStatus.NO_CONTENT,
    message: "Send otp via email successfully",
  });
};

export const verifyOtpController = async (req, res) => {
  const { email, otp } = req.body;
  const user = await getUserByIdService(
    email,
    "_id email name isVerified"
  );
  if (!user) {
    throw new NotFoundException("User not found");
  }

  const userOtp = await getUserOtpByOtpAndUserIdService(otp, user._id);
  if (!userOtp) {
    throw new UnauthorizedException("Invalid or expired otp");
  }

  if (!user.isVerified) {
    await updateUserVerifiedByIdService(user._id);
    sendWelcomeEmailService(user.email, user.name);
  }

  const accessToken = generateToken({ userId: user._id });
  return res.json({
    statusCode: HttpStatus.OK,
    message: "Verify otp successfully",
    data: {
      isAuthenticated: true,
      accessToken,
      user: { _id: user._id, name: user.name, email: user.email },
    },
  });
};

export const forgotPasswordController = async (req, res) => {
  const { email, callbackUrl } = req.body;
  const user = await getUserByIdService(email);
  if (!user) {
    throw new NotFoundException("User not found");
  }

  const resetPassword = await createResetPasswordService(user._id);

  const resetURL = path.join(callbackUrl, resetPassword.token);
  await sendResetPasswordRequestService(email, resetURL);

  return res.json({
    statusCode: HttpStatus.NO_CONTENT,
    message: "Required Forgot Password Success",
  });
};

export const resetPasswordController = async (req, res) => {
  const { token } = req.params;
  const resetPassword = await getResetPasswordByTokenService(token);
  if (!resetPassword) {
    throw new UnauthorizedException("Invalid or expired token");
  }

  const { password } = req.body;
  const updatedUser = await changePasswordByIdService(
    resetPassword.user,
    password
  );

  sendResetPasswordSuccessService(updatedUser.email);

  return res.json({
    statusCode: HttpStatus.NO_CONTENT,
    message: "Reset password successfully",
  });
};
