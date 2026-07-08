import express from "express";
import mongoose from "mongoose";
import Swipe from "../models/Swipe.js";
import User from "../models/User.js";

const router = express.Router();

router.get("/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const requester = await User.findById(userId);
    if (!requester) {
      return res.status(404).json({ message: "User not found" });
    }

    const oppositeRole = requester.role === "worker" ? "employer" : "worker";

    const swipes = await Swipe.find({ swipedBy: requester._id }).select("swipedOn");
    const alreadySwipedIds = swipes.map((swipe) => swipe.swipedOn);

    const cityRegex = new RegExp(`^${requester.location?.city || ""}$`, "i");

    const sort =
      requester.role === "employer"
        ? { verified: -1, rating: -1 }
        : { verified: -1, postedAgo: -1 };

    const profiles = await User.find({
      role: oppositeRole,
      _id: { $nin: alreadySwipedIds },
      "location.city": cityRegex,
    })
      .sort(sort)
      .limit(20);

    if (profiles.length === 0) {
      return res.json({ message: "No profiles found nearby", profiles: [] });
    }

    return res.json({ profiles });
  } catch (error) {
    return next(error);
  }
});

export default router;
