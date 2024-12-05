import jwt from "jsonwebtoken";
import config from "#src/config";


export const generateTokenAndSetCookie = (userId) => {
  const token = jwt.sign({ userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });

  //setCookie
  // res.cookie("token", token, {
  //   httpOnly: true,
  //   secure: config.nodeEnv === 'production',
  //   sameSite: "strict",
  //   maxAge: 7 * 24 * 60 * 60 * 1000
  // })

  return token;
}