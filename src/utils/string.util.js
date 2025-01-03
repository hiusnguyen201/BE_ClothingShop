import { REGEX_PATTERNS } from "#src/core/constant";
import slugifyLib from "slugify";

export const generateOtp = () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return otp;
};

export const randomStr = (length) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(
      Math.floor(Math.random() * charactersLength)
    );
    counter += 1;
  }
  return result;
};
export const makeSlug = (str) => {
  return slugifyLib(str, {
    replacement: "-", // replace spaces with replacement character, defaults to `-`
    remove: undefined, // remove characters that match regex, defaults to `undefined`
    lower: true, // convert to lower case, defaults to `false`
    strict: false, // strip special characters except replacement, defaults to `false`
    locale: "vi", // language code of the locale to use
    trim: true, // trim leading and trailing replacement chars, defaults to `true`
  });
};

export const replaceMultiSpacesToSingleSpace = (str) => {
  return str.replace(REGEX_PATTERNS.WHITESPACE, " ").trim();
};
