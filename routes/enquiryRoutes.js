const express = require("express");
const router = express.Router();
const {
  addEnquiry,
  getAllEnquiries,
   getTotalEnquiries,
  deleteEnquiry,
  deleteEnquiries
} = require("../controllers/enquiryController");
const { authMiddleware, checkRole } = require("../middleware/auth");

router.post("/enquiry", authMiddleware,  addEnquiry);
router.get("/enquiries", authMiddleware,checkRole("admin"), getAllEnquiries);
router.get("/totalEnquiries", authMiddleware, checkRole("admin"), getTotalEnquiries);
router.delete("/enquiries",authMiddleware, checkRole("admin"), deleteEnquiries);
router.delete("/enquiry/:id",authMiddleware, checkRole("admin"), deleteEnquiry);

module.exports = router;
