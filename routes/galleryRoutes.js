const express = require("express");
const {getImages,getTotalImages,uploadImages,deleteImage, deleteImages} = require('../controllers/galleryController');
const router = express.Router();
const { authMiddleware, checkRole} = require("../middleware/auth");
const fileupload = require("../middleware/fileupload");
const uploadImage = fileupload({ fieldName: "images", folder: "gallaries", multiple: true });

router.post("/images",authMiddleware,checkRole("admin"),uploadImage, uploadImages);
router.get('/images', getImages);
router.get('/totalImages', getTotalImages);
router.delete('/images',authMiddleware,checkRole("admin"), deleteImages);
router.delete('/image/:id',authMiddleware,checkRole("admin"), deleteImage);
module.exports = router;
