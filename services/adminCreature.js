const bcrypt = require("bcrypt");
const Staff = require("../models/staffModel");

const createAdmin = async () => {
  try {
    const existingAdmin = await Staff.findOne({ where: { role: "admin" } });
    if (existingAdmin) {
      console.log("Admin user already exists");
      return;
    }
    const password = "admin123"; // You should hash this password in a real application
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await Staff.create({
      name: "Admin User",
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin",
    });
    console.log("Admin user created successfully");
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
};

module.exports = createAdmin;
