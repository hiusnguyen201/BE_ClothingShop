import { BadRequestException, UnauthorizedException } from "#src/core/exception/http-exception";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  createCustomer,
  findUserById,
  findUserByResetPasswordToken,
  findUserByCodeVerifiEmail
} from "#src/modules/users/users.service";
import config from "#src/config";
import { sendVerificationEmail, sendResetPasswordReqest, sendResetPasswordSuccess, sendWelcomeEmail } from "#src/utils/mailer/sendEmail.util";
import { genarateVerificationToken } from "#src/utils/token/generate-verification-token.util"
import { generateTokenAndSetCookie } from "#src/utils/token/generate-token-and-set-cookie.util"
import { UserModel } from "#src/modules/users/schemas/user.schema"

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

  if (user.isVerified === true) {
    throw new BadRequestException('user verified')
  }

  // if (user.type === 'Customer') {
  //   return
  // }
  const createVerificationToken = genarateVerificationToken(data);
  const verificationTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; //24h
  user.verificationToken = createVerificationToken;
  user.verificationTokenExpiresAt = verificationTokenExpiresAt;
  await user.save()

  //get Token
  const accessToken = generateTokenAndSetCookie(user._id);

  await sendVerificationEmail(user.email, createVerificationToken);
  return {
    isAuthenticated: user.isVerified,
    user: { name: user.name, email: user.email },
    accessToken,
    is2FactorRequired: user.isVerified
  };
}

export async function verifiEmailService(data) {

  const user = await findUserByCodeVerifiEmail(data.code)

  if (!user) {
    throw new BadRequestException('Invalid or expired vetification code')
  }

  user.isVerified = true
  user.verificationToken = undefined
  user.verificationTokenExpiresAt = undefined
  await user.save()

  await sendWelcomeEmail(user.email, user.name)
}


export async function forgotPasswordService(data) {
  const { email } = data
  const user = await findUserById(email)
  if (!user) {
    throw new UnauthorizedException("Invalid Credentials");
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

  await sendResetPasswordReqest(user.email, resetURL)

}

export async function resetPasswordService(data, token) {
  const { password } = data
  const user = await findUserByResetPasswordToken(token)

  if (!user) {
    throw new UnauthorizedException("Invalid Credentials");
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  user.password = hashedPassword
  user.resetPasswordToken = undefined
  user.resetPasswordExpiresAt = undefined

  await user.save()

  await sendResetPasswordSuccess(user.email)
}



