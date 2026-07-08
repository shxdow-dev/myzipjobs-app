import express from "express";
import mongoose from "mongoose";
import Swipe from "../models/Swipe.js";
import User from "../models/User.js";

const router = express.Router();

function scoreProfile(candidate, user) {
  let points = 0;

  const userArea = user.location?.area?.toLowerCase() || "";
  const userCity = user.location?.city?.toLowerCase() || "";
  const candidateArea = candidate.location?.area?.toLowerCase() || "";
  const candidateCity = candidate.location?.city?.toLowerCase() || "";

  if (userArea && candidateArea && candidateArea === userArea) {
    points += 40;
  } else if (userCity && candidateCity && candidateCity === userCity) {
    points += 20;
  }

  if (candidate.category && user.category && candidate.category === user.category) {
    points += 30;
  }

  if (candidate.time && user.time && candidate.time === user.time) {
    points += 15;
  }

  const userMin = user.wages?.min || 0;
  const userMax = user.wages?.max || 999999;
  const candidateMin = candidate.wages?.min || 0;
  const candidateMax = candidate.wages?.max || 999999;

  const overlaps = userMin <= candidateMax && candidateMin <= userMax;
  if (overlaps) {
    points += 10;
  }

  const overlapAmount =
    Math.min(userMax, candidateMax) - Math.max(userMin, candidateMin);
  if (overlapAmount > 5000) {
    points += 5;
  }

  if (user.role === "worker") {
    if (
      candidate.gender === "No Preference" ||
      (user.gender && candidate.gender === user.gender)
    ) {
      points += 5;
    }
  }

  if (candidate.verified) {
    points += 5;
  }

  return points;
}

router.get("/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const swiped = await Swipe.find({ swipedBy: user._id }).select("swipedOn");
    const swipedIds = swiped.map((s) => s.swipedOn);

    const cityPattern = user.location?.city
      ? new RegExp(user.location.city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
      : /^$/;

    const candidates = await User.find({
      role: user.role === "worker" ? "employer" : "worker",
      _id: { $nin: swipedIds },
      "location.city": { $regex: cityPattern },
    });

    const scored = candidates
      .map((profile) => ({ profile, score: scoreProfile(profile, user) }))
      .sort((a, b) => b.score - a.score)
      .map((item) => item.profile);

    const profiles = scored.slice(0, 20);

    if (profiles.length === 0) {
      return res.json({ message: "No profiles found nearby", profiles: [] });
    }

    return res.json({ profiles });
  } catch (error) {
    return next(error);
  }
});

export default router;
