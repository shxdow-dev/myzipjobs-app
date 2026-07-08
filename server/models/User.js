import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["worker", "employer"],
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: "",
      trim: true,
    },
    location: {
      area: {
        type: String,
        default: "",
        trim: true,
      },
      city: {
        type: String,
        default: "",
        trim: true,
      },
    },
    languages: {
      type: [String],
      default: [],
    },
    verified: {
      type: Boolean,
      default: false,
    },
    about: {
      type: String,
      default: "",
      trim: true,
    },
    experience: {
      type: String,
      default: "",
      trim: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    jobsDone: {
      type: Number,
      default: 0,
    },
    available: {
      type: Boolean,
      default: true,
    },
    requirement: {
      type: String,
      default: "",
      trim: true,
    },
    postedAgo: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

const User = mongoose.model("User", userSchema);

export default User;
