const Enquiry = require("../models/Enquiry");


// POST: Submit new enquiry
const addEnquiry = async (req, res) => {
  try {
    const newEnquiry = new Enquiry(req.body);
    await newEnquiry.save();
    res.status(201).json({
      status: true,
      message: "Enquiry submitted successfully",
      data: newEnquiry,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Failed to submit enquiry",
      error: err.message,
    });
  }
};

// GET: Get all enquiries
const getAllEnquiries = async (req, res) => {
  try {
    const { name = "", email = "", page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    // Build filter
    const filter = {};
    if (name) {
      filter.parentName = { $regex: name, $options: "i" };
    }
    if (email) {
      filter.email = { $regex: email, $options: "i" };
    }

    // Run both operations in parallel
    const [total, enquiries] = await Promise.all([
      Enquiry.countDocuments(filter),
      Enquiry.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize),
    ]);

    res.status(200).json({
      status: true,
      message: "Enquiries retrieved successfully",
      total,
      currentPage: pageNumber,
      totalPages: Math.ceil(total / pageSize),
      data: enquiries,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Error retrieving enquiries",
      error: err.message,
    });
  }
};

// ✅ Get Total Enquiry
const getTotalEnquiries = async (req, res) => {
  try {
    const total = await Enquiry.countDocuments();
    res.status(200).json({status:true, totalEnquiries:total });
  } catch (err) {
    res.status(500).json({status:false, message: 'Something went wrong',error:err?.message });
  }
};

// DELETE: Delete specific enquiry
const deleteEnquiry = async (req, res) => {
  try {
    const deleted = await Enquiry.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ status: false, message: "Enquiry not found" });
    }
    res.status(200).json({
      status: true,
      message: "Enquiry deleted successfully",
      data: deleted._id,
    });
  } catch (err) {
    res.status(400).json({
      status: false,
      message: "Failed to delete enquiry",
      error: err.message,
    });
  }
};

const deleteEnquiries = async (req, res) => {
  const { ids } = req.body;

  try {
    if (!ids || (Array.isArray(ids) && ids.length === 0)) {
      return res.status(400).json({
        status: false,
        message: "No enquiry ID(s) provided"
      });
    }

    // Ensure we always have an array
    const idList = Array.isArray(ids) ? ids : [ids];

    const result = await Enquiry.deleteMany({ _id: { $in: idList } });

    res.status(200).json({
      status: true,
      message: `${result.deletedCount} enquiry(s) deleted successfully`,
      deletedIds: idList
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to delete enquiry(s)",
      error: error.message
    });
  }
};

module.exports = {
  addEnquiry,
  getAllEnquiries,
  getTotalEnquiries,
  deleteEnquiry,
  deleteEnquiries,
};

