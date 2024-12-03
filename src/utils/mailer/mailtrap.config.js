import { MailtrapClient } from "mailtrap"
import config from "#src/config";

export const mailtrapClient = new MailtrapClient({
  token: config.mailtrap.token,
});

export const sender = {
  email: "hello@demomailtrap.com",
  name: "Vương bùi",
};

