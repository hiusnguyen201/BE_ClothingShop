import {
  VERIFICATION_OTP_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
} from "./email-template.js";
import { mailtrapClient, sender } from "./mailtrap.config.js";

export const sendOtpCodeService = async (email, otp, expire) => {
  await mailtrapClient.send({
    from: sender,
    to: [{ email }],
    subject: "Verify Your Email",
    html: VERIFICATION_OTP_TEMPLATE.replace("{otpCode}", otp).replace(
      "{expire}",
      expire
    ),
  });
};

export const sendWelcomeEmailService = async (email, name) => {
  await mailtrapClient.send({
    from: sender,
    to: [{ email }],
    template_uuid: "5774f412-edea-413a-b499-5b960bda7b24",
    template_variables: {
      name: name,
      company_info_name: "Test_Company_info_name",
      company_info_address: "Test_Company_info_address",
      company_info_city: "Test_Company_info_city",
      company_info_zip_code: "Test_Company_info_zip_code",
      company_info_country: "Test_Company_info_country",
    },
  });
};

export const sendResetPasswordRequestService = async (email, resetURL) => {
  await mailtrapClient.send({
    from: sender,
    to: [{ email }],
    subject: "Reset Your Password",
    html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
    category: "Send Request Password Reset",
  });
};

export const sendResetPasswordSuccessService = async (email) => {
  await mailtrapClient.send({
    from: sender,
    to: [{ email }],
    subject: "Password Reset Successful",
    html: PASSWORD_RESET_SUCCESS_TEMPLATE,
    category: "Password Reset",
  });
};
