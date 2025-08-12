const Career = require("../models/Career");
const fs = require("fs");
const path = require("path");

// POST - Create application
exports.createApplication = async (req, res) => {
  try {
    const { name, email, phone ,userId} = req.body;

    if (!req.file) {
      return res.status(400).json({ status: false, message: "Resume file is required" });
    }

    const resume = req.file.filename;

    const application = new Career({ name, email, phone, resume: resume,userId});
    await application.save();

    res.status(201).json({
      status: true,
      message: "Application submitted successfully!",
      data: application._id,
    });
  } catch (err) {
    console.error("Error submitting application:", err);
    res.status(500).json({
      status: false,
      message: "Error saving application",
      error: err.message,
    });
  }
};

// GET - All applications
exports.getAllApplication = async (req, res) => {
  try {
    const { name = "", email = "", page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    // Filters
    const filters = {};
    if (name) filters.name = { $regex: name, $options: "i" };
    if (email) filters.email = { $regex: email, $options: "i" };

    // Total count for pagination
    const total = await Career.countDocuments(filters);

    // Paginated + filtered + sorted results
    const applications = await Career.find(filters)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(pageSize);

    // Attach full resume URLs
    const updatedApplications = applications.map(app => ({
      ...app._doc,
      resume: app.resume ? `${req.protocol}://${req.get('host')}/uploads/careers/${app.resume}` : "",
    }));

    res.status(200).json({
      status: true,
      message: "Applications fetched successfully!",
      total,
      currentPage: pageNumber,
      totalPages: Math.ceil(total / pageSize),
      data: updatedApplications,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Error fetching applications",
      error: err.message,
    });
  }
};

// ✅ Get Total  Application
exports.getTotalApplications = async (req, res) => {
  try {
    const total = await Career.countDocuments();
    res.status(200).json({status:true, totalApplications:total });
  } catch (err) {
    res.status(500).json({status:false, message: 'Something went wrong',error:err?.message });
  }
};


// DELETE - Application by ID (and remove file)
exports.deleteApplication = async (req, res) => {
  const { ids } = req.body;

  try {
    // If no IDs provided, return an error
    if (!ids || (Array.isArray(ids) && ids.length === 0)) {
      return res.status(400).json({ status: false, message: "No application ID(s) provided" });
    }

    const idList = Array.isArray(ids) ? ids : [ids];

    // Find applications first to get resume file paths
    const applications = await Career.find({ _id: { $in: idList } });

    // Delete resume files (if any)
    applications.forEach((application) => {
      if (application.resume) {
        const resumePath = path.join(__dirname, '..', application.resume);
        if (fs.existsSync(resumePath)) {
          fs.unlinkSync(resumePath);
        }
      }
    });

    // Delete applications
    const result = await Career.deleteMany({ _id: { $in: idList } });

    res.status(200).json({
      status: true,
      message: `${result.deletedCount} application(s) deleted successfully`,
      deletedIds: idList,
    });
  } catch (err) {
    console.error("Error deleting application(s):", err);
    res.status(500).json({
      status: false,
      message: "Error deleting application(s)",
      error: err.message,
    });
  }
};