import jwt from 'jsonwebtoken';

export const generateToken = (payload, expiresIn) => {
  const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: expiresIn || process.env.JWT_EXPIRES_IN || '7d',
  });
  return token;
};

export const verifyToken = (token) => {
  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  return decoded;
};
