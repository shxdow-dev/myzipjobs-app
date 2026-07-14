import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
  {
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
    },
    jobStatus: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
    },
    closedAt: {
      type: Date,
      default: null,
    },
    closedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { versionKey: false }
);

matchSchema.index({ worker: 1, employer: 1 }, { unique: true });

const Match = mongoose.model("Match", matchSchema);

export default Match;
