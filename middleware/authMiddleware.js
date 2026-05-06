const jwt = require("jsonwebtoken");
const Admin = require("../models/adminModel");
const User = require("../models/userModel");
const Staff = require("../models/staffModel");

const protect = async (req, res, next) => {
  const token = req.cookies.token;
  const staffToken = req.cookies.staffToken;
  if (!token && !staffToken) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }
  try {
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findByPk(decoded.id);
    }

    if (staffToken) {
      const decoded = jwt.verify(staffToken, process.env.JWT_SECRET);
      req.staff = await Staff.findByPk(decoded.id);
    }
    if (!req.user && !req.staff) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    next();
  } catch (error) {
    console.error("Error verifying token:", token || staffToken, error);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

const role = (role) => {
  return (req, res, next) => {
    if (req.staff.role !== role) {
      return res.status(403).json({ message: `Forbidden: You're not ${role}` });
    }
    next();
  };
};
// const isAdmin = (req, res, next) => {
//   if (!req.admin) {
//     return res.status(403).json({ message: "Forbidden: You're not an admin" });
//   }
//   next();
// };
const isUser = (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({ message: "Forbidden: You're not a user" });
  }
  next();
};
const isStaff = (req, res, next) => {
  if (!req.staff) {
    return res.status(403).json({ message: "Forbidden: You're not a staff" });
  }
  next();
};
module.exports = { protect, role, isUser, isStaff };
