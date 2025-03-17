'use strict';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { HttpException } from '#src/core/exception/http-exception';
import { viewRootDir } from '#src/views/viewRootDir';
import { Code } from '#src/core/code/Code';

const mailerEmail = process.env.MAILER_AUTH_USER;

const transporter = nodemailer.createTransport({
  host: process.env.MAILER_HOST,
  port: process.env.MAILER_PORT,
  secure: true, // true for port 465, false for other ports
  auth: {
    user: mailerEmail,
    pass: process.env.MAILER_AUTH_PASS,
  },
});

const getEmailTemplateToString = (fileName) => {
  return fs.readFileSync(path.join(viewRootDir, '/email-templates', `${fileName}`)).toString();
};

export const sendOtpCodeService = async (email, otpCode) => {
  try {
    const html = getEmailTemplateToString('verification-otp.html').replace('{otpCode}', otpCode);

    await transporter.sendMail({
      from: mailerEmail,
      to: email,
      subject: 'Verify Otp',
      html,
    });
  } catch (err) {
    throw HttpException.new({ code: Code.SEND_MAIL_ERROR, overrideMessage: 'Send OTP failed' });
  }
};

export const sendWelcomeEmailService = async (email, name) => {
  try {
    const html = getEmailTemplateToString('welcome-user.html').replace('{name}', name);

    await transporter.sendMail({
      from: mailerEmail,
      to: email,
      subject: 'Welcome',
      html,
    });
  } catch (err) {
    throw HttpException.new({ code: Code.SEND_MAIL_ERROR, overrideMessage: 'Send welcome email failed' });
  }
};

export const sendResetPasswordRequestService = async (email, resetURL) => {
  try {
    const html = getEmailTemplateToString('password-reset-request.html').replace('{resetURL}', resetURL);

    await transporter.sendMail({
      from: mailerEmail,
      to: email,
      subject: 'Send Request Reset Password',
      html,
    });
  } catch (err) {
    throw HttpException.new({ code: Code.SEND_MAIL_ERROR, overrideMessage: 'Send link reset password failed' });
  }
};

export const sendResetPasswordSuccessService = async (email) => {
  try {
    const html = getEmailTemplateToString('password-reset-success.html');

    await transporter.sendMail({
      from: mailerEmail,
      to: email,
      subject: 'Password Reset Successfully',
      html,
    });
  } catch (err) {
    throw HttpException.new({
      code: Code.SEND_MAIL_ERROR,
      overrideMessage: 'Send reset password success email failed',
    });
  }
};

export const sendPasswordService = async (email, password) => {
  try {
    const html = getEmailTemplateToString('send-password.html').replace('{password}', password);

    await transporter.sendMail({
      from: mailerEmail,
      to: email,
      subject: 'Send Password Successfully',
      html,
    });
  } catch (err) {
    throw HttpException.new({ code: Code.SEND_MAIL_ERROR, overrideMessage: 'Send password failed' });
  }
};
