const Nodemailer = require("nodemailer");
const { MailtrapTransport } = require("mailtrap");
const env = require("dotenv");
env.config();

const TOKEN = process.env.MAIL_TOKEN;
const MAIL_ADDRESS = process.env.MAIL_ADDRESS;
const MAIL_NAME = process.env.MAIL_NAME;

const MailSender = async (recipients, subject, content) => {
  try {
    const transport = Nodemailer.createTransport(
      MailtrapTransport({
        token: TOKEN,
      }),
    );

    const sender = {
      address: MAIL_ADDRESS,
      name: MAIL_NAME,
    };
    // const recipients = [to];

    const info = await transport.sendMail({
      from: sender,
      to: recipients,
      subject: subject,
      html: content,
      category: "Integration Test",
    });
    console.log("Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

module.exports = MailSender;
