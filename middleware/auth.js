const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({status:false, message: "Access denied, no token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({status:false, message: "User not found" });
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(400).json({status:false,message: "Invalid token", error: err.message });
  }
}

const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied, you don't have any permissions" });
    }
    next();
  };
};


module.exports = {
    authMiddleware,
    checkRole
};