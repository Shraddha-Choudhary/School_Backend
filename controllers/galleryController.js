const GalleryImage = require("../models/GalleryImage");
const path = require("path");
const fs = require("fs");
// ✅ UPLOAD
exports.uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: false,
        message: "No files uploaded",
      });
    }

    // Extract only filenames (not full path)
    const imageFilenames = req.files.map((file) => file.filename);

    const newImageGroup = new GalleryImage({
      imageUrl: imageFilenames,
    });

    await newImageGroup.save();

    res.status(201).json({
      status: true,
      message: "Images uploaded successfully ✅",
      data: newImageGroup,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error uploading images",
      error: error.message,
    });
  }
};

// 🔧 GET paginated images
exports.getImages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const [images, totalCount] = await Promise.all([
      GalleryImage.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      GalleryImage.countDocuments(),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    // Corrected: use the proper 'gallaries' spelling (not 'galleries' if your folder is 'gallaries')
    const baseUrl = `${req.protocol}://${req.get("host")}/uploads/gallaries/`;

    const updatedImages = images.map((group) => {
      return {
        ...group.toObject(),
        imageUrl: Array.isArray(group.imageUrl)
          ? group.imageUrl.map((fileName) => `${baseUrl}${fileName}`)
          : `${baseUrl}${group.imageUrl}`, // fallback if it's a string
      };
    });


    res.status(200).json({
      status: true,
      message: "Images fetched successfully ✅",
      data: updatedImages,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
      },
    });
  } catch (error) {
    console.error("Get Images error ❌", error);
    res.status(500).json({
      status: false,
      message: "Error fetching images",
      error: error.message,
    });
  }
};

// ✅ Get Total Images
exports.getTotalImages = async (req, res) => {
  try {
    const total = await GalleryImage.countDocuments();
    res.status(200).json({ status: true, totalImages: total });
  } catch (err) {
    res.status(500).json({ status: false, message: 'Something went wrong', error: err?.message });
  }
};

// ✅ Delete image by IDs
exports.deleteImages = async (req, res) => {
  const { ids } = req.body;

  try {
    if (!ids || (Array.isArray(ids) && ids.length === 0)) {
      return res.status(400).json({ status: false, message: "No image ID(s) provided" });
    }

    const idList = Array.isArray(ids) ? ids : [ids];

    const images = await GalleryImage.find({ _id: { $in: idList } });

    await Promise.all(
      images.map(async (image) => {
        // Handle imageUrl as string or array
        const imageUrls = Array.isArray(image.imageUrl) ? image.imageUrl : [image.imageUrl];

        imageUrls.forEach((url) => {
          if (url) {
            const filePath = path.join(__dirname, "..", url);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          }
        });

        await image.deleteOne();
      })
    );
    res.status(200).json({
      status: true,
      message: `${images.length} image(s) deleted successfully ✅`,
      deletedIds: idList,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error deleting image(s)",
      error: error.message,
    });
  }
};

// ✅ Delete single image
exports.deleteImage = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) {
      return res.status(400).json({ status: false, message: "No image ID provided" });
    }
    const image = await GalleryImage.findById(id);
    if (!image) return res.status(404).json({ status: false, message: "Image not found" });

    // Delete image files
    image.imageUrl.forEach((filePath) => {
      const fullPath = path.join(__dirname, "..", filePath);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    });

    await image.deleteOne();


    res.status(200).json({
      status: true,
      message: "Image deleted successfully ✅",
      deletedId: id,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error deleting image",
      error: error.message,
    });
  }
};

