import moment from "moment-timezone";
import {
  NotFoundException,
  UnauthorizedException,
} from "#src/core/exception/http-exception";
import {
  createCustomerService,
  findUserByIdService,
  findUserByResetPasswordTokenService,
} from "#src/modules/users/users.service";
import {
  sendOtpCodeService,
  sendResetPasswordRequestService,
  sendResetPasswordSuccessService,
  sendWelcomeEmailService,
} from "#src/modules/mailtrap/send-email.service";
import { generateToken } from "#src/utils/jwt.util";
import { USER_TYPES } from "#src/core/constant";
import {
  createUserOtpByUserIdService,
  findUserOtpByOtpAndUserIdService,
} from "#src/modules/user-otps/user-otps.service";
import { compareHash, makeHash } from "#src/utils/bcrypt.util";
import config from "#src/config";

export async function registerService(data) {
  const user = await createCustomerService(data);

  return {
    isAuthenticated: false,
    user: { name: user.name, email: user.email },
    accessToken: null,
    is2FactorRequired: true,
  };
}

export async function authenticateService(data) {
  const { email, password } = data;

  const user = await findUserByIdService(
    email,
    "password name email isVerified type"
  );
  if (!user) {
    throw new UnauthorizedException("Invalid Credentials");
  }

  const isMatchPassword = compareHash(password, user.password);
  if (!isMatchPassword) {
    throw new UnauthorizedException("Invalid Credentials");
  }

  // Check unverified or is user => 2FA
  if (!user.isVerified || user.type === USER_TYPES.USER) {
    return {
      isAuthenticated: false,
      user: { name: user.name, email: user.email },
      accessToken: null,
      is2FactorRequired: true,
    };
  }

  const accessToken = generateToken({ userId: user._id });
  return {
    isAuthenticated: true,
    user: { name: user.name, email: user.email },
    accessToken,
    is2FactorRequired: false,
  };
}

export async function sendOtpViaEmailService(data) {
  const { email } = data;
  const user = await findUserByIdService(email);
  if (!user) {
    throw new NotFoundException("User not found");
  }
  const userOtp = await createUserOtpByUserIdService(user._id);
  await sendOtpCodeService(user.email, userOtp.otp);
}

export async function verifyOtpService(data) {
  const { email, otp } = data;
  const user = await findUserByIdService(email);
  if (!user) {
    throw new NotFoundException("User not found");
  }

  const userOtp = findUserOtpByOtpAndUserIdService(otp, user._id);
  if (!userOtp) {
    throw new UnauthorizedException("Invalid or expired otp");
  }

  if (!user.isVerified) {
    user.isVerified = true;
    await user.save();
    await sendWelcomeEmailService(user.email, user.name);
  }

  const accessToken = generateToken({ userId: user._id });
  return {
    isAuthenticated: true,
    user: { name: user.name, email: user.email },
    accessToken,
  };
}

export async function forgotPasswordService(data) {
  const { email, callbackUrl } = data;
  const user = await findUserByIdService(email);
  if (!user) {
    throw new NotFoundException("User not found");
  }

  const resetToken = generateToken({ userId: user._id });
  const resetTokenExpiresAt =
    moment().valueOf() + 60 * 1000 * config.resetTokenExpiresMinutes;

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpiresAt = resetTokenExpiresAt;
  await user.save();

  const resetURL = `${callbackUrl}/${resetToken}`;

  await sendResetPasswordRequestService(user.email, resetURL);
}

export async function resetPasswordService(data, token) {
  const { password } = data;
  const user = await findUserByResetPasswordTokenService(token);
  if (!user) {
    throw new NotFoundException("User not found");
  }

  const hashedPassword = makeHash(password);

  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiresAt = undefined;

  await user.save();

  await sendResetPasswordSuccessService(user.email);
}
