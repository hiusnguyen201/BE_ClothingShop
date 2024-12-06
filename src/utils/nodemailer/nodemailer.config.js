import nodemailer from "nodemailer"
import config from "#src/config";
export const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.mailer.MAILER_AUTH_USER,
      pass: config.mailer.MAILER_AUTH_PASS,
    },
  });
};