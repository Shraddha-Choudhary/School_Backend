const mongoose = require("mongoose");

const admissionSchema = new mongoose.Schema(
  {
    childName: {
      type: String,
      required: [true, "Child name is required"],
      trim: true,
    },
    grade: {
      type: String,
      required: [true, "Grade is required"],
      trim: true,
    },
    academicYear: {
      type: String,
      required: [true, "Academic year is required"],
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"],
    },
    parentName: {
      type: String,
      required: [true, "Parent name is required"],
      trim: true,
    },
    email:{
      type: String,
      required: [true, "Email  is required"],
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    message:{
      type: String,
      required: [true, "Message  is required"],
      trim: true,
    },
    status:{
      type: String,
      enum: ['active','inactive'],
      default:"active"
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Admission", admissionSchema);
