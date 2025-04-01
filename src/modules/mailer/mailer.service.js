'use strict';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { HttpException } from '#src/core/exception/http-exception';
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
  return fs.readFileSync(path.resolve(process.cwd(), 'src/views/email-templates/', `${fileName}`)).toString();
};

export const sendOtpCodeService = async (email, otpCode) => {
  const html = getEmailTemplateToString('verification-otp.html').replace('{otpCode}', otpCode);

  return await transporter.sendMail({
    from: mailerEmail,
    to: email,
    subject: 'Verify Otp',
    html,
  });
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
    console.log(err);
    throw HttpException.new({ code: Code.SEND_MAIL_ERROR, overrideMessage: 'Send welcome email failed' });
  }
};

export const sendResetPasswordRequestService = async (email, resetURL) => {
  const html = getEmailTemplateToString('password-reset-request.html').replace('{resetURL}', resetURL);

  return await transporter.sendMail({
    from: mailerEmail,
    to: email,
    subject: 'Send Request Reset Password',
    html,
  });
};

export const sendResetPasswordSuccessService = async (email) => {
  try {
    const html = getEmailTemplateToString('password-reset-success.html');

    await transporter.sendMail({
      from: mailerEmail,
      to: email,
      subject: 'Password Reset successful',
      html,
    });
  } catch (err) {
    console.log(err);
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
      subject: 'Send Password successful',
      html,
    });
  } catch (err) {
    console.log(err);
    throw HttpException.new({ code: Code.SEND_MAIL_ERROR, overrideMessage: 'Send password failed' });
  }
};
