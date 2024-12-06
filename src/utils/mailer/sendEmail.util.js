import { VERIFICATION_EMAIL_TEMPLATE, PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE, SEND_EMAIL_WELCOME_TEMPLATE } from "./email-template.js";
import { createTransporter } from "./mailer.config.js";
import config from "#src/config"

export const sendOtpViaEmail = async (email, createVerificationToken) => {
  const transporter = createTransporter();

  const response = {
    from: config.mailer.MAILER_AUTH_USER,
    to: email,
    subject: "Verify Your Email",
    category: "Password Reset",
    html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationToken}", createVerificationToken)
  };
  await transporter.sendMail(response);
}

export const sendWelcomeEmail = async (email, name) => {
  const transporter = createTransporter();

  const response = {
    from: config.mailer.MAILER_AUTH_USER,
    to: email,
    html: SEND_EMAIL_WELCOME_TEMPLATE.replace("{name}", name),
    subject: "Verify Otp Successfuly",
    category: "Verify Otp Successfuly"
  };
  await transporter.sendMail(response);
}

export const sendResetPasswordRequest = async (email, resetURL) => {
  const transporter = createTransporter();

  const response = {
    from: config.mailer.MAILER_AUTH_USER,
    to: email,
    html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
    subject: "Send Request Reset Password",
    category: "Password Reset"
  };
  await transporter.sendMail(response);
}

export const sendResetPasswordSuccess = async (email) => {
  const transporter = createTransporter();

  const response = {
    from: config.mailer.MAILER_AUTH_USER,
    to: email,
    html: PASSWORD_RESET_SUCCESS_TEMPLATE,
    subject: "Password Reset Successful",
    category: "Password Reset"
  };
  await transporter.sendMail(response);
}
