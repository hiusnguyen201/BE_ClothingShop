import { VERIFICATION_EMAIL_TEMPLATE, PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE } from "./email-template.js";
import { mailtrapClient, sender } from "./mailtrap.config.js";

export const sendOtpViaEmail = async (email, createVerificationToken) => {
  const recipient = [{ email }]
  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Verify Your Email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationToken}", createVerificationToken)
    })
  } catch (error) {
    console.log(error)
  }
}

export const sendWelcomeEmail = async (email, name) => {
  //template_uuid: "5774f412-edea-413a-b499-5b960bda7b24",
  const recipient = [{ email }];
  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      template_uuid: "5774f412-edea-413a-b499-5b960bda7b24",
      template_variables: {
        "name": name,
        "company_info_name": "Test_Company_info_name",
        "company_info_address": "Test_Company_info_address",
        "company_info_city": "Test_Company_info_city",
        "company_info_zip_code": "Test_Company_info_zip_code",
        "company_info_country": "Test_Company_info_country"
      }
    })
  } catch (err) {
    console.log(err)
  }
}

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
