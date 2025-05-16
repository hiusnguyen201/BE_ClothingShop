import jwt from 'jsonwebtoken';
export const ACCESS_TOKEN_KEY = 'accessToken';
export const REFRESH_TOKEN_KEY = 'refreshToken';

const accessTokenTTL = 60 * 60 * 1000 * (+process.env.ACCESS_TOKEN_TTL_IN_MINUTES + 60);
const refreshTokenTTL = 60 * 60 * 1000 * 24 * (+process.env.REFRESH_TOKEN_TTL_IN_DAYS + 1);

/**
 * Generate access token and refresh token
 * @param {string} userId
 * @param {any} payload
 * @returns
 */
export async function generateTokens(payload) {
  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: +process.env.ACCESS_TOKEN_TTL_IN_MINUTES + 'm',
  });

  const refreshToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: +process.env.REFRESH_TOKEN_TTL_IN_DAYS + 'd',
  });

  return { accessToken, refreshToken };
}

/**
 * Generate reset password token
 * @param {any} payload
 * @returns
 */
export function generateResetPasswordToken(payload) {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.RESET_PASSWORD_TOKEN_TTL_IN_MINUTES + 'm',
  });
}

/**
 * Verify token
 * @param {string} token
 * @returns
 */
export async function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (_) {
    return null;
  }
}

export function setSession(res, tokens) {
  clearSession(res);

  const { accessToken, refreshToken } = tokens;

  res.cookie(ACCESS_TOKEN_KEY, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: accessTokenTTL,
    path: '/',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });

  res.cookie(REFRESH_TOKEN_KEY, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: refreshTokenTTL,
    path: '/',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
}

export function clearSession(res) {
  res.clearCookie(ACCESS_TOKEN_KEY, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });

  res.clearCookie(REFRESH_TOKEN_KEY, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
}
