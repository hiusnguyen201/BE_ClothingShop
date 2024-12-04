import config from "#src/config";
import { PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE } from "./email-template.js";
import { mailtrapClient, sender } from "./mailtrap.config.js";

export const sendResetPasswordReqest = async (email, resetURL) => {
  const recipient = [{ email }];
  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Reset Your Password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
      category: "Send Request Password Reset"
    })
  } catch (error) {
    console.log('err', error)
  }
}

export const sendResetPasswordSuccess = async (email) => {
  const recipient = [{ email }];
  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Password Reset Successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      category: "Password Reset"
    })
  } catch (error) {
    console.log('err', error)
  }
}
