import mongoose from "mongoose";

const swipeSchema = new mongoose.Schema(
  {
    swipedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    swipedOn: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      enum: ["pass", "connect"],
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

swipeSchema.index({ swipedBy: 1, swipedOn: 1 }, { unique: true });

const Swipe = mongoose.model("Swipe", swipeSchema);

export default Swipe;
