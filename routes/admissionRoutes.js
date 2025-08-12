const express = require("express");
const router = express.Router();

const {createAdmission,getAllAdmissions,getTotalAdmissions,getAdmission,deleteAdmission,updateAdmission} = require("../controllers/admissionController");
const { authMiddleware, checkRole } = require("../middleware/auth");
const fileupload = require("../middleware/fileupload");
const uploadImage = fileupload({ fieldName: "image", folder: "admissions", multiple: false });

router.post("/admission",uploadImage, createAdmission);
router.get("/admissions", getAllAdmissions);
router.get("/admission", getAdmission);
router.get("/totalAdmissions",authMiddleware,checkRole('admin') ,getTotalAdmissions);
router.patch("/admission/:id",authMiddleware,checkRole("admin"),uploadImage,updateAdmission);
router.delete("/admissions",authMiddleware,checkRole("admin"),deleteAdmission);
module.exports = router;
