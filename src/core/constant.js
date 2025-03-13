export const ALLOW_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'];

export const ALLOW_IMAGE_MIME_TYPES = [
  'image/bmp', // .bmp       - Windows OS/2 Bitmap Graphics
  'image/jpeg', // .jpeg .jpg - JPEG images
  'image/png', // ..png      - Portable Network Graphics
  'image/gif', // .gif       - Graphics Interchange Format (GIF)
  'image/tiff', // .tif .tiff - Tagged Image File Format (TIFF)
  'image/svg+xml', // .svg       - Scalable Vector Graphics (SVG)
  'image/vnd.microsoft.icon', // .ico       - Icon format
  'image/x-icon', // same above
];

export const MAX_UPLOAD_FILE_SIZE = 1024 * 1024 * 1;

export const ALLOW_ICON_MIME_TYPES = ['image/svg+xml', 'image/vnd.microsoft.icon', 'image/x-icon'];

export const REGEX_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  SLUG: /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/,
  WHITESPACE: /\s+/g,
  PHONE_NUMBER: {
    VN: /(84|0[3|5|7|8|9])+([0-9]{8})\b/g,
  },
  BEARER_TOKEN: /^Bearer ((?:\.?(?:[A-Za-z0-9-_]+)){3})$/,
  COMMA_SEPARATED_LIST: /^[a-zA-Z0-9,]+$/,
};
