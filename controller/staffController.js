const Staff = require("../models/staffModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookies = require("cookie-parser");

const addStaff = async (req, res) => {
  try {
    const { name, email, password, conPassword, role } = req.body;
    const existingStaff = await Staff.findOne({ where: { email } });
    if (existingStaff) {
      return res.status(400).json({ error: "Email already exists" });
    }
    if (password !== conPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newStaff = await Staff.create({
      name,
      email,
      password: hashedPassword,
      role,
    });
    res
      .status(201)
      .json({ staff: newStaff, message: "Staff added successfully" });
  } catch (error) {
    console.error("Error adding staff:", error);
    res.status(500).json({ error: "Failed to add staff" });
  }
};

const staffLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const staff = await Staff.findOne({
      where: { email },
    });
    if (!staff) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
    const token = jwt.sign(
      { id: staff.id, role: "staff" },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );
    res.cookie("staffToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ staff, token });
  } catch (error) {
    console.error("Error during staff login:", error);
    res.status(500).json({ error: "Failed to login" });
  }
};

const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;
    const staff = await Staff.findByPk(id);
    if (!staff) {
      return res.status(404).json({ error: "Staff not found" });
    }
    if (email && email !== staff.email) {
      const existingStaff = await Staff.findOne({ where: { email } });
      if (existingStaff) {
        return res.status(400).json({ error: "Email already exists" });
      }
    }
    if (password) {
      const salt = await bcrypt.genSalt(10);
      staff.password = await bcrypt.hash(password, salt);
    }
    staff.name = name || staff.name;
    staff.email = email || staff.email;
    staff.role = role || staff.role;
    await staff.save();
    res.json({ staff, message: "Staff updated successfully" });
  } catch (error) {
    console.error("Error updating staff:", error);
    res.status(500).json({ error: "Failed to update staff" });
  }
};
const changePassword = async (req, res) => {
  try {
    const id = req.staff.id;
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    const staff = await Staff.findByPk(id);
    if (!staff) {
      return res.status(404).json({ error: "Staff not found" });
    }
    const isMatch = await bcrypt.compare(currentPassword, staff.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }
    const salt = await bcrypt.genSalt(10);
    staff.password = await bcrypt.hash(newPassword, salt);
    await staff.save();
    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ error: "Failed to change password" });
  }
};

//view staff
const viewStaffs = async (req, res) => {
  try {
    const staffs = await Staff.findAll();
    res.json({ staffs });
  } catch (error) {
    console.error("Error fetching staffs:", error);
    res.status(500).json({ error: "Failed to fetch staffs" });
  }
};

const viewStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await Staff.findByPk(id);
    console.log("Fetching staff with ID:", id);
    if (!staff) {
      return res.status(404).json({ error: "Staff not found" });
    }
    res.json({ staff });
  } catch (error) {
    console.error("Error fetching staff:", error);
    res.status(500).json({ error: "Failed to fetch staff" });
  }
};

const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};
const staffLogout = (req, res) => {
  res.clearCookie("staffToken");
  res.json({ message: "Logged out successfully" });
};

module.exports = {
  addStaff,
  staffLogin,
  logout,
  staffLogout,
  updateStaff,
  viewStaffs,
  viewStaff,
  changePassword,
};
