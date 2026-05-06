const NewsLetter = require("../models/newsletterModel");
const MailSender = require("../utils/sendEmail");
const User = require("../models/userModel");
const {
  NewsletterTemplate,
  userMailTemplate,
  PromotionTemplate,
  NewsletterMsgTemplate,
} = require("../services/mailTemplates");

const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;
    const existingSubscription = await NewsLetter.findOne({ where: { email } });
    if (existingSubscription) {
      return res.status(400).json({ message: "Email is already subscribed" });
    }
    const newSubscription = await NewsLetter.create({ email });
    if (newSubscription) {
      await MailSender(
        "ericanox@gmail.com",
        "Subscription Confirmation",
        NewsletterTemplate(),
      );
      return res.status(201).json({ message: "Subscription successful" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//unsubscribe newsletter
const unsubscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;
    const subscription = await NewsLetter.findOne({ where: { email } });
    if (!subscription) {
      return res
        .status(404)
        .json({ message: "Email not found in subscription list" });
    }
    await subscription.destroy();
    res.status(200).json({ message: "Unsubscribed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//send individual email to user
const sendEmailToUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, subject, message, headng } = req.body;
    const user = await User.findOne({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await MailSender(
      "ericanox@gmail.com",
      subject,
      userMailTemplate(user.fullName, message),
    );
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: error.message });
  }
};

//send promotional email to user
const sendPromotionalEmail = async (req, res) => {
  try {
    const { subject, message, heading } = req.body;
    const users = await User.findAll();
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    const emailList = users.map((user) => user.email);
    console.log("Email List:", emailList);
    await MailSender(
      ["ericanox@gmail.com"],
      subject,
      PromotionTemplate(heading, message),
    );
    res.status(200).json({ message: "Promotional email sent successfully" });
  } catch (error) {
    console.error("Error sending promotional email:", error);
    res.status(500).json({ message: error.message });
  }
};

const sendNewsletterMsg = async (req, res) => {
  try {
    const { subject, message, heading } = req.body;
    const subscribers = await NewsLetter.findAll();
    if (!subscribers || subscribers.length === 0) {
      return res.status(404).json({ message: "No subscribers found" });
    }
    const emailList = subscribers.map((subscriber) => subscriber.email);
    console.log("Subscriber Email List:", emailList);
    await MailSender(
      emailList,
      subject,
      NewsletterMsgTemplate(heading, message),
    );
    res.status(200).json({ message: "Newsletter sent successfully" });
  } catch (error) {
    console.error("Error sending newsletter:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  subscribeNewsletter,
  unsubscribeNewsletter,
  sendEmailToUser,
  sendPromotionalEmail,
  sendNewsletterMsg,
};
