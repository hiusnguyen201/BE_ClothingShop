import { compareSync, genSaltSync, hashSync } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel } from '#src/models/user.model';
import { USER_SELECTED_FIELDS } from '#src/app/v1/users/users.constant';

/**
 * Authenticate User
 * @param {string} email
 * @param {string} password
 * @returns
 */
export async function authenticateUserService(email, password) {
  const user = await UserModel.findOne({ email })
    .select({ ...USER_SELECTED_FIELDS, password: true })
    .lean();
  if (!user || !compareSync(password, user.password)) {
    return null;
  }
  delete user.password;
  return user;
}

/**
 * Generate access token and refresh token
 * @param {string} userId
 * @param {any} payload
 * @returns
 */
export async function generateTokensService(userId, payload) {
  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_TTL_IN_MINUTES + 'm',
  });

  const refreshToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_TTL_IN_DAYS + 'd',
  });

  await UserModel.updateOne({ _id: userId }, { refreshToken });

  return { accessToken, refreshToken };
}

/**
 * Verify token
 * @param {string} token
 * @returns
 */
export async function verifyTokenService(token) {
  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (_) {
    return null;
  }
}

/**
 * Create reset password token
 * @param {any} payload
 * @returns
 */
export function createResetPasswordTokenService(payload) {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.RESET_PASSWORD_TOKEN_TTL_IN_MINUTES + 'm',
  });
}

/**
 * Change password by id
 * @param {*} id
 * @param {*} password
 * @returns
 */
export async function changePasswordByIdService(id, password) {
  const salt = genSaltSync();
  const hashedPassword = hashSync(password, salt);
  return UserModel.findByIdAndUpdate(
    id,
    {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpiresAt: null,
    },
    { new: true },
  )
    .select(USER_SELECTED_FIELDS)
    .lean();
}
