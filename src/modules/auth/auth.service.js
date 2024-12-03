import { BadRequestException, UnauthorizedException } from "#src/core/exception/http-exception";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createCustomer, findUserById } from "#src/modules/users/users.service";
import config from "#src/config";
import { sendResetPasswordReqest, sendResetPasswordSuccess } from "#src/utils/mailer/sendEmail.util";
import { UserModel } from "#src/modules/users/schemas/user.schema"

export async function registerService(data, file) {
  const salt = 10;
  const hashedPassword = await bcrypt.hash(data.password, salt);
  const user = await createCustomer({
    ...data,
    password: hashedPassword,
  });

  const accessToken = jwt.sign({ userId: user._id }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });

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
  console.log(data);

  const user = await findUserById(email, "password name email");
  if (!user) {
    throw new UnauthorizedException("Invalid Credentials");
  }

  const isMatchPassword = await bcrypt.compare(password, user.password);
  if (!isMatchPassword) {
    throw new UnauthorizedException("Invalid Credentials");
  }

  const accessToken = jwt.sign({ userId: user._id }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });

  return {
    user: { name: user.name, email: user.email },
    accessToken,
  };
}

export async function forgotPasswordService(data) {
  const { email } = data
  const user = await findUserById(email);
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

  const resetURL = `${config.mailtrap.clientUrl}/api/auth/reset-password/${resetToken}`

  await sendResetPasswordReqest(user.email, resetURL)

}

export async function resetPasswordService(data) {
  const { token, password } = data
  const user = await UserModel.findOne({
    reserPasswordToken: token,
    resetPasswordExpiresAt: { $gt: Date.now() }
  })

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



