const User = require("../models/userModel");
const City = require("../models/cityModel");
const State = require("../models/stateModel");
const Country = require("../models/countryModel");
const Order = require("../models/orderModel");
const OTP = require("../models/otpModel");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { Op, fn } = require("sequelize");
const bcrypt = require("bcrypt");
const MailSender = require("../utils/sendEmail");
const { OtpTemplate } = require("../services/mailTemplates");

exports.regUser = async (req, res) => {
  try {
    const {
      fullName,
      email,
      userName,
      phone,
      password,
      confirmPassword,
      cityId,
      stateId,
      countryId,
    } = req.body;
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }
    const checkOTP = await OTP.findOne({ where: { email, verified: true } });
    if (!checkOTP) {
      return res.status(400).json({ error: "Email not verified" });
    }

    const city = await City.findByPk(cityId);
    if (!city) {
      return res.status(400).json({ error: "Invalid city" });
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
      cityId,
      stateId,
      countryId,
    });

    const delFee = city.fee;

    // Generate JWT token
    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Clean up OTP records for this email
    await OTP.destroy({
      where: { email, type: "email_verification", verified: true },
    });
    res.status(201).json({ newUser, delFee, token });
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

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

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

    // await MailSender(
    //   "ericanox@gmail.com",
    //   "Your OTP Code",
    //   OtpTemplate(otpCode),
    // );
    res.status(200).json({ message: "OTP sent to email", otp: otpCode });
  } catch (error) {
    console.error("Error requesting OTP:", error);
    res.status(500).json({ error: "Failed to request OTP" });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({
      where: { email },
      include: [
        { model: City, attributes: ["id", "name", "fee", "code"] },
        { model: State, attributes: ["id", "name"] },
        { model: Country, attributes: ["id", "name"] },
      ],
    });
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
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    console.log("fee for this user:", user.City.fee);
    res.status(200).json({
      userDetails: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        username: user.username,
        accountBalance: user.accountBalance,
        last_login: user.last_login,
        isVerified: user.isVerified,
        city: user.City,
        state: user.State,
        country: user.Country,
        fee: user.City.fee,
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
  res.status(200).json({ message: "Logged out successfully" });
};

exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
      include: [
        { model: City, attributes: ["id", "name", "fee", "code"] },
        { model: State, attributes: ["id", "name"] },
        { model: Country, attributes: ["id", "name"] },
      ],
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
};
exports.getAllUsers = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * limit;
  try {
    const { count, rows: users } = await User.findAndCountAll({
      attributes: { exclude: ["password"] },
      include: [
        { model: City, attributes: ["id", "name", "fee", "code"] },
        { model: State, attributes: ["id", "name"] },
        { model: Country, attributes: ["id", "name"] },
      ],
      limit,
      offset,
    });
    const totalPages = Math.ceil(count / limit);
    res.status(200).json({ users, totalPages });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};
exports.getUserDetails = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
      include: [
        { model: City, attributes: ["id", "name", "fee", "code"] },
        { model: State, attributes: ["id", "name"] },
        { model: Country, attributes: ["id", "name"] },
      ],
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const totalOrders = await Order.count({ where: { userId: user.id } });
    res.status(200).json({ user: { ...user.toJSON(), totalOrders } });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ error: "Failed to fetch user details" });
  }
};

exports.activateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    await user.update({ status: "active" });
    res.status(200).json({ message: "User activated successfully" });
  } catch (error) {
    console.error("Error activating user:", error);
    res.status(500).json({ error: "Failed to activate user" });
  }
};

exports.deactivateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    await user.update({ status: "inactive" });
    res.status(200).json({ message: "User deactivated successfully" });
  } catch (error) {
    console.error("Error deactivating user:", error);
    res.status(500).json({ error: "Failed to deactivate user" });
  }
};

