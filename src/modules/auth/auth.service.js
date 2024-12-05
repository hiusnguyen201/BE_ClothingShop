import {
  NotFoundException,
  UnauthorizedException,
} from "#src/core/exception/http-exception";
import {
  createCustomer,
  findUserById,
  findUserByResetPasswordToken,
  checkExistedUserById,
} from "#src/modules/users/users.service";
import {
  sendOtpViaEmail,
  sendResetPasswordRequest,
  sendResetPasswordSuccess,
  sendWelcomeEmail,
} from "#src/modules/mailtrap/send-email.service";
import { generateToken } from "#src/utils/jwt.util";
import { USER_TYPES } from "#src/core/constant";
import {
  createUserOtpByUserId,
  findUserOtpByOtpAndUserId,
} from "#src/modules/user-otps/user-otps.service";
import { compareHash, makeHash } from "#src/utils/bcrypt.util";
import config from "#src/config";

export async function registerService(data, file) {
  const existedUser = await checkExistedUserById(req.body.email);
  if (existedUser) {
    throw new BadRequestException("Email already exist");
  }

  const hashedPassword = makeHash(data.password);

  const user = await createCustomer({
    ...data,
    password: hashedPassword,
  });
  const accessToken = generateToken({ userId: user._id });

  if (file) {
    // Save avatar
  }

  return {
    user: { name: user.name, email: user.email },
    accessToken,
  };
}

export async function loginService(data) {
  const { email, password } = data;

  const user = await findUserById(
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
  const user = await findUserById(email);
  if (!user) {
    throw new NotFoundException("User not found");
  }
  const userOtp = await createUserOtpByUserId(user._id);
  await sendOtpViaEmail(user.email, userOtp.otp);
}

export async function verifyOtpService(data) {
  const { email, otp } = data;
  const user = await findUserById(email);
  if (!user) {
    throw new NotFoundException("User not found");
  }

  const userOtp = findUserOtpByOtpAndUserId(otp, user._id);
  if (!userOtp) {
    throw new UnauthorizedException("Invalid or expired otp");
  }

  if (!user.isVerified) {
    user.isVerified = true;
    await user.save();
    await sendWelcomeEmail(user.email, user.name);
  }

  const accessToken = generateToken({ userId: user._id });
  return {
    isAuthenticated: true,
    user: { name: user.name, email: user.email },
    accessToken,
  };
}

export async function forgotPasswordService(data) {
  const { email } = data;
  const user = await findUserById(email);
  if (!user) {
    throw new NotFoundException("User not found");
  }

  const resetToken = generateToken({ userId: user._id });
  const resetTokenExpiresAt =
    moment().valueOf() + 60 * 1000 * config.resetTokenExpiresMinutes;

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpiresAt = resetTokenExpiresAt;
  await user.save();

  const resetURL = `${data.url}/${resetToken}`;

  await sendResetPasswordRequest(user.email, resetURL);
}

export async function resetPasswordService(data, token) {
  const { password } = data;
  const user = await findUserByResetPasswordToken(token);
  if (!user) {
    throw new NotFoundException("User not found");
  }

  const hashedPassword = makeHash(password);

  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiresAt = undefined;

  await user.save();

  await sendResetPasswordSuccess(user.email);
}
