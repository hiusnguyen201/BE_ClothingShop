import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import config from "#src/config";
import { BadGatewayException } from "#src/core/exception/http-exception";

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
      path.join(process.cwd(), "/public/email-templates", `${fileName}`)
    )
    .toString();
};

export const sendOtpCodeService = async (email, otpCode) => {
  try {
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
  } catch (err) {
    console.log(err);
    throw new BadGatewayException("Send otp code to mail failed");
  }
};

export const sendWelcomeEmailService = async (email, name) => {
  try {
    const html = getEmailTemplateToString("welcome-user.html").replace(
      "{name}",
      name
    );

    await transporter.sendMail({
      from: config.mailer.MAILER_AUTH_USER,
      to: email,
      subject: "Welcome",
      html,
    });
  } catch (err) {
    console.log(err);
    throw new BadGatewayException("Send welcome to mail failed");
  }
};

export const sendResetPasswordRequestService = async (email, resetURL) => {
  try {
    const html = getEmailTemplateToString(
      "password-reset-request.html"
    ).replace("{resetURL}", resetURL);

    await transporter.sendMail({
      from: config.mailer.MAILER_AUTH_USER,
      to: email,
      subject: "Send Request Reset Password",
      html,
    });
  } catch (err) {
    console.log(err);
    throw new BadGatewayException(
      "Send password reset request to mail failed"
    );
  }
};

export const sendResetPasswordSuccessService = async (email) => {
  try {
    const html = getEmailTemplateToString("password-reset-success.html");

    await transporter.sendMail({
      from: config.mailer.MAILER_AUTH_USER,
      to: email,
      subject: "Password Reset Successfully",
      html,
    });
  } catch (err) {
    console.log(err);
    throw new BadGatewayException(
      "Send password reset notification successfully to mail failed"
    );
  }
};

export const sendPasswordService = async (email, password) => {
  try {
    const html = getEmailTemplateToString("send-password.html").replace(
      "{password}",
      password
    );

    await transporter.sendMail({
      from: config.mailer.MAILER_AUTH_USER,
      to: email,
      subject: "Send Password Successfully",
      html,
    });
  } catch (err) {
    console.log(err);
    throw new BadGatewayException("Send password to mail failed");
  }
};
