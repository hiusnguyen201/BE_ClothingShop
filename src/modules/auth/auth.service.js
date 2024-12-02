import { UnauthorizedException } from "#src/http-exception";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createCustomer } from "#src/modules/users/users.service";
import config from "#src/config";

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
  const user = await findUser(email);
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
