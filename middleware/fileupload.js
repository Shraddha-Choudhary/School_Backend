const multer = require("multer");
const path = require("path");
const fs = require("fs");

// File filter: only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|pdf/;
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeType = allowedTypes.test(file.mimetype);

  if (mimeType && allowedTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpeg, jpg, png, webp,pdf) are allowed"));
  }
};

const fileUpload = ({ fieldName, folder = "general", multiple = false }) => {
  const uploadDir = path.join(__dirname, `../uploads/${folder}`);

  // ✅ Create directory if not exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
  });

  const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  });

  // ✅ Return a middleware that handles errors
  return (req, res, next) => {
    const handler = multiple
      ? upload.array(fieldName, 5)
      : upload.single(fieldName);

    handler(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ status: false, message: err.message });
      } else if (err) {
        return res.status(400).json({ status: false, message: err.message });
      }

      if (!req.file && (!req.files || req.files.length === 0)) {
        return res.status(400).json({ status: false, message: "No file uploaded" });
      }

      next();
    });
  };
};

module.exports = fileUpload;
