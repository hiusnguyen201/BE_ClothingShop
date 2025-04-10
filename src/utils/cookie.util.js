export const ACCESS_TOKEN_KEY = 'accessToken';
export const REFRESH_TOKEN_KEY = 'refreshToken';

const accessTokenTTL = 60 * 60 * 1000 * (+process.env.ACCESS_TOKEN_TTL_IN_MINUTES + 60);
const refreshTokenTTL = 60 * 60 * 1000 * 24 * (+process.env.REFRESH_TOKEN_TTL_IN_DAYS + 1);

export function setSession(res, tokens) {
  clearSession(res);

  const { accessToken, refreshToken } = tokens;

  res.cookie(ACCESS_TOKEN_KEY, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: accessTokenTTL,
    path: '/',
  });

  res.cookie(REFRESH_TOKEN_KEY, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: refreshTokenTTL,
    path: '/',
  });
}

export function clearSession(res) {
  res.clearCookie(ACCESS_TOKEN_KEY, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });

  res.clearCookie(REFRESH_TOKEN_KEY, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
}
