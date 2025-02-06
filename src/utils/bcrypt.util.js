"use strict";
import bcrypt from "bcrypt";

export const makeHash = (value) => {
  const salt = 10;
  return bcrypt.hashSync(value, salt);
};

export const compareHash = (value, hash) => {
  return bcrypt.compareSync(value, hash);
};
