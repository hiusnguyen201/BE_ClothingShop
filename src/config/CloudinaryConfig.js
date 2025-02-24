import '#config/env';

export class CloudinaryConfig {
  static CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;

  static CLOUDINARY_NAME = process.env.CLOUDINARY_NAME;

  static CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
}
