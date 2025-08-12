const Admission = require("../models/Admission");
const path = require("path");
const fs = require("fs");

// ✅ Create Admission
const createAdmission = async (req, res) => {
  try {
    const data = req.body;

    if (req.file) {
      data.image = `/uploads/admissions/${req.file.filename}`;
    }

    const admission = new Admission(data);
    await admission.save();

    res.status(201).json({
      status: true,
      message: "Admission created successfully",
      data: admission._id,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to create admission",
      error: error.message,
    });
  }
};

// ✅ Update Admission by ID
const updateAdmission = async (req, res) => {
  try {
    const data = req.body;

    // Fetch existing admission
    const admission = await Admission.findById(req.params.id);
    if (!admission) {
      return res.status(404).json({
        status: false,
        message: "Admission not found",
      });
    }

    // If a new image is uploaded, delete the old one
    if (req.file) {
      // Set new image path
      data.image = `/uploads/admissions/${req.file.filename}`;

      // Delete the previous image if it exists
      if (admission.image) {
        const oldImagePath = path.join(__dirname, "..", admission.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    // Update admission
    const updated = await Admission.findByIdAndUpdate(req.params.id, data, {
      new: true,
    });

    res.status(200).json({
      status: true,
      message: "Admission updated successfully",
      data: updated._id,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to update admission",
      error: error.message,
    });
  }
};

// ✅ Get All Admissions
const getAllAdmissions = async (req, res) => {
  try {
    const { childName, parentName, status, page = 1, limit = 10 } = req.query;
    const match = {};
    if (childName) match.childName = { $regex: childName, $options: "i" };
    if (parentName) match.parentName = { $regex: parentName, $options: "i" };
    if (status) match.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [admissions, total] = await Promise.all([
      Admission.find(match)
        .populate("user")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Admission.countDocuments(match),
    ]);

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const updatedAdmissions = admissions.map((admission) => {
      return {
        ...admission.toObject(),
        image: admission.image ? `${baseUrl}${admission.image}` : '',
      };
    });

    res.status(200).json({
      status: true,
      message: "Admissions fetched successfully",
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: updatedAdmissions,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to fetch admissions",
      error: error.message,
    });
  }
};

// ✅ Get Total  Admissions
const getTotalAdmissions = async (req, res) => {
  try {
    const total = await Admission.countDocuments();
    res.status(200).json({ status: true, totalAdmissions: total });
  } catch (err) {
    res.status(500).json({ status: false, message: 'Something went wrong', error: err?.message });
  }
};

//Get single Admission
const getAdmission = async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id);

    if (!admission) {
      return res.status(404).json({ status: false, message: "Admission not found" });
    }
    const BASE_URL = `${req.protocol}://${req.get("host")}`;
    admission.image = admission.image ? `${BASE_URL}/uploads/admissions/${admission.image}` : "",
      res.status(200).json({ status: true, message: "Admission fetched successfully", data: admission });
  } catch (error) {
    res.status(500).json({ status: false, message: "Error fetching admission", error: error.message });
  }
};

// ✅ Delete Admission multiple or single 
const deleteAdmission = async (req, res) => {
  const { ids } = req.body;

  try {
    if (!ids || (Array.isArray(ids) && ids.length === 0)) {
      return res.status(400).json({ status: false, message: "No admission ID(s) provided" });
    }

    const idList = Array.isArray(ids) ? ids : [ids];

    const admissions = await Admission.find({ _id: { $in: idList } });

    // Delete image files if they exist
    admissions.forEach((admission) => {
      if (admission.image) {
        const imagePath = path.join(__dirname, "..", admission.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
    });

    const result = await Admission.deleteMany({ _id: { $in: idList } });

    res.status(200).json({
      status: true,
      message: `${result.deletedCount} admission(s) deleted successfully`,
      deletedIds: idList,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to delete admission(s)",
      error: error.message,
    });
  }
};


// ✅ Export All Controllers
module.exports = {
  createAdmission,
  getAllAdmissions,
  getAdmission,
  getTotalAdmissions,
  deleteAdmission,
  updateAdmission,
};
