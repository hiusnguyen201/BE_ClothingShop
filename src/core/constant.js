export const GENDER = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
};

export const USER_IDENTIFY_STATUS = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  BANNED: "Banned",
  DELETED: "Deleted",
};

export const ROLE_STATUS = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  DELETED: "Deleted",
};

export const PERMISSION_STATUS = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  DELETED: "Deleted",
};

export const ALLOW_METHODS = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
];

export const ALLOW_IMAGE_MIME_TYPES = [
  "image/bmp", // .bmp       - Windows OS/2 Bitmap Graphics
  "image/jpeg", // .jpeg .jpg - JPEG images
  "image/png", // ..png      - Portable Network Graphics
  "image/gif", // .gif       - Graphics Interchange Format (GIF)
  "image/tiff", // .tif .tiff - Tagged Image File Format (TIFF)
  "image/svg+xml", // .svg       - Scalable Vector Graphics (SVG)
  "image/vnd.microsoft.icon", // .ico       - Icon format
  "image/x-icon", // same above
];

export const ALLOW_ICON_MIME_TYPES = [
  "image/svg+xml",
  "image/vnd.microsoft.icon",
  "image/x-icon",
];

export const USER_TYPES = {
  CUSTOMER: "Customer",
  USER: "User",
};

export const REGEX_PATTERNS = {
  EMAIL: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g,
};
