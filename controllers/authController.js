const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

// ✅ SIGNUP with optional image upload
exports.signup = async (req, res) => {
  const { name, email, password, phone } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ status: false, message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      image: req.file ? req.file.filename : "", // Handle image upload
    });

    res.status(201).json({
      status: true,
      message: "Signup successful",
      data: newUser,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Error in signup",
      error: err.message,
    });
  }
};

// ✅ LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser)
      return res.status(404).json({ status: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch)
      return res.status(401).json({ status: false, message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: existingUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "2d" }
    );

    res.status(200).json({
      status: true,
      message: "Login successful",
      data: { user: existingUser, accessToken: token },
    });
  } catch (err) {
    res.status(500).json({ status: false, message: "Error in login", error: err.message });
  }
};

//GET  USER - 
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password'); 

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }
    const BASE_URL = `${req.protocol}://${req.get("host")}`;
    user.image  = user.image ? `${BASE_URL}/uploads/users/${user.image}` : "",
    res.status(200).json({ status: true, message: "User fetched successfully", data: user });
  } catch (error) {
    res.status(500).json({ status: false, message: "Error fetching user", error: error.message });
  }
};

// ✅ GET ALL USERS - Paginated with optional filtering
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, name = "", email = "", status = "" } = req.query;

    const filters = {};

    if (name) filters.name = { $regex: name, $options: "i" };
    if (email) filters.email = { $regex: email, $options: "i" };
    if (status) filters.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filters),
    ]);
    const BASE_URL = `${req.protocol}://${req.get("host")}`;
    const formattedUsers = users.map(user => ({
      ...user.toObject(),
      image: user.image ? `${BASE_URL}/uploads/users/${user.image}` : "",
    }));

    res.status(200).json({
      status: true,
      message: "Users fetched successfully",
      data: formattedUsers, 
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

// ✅ Get Total  Users
exports.getTotalUsers = async (req, res) => {
  try {
    const total = await User.countDocuments();
    res.status(200).json({status:true, totalUsers:total });
  } catch (err) {
    res.status(500).json({status:false, message: 'Something went wrong',error:err?.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-password'); 

    if (!updatedUser) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error updating user",
      error: error.message,
    });
  }
};

// ✅ DELETE USER(s) - Single or Multiple
exports.deleteUser = async (req, res) => {
  const { ids } = req.body;

  try {
    if (!ids || (Array.isArray(ids) && ids.length === 0)) {
      return res.status(400).json({ status: false, message: "No user IDs provided" });
    }

    const idList = Array.isArray(ids) ? ids : [ids];

    const users = await User.find({ _id: { $in: idList } });

    // Delete image signle or multiple users (if stored locally)
    users.forEach((user) => {
      if (user.image) {
        const imagePath = path.join(__dirname, "..", user.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
    });

    const result = await User.deleteMany({ _id: { $in: idList } });

    res.status(200).json({
      status: true,
      message: `${result.deletedCount} user(s) deleted successfully`,
      deletedIds: idList,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to delete user(s)",
      error: error.message,
    });
  }
};
