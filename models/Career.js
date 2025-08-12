const mongoose = require("mongoose");

const careerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Enter a valid email"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
    },
    resume: {
      type: String,
      required: [true, "Resume file is required"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Career", careerSchema);
