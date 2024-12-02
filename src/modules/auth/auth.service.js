import jwt from "jsonwebtoken";
import { UnauthorizedException } from "#src/core/exception/http-exception";
import {
  createCustomer,
  findUserById,
} from "#src/modules/users/users.service";
import config from "#src/config";

export async function register(data) {
  const user = await createCustomer(data);

  const accessToken = jwt.sign({ userId: user._id }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });

  return {
    user,
    accessToken,
  };
}

export async function authenticate(data) {
  const { email, password } = data;
  const user = await findUserById(email, "_id password");
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
    user,
    accessToken,
  };
}
