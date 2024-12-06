import { BadRequestException, NotFoundException, UnauthorizedException } from "#src/core/exception/http-exception";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  createCustomer,
  findUserById,
  findUserByResetPasswordToken,
} from "#src/modules/users/users.service";
import config from "#src/config";
import { sendOtpViaEmail, sendResetPasswordRequest, sendResetPasswordSuccess, sendWelcomeEmail } from "#src/utils/nodemailer/sendEmail.util";
import { generateTokenAndSetCookie } from "#src/utils/token/generate-token-and-set-cookie.util";
import { USER_TYPES } from "#src/core/constant";
import { createUserOtpByUserId, findUserOtpByOtpAndUserId } from "#src/modules/user-otps/user-otp.service";

export async function registerService(data, file) {
  const salt = 10;
  const hashedPassword = await bcrypt.hash(data.password, salt);

  const user = await createCustomer({
    ...data,
    password: hashedPassword,
  });
  const accessToken = generateTokenAndSetCookie(user._id)

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

  const user = await findUserById(email, "password name email isVerified type");
  if (!user) {
    throw new UnauthorizedException("Invalid Credentials");
  }

  const isMatchPassword = await bcrypt.compare(password, user.password);
  if (!isMatchPassword) {
    throw new UnauthorizedException("Invalid Credentials");
  }


  if (!user.isVerified || user.type === USER_TYPES.USER) {
    return {
      isAuthenticated: false,
      user: { name: user.name, email: user.email },
      accessToken: null,
      is2FactorRequired: true
    };
  }

  //get Token
  const accessToken = generateTokenAndSetCookie(user._id);

  return {
    isAuthenticated: true,
    user: { name: user.name, email: user.email },
    accessToken,
    is2FactorRequired: false
  };
}

export async function sendOtpViaEmailService(data) {
  const { email } = data
  const user = await findUserById(email);
  if (!user) {
    throw new NotFoundException("User not found");
  }
  const userOtp = await createUserOtpByUserId(user._id);
  await sendOtpViaEmail(user.email, userOtp.otp);
}

export async function verifyOtpService(data) {
  const { email, otp } = data
  const user = await findUserById(email);

  if (!user) {
    throw new NotFoundException("User not found");
  }

  const userOtp = await findUserOtpByOtpAndUserId(otp, user._id)
  if (!userOtp || data.otp !== userOtp.otp) {
    throw new UnauthorizedException('Invalid or expired vetification code')
  }

  if (!user.isVerified) {
    user.isVerified = true
    await user.save()
    await sendWelcomeEmail(user.email, user.name)
  }

  //get Token
  const accessToken = generateTokenAndSetCookie(user._id)

  return {
    isAuthenticated: true,
    user: { name: user.name, email: user.email },
    accessToken
  };
}


export async function forgotPasswordService(data) {
  const { email } = data
  const user = await findUserById(email)
  if (!user) {
    throw new NotFoundException("User not found");
  }

  const resetToken = jwt.sign(
    { userId: user._id },
    config.jwtSecret,
  )
  const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000 // 1h

  user.resetPasswordToken = resetToken
  user.resetPasswordExpiresAt = resetTokenExpiresAt
  await user.save()

  const resetURL = `${data.url}/${resetToken}`
  await sendResetPasswordRequest(user.email, resetURL)
}

export async function resetPasswordService(data, token) {
  const { password } = data
  const user = await findUserByResetPasswordToken(token)

  if (!user) {
    throw new NotFoundException("User not found");
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  user.password = hashedPassword
  user.resetPasswordToken = undefined
  user.resetPasswordExpiresAt = undefined

  await user.save()

  await sendResetPasswordSuccess(user.email)
}



