const express = require("express");
const { signup, login,getAllUsers,getUser,getTotalUsers,updateUser,deleteUser} = require("../controllers/authController");
const router = express.Router();
const fileupload = require("../middleware/fileupload");
const uploadImage = fileupload({ fieldName: "image", folder: "users", multiple: false });
const { authMiddleware, checkRole } = require("../middleware/auth");

router.post("/signup",uploadImage, signup);
router.post("/login", login);
router.get("/user",authMiddleware,checkRole('admin') ,getAllUsers);
router.get("/totalUsers",authMiddleware,checkRole('admin') ,getTotalUsers);
router.get("/user/:id",authMiddleware,checkRole('admin'), getUser);
router.patch("/user/:id",authMiddleware,checkRole('admin'),uploadImage,updateUser);
router.delete("/users",authMiddleware,checkRole('admin'), deleteUser);

module.exports = router;
