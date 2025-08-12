// routes/careerRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  createApplication,
  getAllApplication,
  deleteApplication,
  getTotalApplications
} = require("../controllers/careerController"); 
const fileupload = require("../middleware/fileupload");
const uploadImage = fileupload({ fieldName: "resume", folder: "careers", multiple: false });
const { authMiddleware, checkRole } = require("../middleware/auth");

router.post("/application", uploadImage, createApplication);
router.get("/applications", authMiddleware, checkRole("admin"), getAllApplication);
router.get("/totalApplications", authMiddleware, checkRole("admin"), getTotalApplications);
router.delete("/applications",authMiddleware,checkRole("admin"), deleteApplication);


module.exports = router;
