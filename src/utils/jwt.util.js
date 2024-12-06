import jwt from "jsonwebtoken";
import config from "#src/config";

export const generateToken = (payload) => {
  const token = jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
  return token;
};
