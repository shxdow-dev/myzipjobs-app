import mongoose from "mongoose";

const sosAlertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
    },
    otherUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    location: {
      lat: Number,
      lng: Number,
    },
    reason: {
      type: String,
      enum: [
        "unsafe",
        "no_show",
        "harassment",
        "suspicious_behavior",
        "other",
      ],
      required: true,
    },
    note: {
      type: String,
      maxlength: 300,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "resolved"],
      default: "active",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    resolvedAt: {
      type: Date,
    },
  },
  { versionKey: false }
);

const SOSAlert = mongoose.model("SOSAlert", sosAlertSchema);

export default SOSAlert;
