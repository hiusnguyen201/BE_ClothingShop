import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import config from "#src/config";

const transporter = nodemailer.createTransport({
  host: config.mailer.host,
  port: config.mailer.port,
  secure: true, // true for port 465, false for other ports
  auth: {
    user: config.mailer.user,
    pass: config.mailer.pass,
  },
});

const getEmailTemplateToString = (fileName) => {
  return fs
    .readFileSync(
      path.join(
        config.dirname,
        "public/email-templates",
        `${fileName}`
      )
    )
    .toString();
};

export const sendOtpCodeService = async (email, otpCode) => {
  const html = getEmailTemplateToString("verification-otp.html").replace(
    "{otpCode}",
    otpCode
  );

  await transporter.sendMail({
    from: config.mailer.MAILER_AUTH_USER,
    to: email,
    subject: "Verify Otp",
    html,
  });
};

export const sendWelcomeEmailService = async (email, name) => {
  const html = getEmailTemplateToString("send-email-welcome.html").replace(
    "{name}",
    name
  );

  await transporter.sendMail({
    from: config.mailer.MAILER_AUTH_USER,
    to: email,
    subject: "Welcome",
    html,
  });
};

export const sendResetPasswordRequestService = async (email, resetURL) => {
  const html = getEmailTemplateToString(
    "password-reset-request.html"
  ).replace("{resetURL}", resetURL);

  await transporter.sendMail({
    from: config.mailer.MAILER_AUTH_USER,
    to: email,
    subject: "Send Request Reset Password",
    html,
  });
};

export const sendResetPasswordSuccessService = async (email) => {
  const html = getEmailTemplateToString("password-reset-success.html");

  await transporter.sendMail({
    from: config.mailer.MAILER_AUTH_USER,
    to: email,
    subject: "Password Reset Successfully",
    html,
  });
};


export const sendPasswordService = async (email, password) => {
  const html = getEmailTemplateToString(
    "send-password.html"
  ).replace("{password}", password);

  await transporter.sendMail({
    from: config.mailer.MAILER_AUTH_USER,
    to: email,
    subject: "Send Password Successfully",
    html,
  });
};