exports.addFund = async (req, res) => {
  try {
    const userId = req.params.id;
    const { amount } = req.body;
    if (amount <= 0) {
      return res
        .status(400)
        .json({ error: "Amount must be greater than zero" });
    }
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const newBalance = parseFloat(user.accountBalance) + parseFloat(amount);
    await user.update({ accountBalance: newBalance });
    res.status(200).json({
      message: "Fund added successfully",
      accountBalance: newBalance,
    });
  } catch (error) {
    console.error("Error adding fund:", error);
    res.status(500).json({ error: "Failed to add fund" });
  }
};
exports.deductFund = async (req, res) => {
  try {
    const userId = req.params.id;
    const { amount } = req.body;
    if (amount <= 0) {
      return res
        .status(400)
        .json({ error: "Amount must be greater than zero" });
    }
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (parseFloat(user.accountBalance) < parseFloat(amount)) {
      return res.status(400).json({ error: "Insufficient balance" });
    }
    const newBalance = parseFloat(user.accountBalance) - parseFloat(amount);
    await user.update({ accountBalance: newBalance });
    res.status(200).json({
      message: "Fund deducted successfully",
      accountBalance: newBalance,
    });
  } catch (error) {
    console.error("Error deducting fund:", error);
    res.status(500).json({ error: "Failed to deduct fund" });
  }
};
exports.adminUpdateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const { fullName, email, phone, countryId, stateId, cityId } = req.body;

    const currentUser = await User.findByPk(id);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }
    if (email && email !== currentUser.email) {
      const emailExists = await User.findOne({ where: { email } });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }
    if (phone && phone !== currentUser.phone) {
      const phoneExists = await User.findOne({ where: { phone } });
      if (phoneExists) {
        return res.status(400).json({ message: "Phone number already in use" });
      }
    }

    const updatedUser = {};
    if (fullName !== undefined && fullName !== "")
      updatedUser.fullName = fullName;
    if (email !== undefined && email !== "") updatedUser.email = email;
    if (phone !== undefined && phone !== "") updatedUser.phone = phone;
    if (countryId !== undefined && countryId !== "")
      updatedUser.countryId = parseInt(countryId);
    if (stateId !== undefined && stateId !== "")
      updatedUser.stateId = parseInt(stateId);
    if (cityId !== undefined && cityId !== "")
      updatedUser.cityId = parseInt(cityId);

    await currentUser.update(updatedUser);
    res
      .status(200)
      .json({ message: "User updated successfully", user: currentUser });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Failed to update user" });
  }
};
exports.adminChangeUserPassword = async (req, res) => {
  try {
    const id = req.params.id;
    const { newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await user.update({ password: hashedPassword });
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Failed to change password" });
  }
};
exports.userChangePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    console.log(
      "Current Password:",
      (password = { currentPassword, newPassword, confirmNewPassword }),
    );
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await user.update({ password: hashedPassword });
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Failed to change password" });
  }
};
exports.passwordOtpRequest = async (req, res) => {
  try {
    const { email } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (!existingUser) {
      return res.status(400).json({ error: "Email is not registered here" });
    }

    const existingOTP = await OTP.findOne({
      where: {
        email,
        type: "password_reset",
        verified: false,
        expiresAt: { [Op.gt]: new Date() },
      },
    });
    if (existingOTP) {
      await existingOTP.destroy({
        where: { email, type: "password_reset", verified: false },
      });
    }
    const otpCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await OTP.create({
      email,
      otp: otpCode,
      expiresAt,
      type: "password_reset",
    });
    // await MailSender(
    //   "ericanox@gmail.com",
    //   "Your OTP Code",
    //   OtpTemplate(otpCode),
    // );
    res.status(200).json({ message: "OTP sent to email", otp: otpCode });
  } catch (error) {
    console.error("Error requesting OTP:", error);
    res.status(500).json({ error: "Failed to request OTP" });
  }
};
exports.resetPassword = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;
    const existingUser = await User.findOne({
      where: { email: email },
    });
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }
    if (password !== confirmPassword) {
      return res
        .status(404)
        .json({ message: "password and Confirm Password does mot match" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await existingUser.update({ password: hashedPassword });
    await OTP.destroy({
      where: { email, type: "password_reset", verified: true },
    });
    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
};
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, phone, email } = req.body;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const updatedData = {};
    if (fullName !== undefined && fullName !== null && fullName !== "")
      updatedData.fullName = fullName;
    if (phone !== undefined && phone !== null && phone !== "")
      updatedData.phone = phone;
    if (email !== undefined && email !== null && email !== "") {
      const emailExists = await User.findOne({ where: { email } });
      if (emailExists && emailExists.id !== userId) {
        return res.status(400).json({ message: "Email already in use" });
      }

      updatedData.email = email;
    }

    await user.update(updatedData);
    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};
