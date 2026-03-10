const User = require("../models/userModel");
const OTP = require("../models/otpModel");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");

exports.regUser = async (req, res) => {
  try {
    const { fullName, email, userName, phone, password, confirmPassword } =
      req.body;
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }
    const checkOTP = await OTP.findOne({ where: { email, verified: true } });
    if (!checkOTP) {
      return res.status(400).json({ error: "Email not verified" });
    }

    const existingUser = await User.findOne({
      where: { [Op.or]: [{ email }, { username: userName }] },
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Email or username already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await User.create({
      fullName,
      email,
      username: userName,
      phone,
      password: hashedPassword,
    });

    // Generate JWT token
    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    // Clean up OTP records for this email
    await OTP.destroy({
      where: { email, type: "email_verification", verified: true },
    });
    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const otpRecord = await OTP.findOne({
      where: { email, otp, verified: false },
    });
    if (!otpRecord) {
      return res.status(400).json({ error: "Invalid OTP" });
    }
    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ error: "OTP has expired" });
    }

    otpRecord.verified = true;
    await otpRecord.save();

    res.json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
};
exports.otpRequest = async (req, res) => {
  try {
    const { email } = req.body;

    const existingOTP = await OTP.findOne({
      where: {
        email,
        type: "email_verification",
        verified: false,
        expiresAt: { [Op.gt]: new Date() },
      },
    });
    if (existingOTP) {
      await existingOTP.destroy({
        where: { email, type: "email_verification", verified: false },
      });
    }
    const otpCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await OTP.create({
      email,
      otp: otpCode,
      expiresAt,
      type: "email_verification",
    });
    res.json({ message: "OTP sent to email", otp: otpCode });
  } catch (error) {
    console.error("Error requesting OTP:", error);
    res.status(500).json({ error: "Failed to request OTP" });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
    const last_login = new Date();
    await user.update({ last_login });
    const token = jwt.sign(
      { id: user.id, role: "user" },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    res.json({
      userDetails: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        username: user.username,
        accountBalance: user.accountBalance,
        last_login: user.last_login,
        isVerified: user.isVerified,

        status: user.status,
      },
      token,
    });
  } catch (error) {
    console.error("Error during user login:", error);
    res.status(500).json({ error: "Failed to login" });
  }
};

exports.logoutUser = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};
