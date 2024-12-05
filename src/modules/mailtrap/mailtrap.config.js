import { MailtrapClient } from "mailtrap";
import config from "#src/config";

export const mailtrapClient = new MailtrapClient({
  token: config.mailtrap.token,
});

export const sender = {
  email: config.mailtrap.senderEmail,
  name: config.mailtrap.senderName,
};
