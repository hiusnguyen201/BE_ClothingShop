export const ALLOW_IMAGE_MIME_TYPES = [
  'image/jpeg', // .jpeg .jpg - JPEG images
  'image/png', // ..png      - Portable Network Graphics
  'image/webp', // ..webp
];

export const MAX_UPLOAD_FILE_SIZE = 1024 * 1024 * 1;

export const REGEX_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  SLUG: /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/,
  WHITESPACE: /\s+/g,
  PHONE_NUMBER: {
    VN: /(84|0[3|5|7|8|9])+([0-9]{8})\b/g,
  },
  BEARER_TOKEN: /^Bearer ((?:\.?(?:[A-Za-z0-9-_]+)){3})$/,
  COMMA_SEPARATED_LIST: /^[a-zA-Z0-9,]+$/,
  COMMA_SEPARATED_OBJECT_IDS: /^([a-f\d]{24})(,([a-f\d]{24}))*$/i,
  IMAGE_URL: /\.(jpg|jpeg|png)$/i,
  STRING_NUMBER: /^\d+$/,
  HASH_STRING: /^\$2[aby]\$.{56}$/,
};
