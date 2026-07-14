import express from "express";
import mongoose from "mongoose";
import Match from "../models/Match.js";
import Message from "../models/Message.js";
import Request from "../models/Request.js";
import Rating from "../models/Rating.js";
import Swipe from "../models/Swipe.js";
import User from "../models/User.js";

const router = express.Router();

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

    const totalMatches = await Match.countDocuments({
      $or: [{ worker: userId }, { employer: userId }],
      jobStatus: { $ne: "closed" },
      status: "active",
    });

    const unreadMessages = await Message.countDocuments({
      receiverId: userId,
      read: false,
    });

    const totalSwipes = await Swipe.countDocuments({
      swipedBy: userId,
    });

    const connectSwipes = await Swipe.countDocuments({
      swipedBy: userId,
      action: "connect",
    });

    const connectRate =
      totalSwipes > 0
        ? Math.round((connectSwipes / totalSwipes) * 100)
        : 0;

    const incomingRequests = await Request.countDocuments({
      sentTo: userId,
      status: "pending",
    });

    const ratingAgg = await Rating.aggregate([
      {
        $match: {
          ratedTo: new mongoose.Types.ObjectId(String(userId)),
        },
      },
      {
        $group: {
          _id: null,
          avg: { $avg: "$score" },
          count: { $sum: 1 },
        },
      },
    ]);

    const averageRating = ratingAgg[0]?.avg
      ? Math.round(ratingAgg[0].avg * 10) / 10
      : 0;
    const ratingCount = ratingAgg[0]?.count || 0;

    const recentMatches = await Match.find({
      $or: [{ worker: userId }, { employer: userId }],
      jobStatus: { $ne: "closed" },
    })
      .populate("worker", "name category role rating jobsDone location")
      .populate("employer", "name category role rating jobsDone location")
      .sort({ createdAt: -1 })
      .limit(3);

    const recentProfiles = recentMatches.map((match) => {
      const isWorker = String(match.worker._id) === String(userId);
      return {
        matchId: match._id,
        profile: isWorker ? match.employer : match.worker,
      };
    });

    return res.json({
      totalMatches,
      unreadMessages,
      totalSwipes,
      connectRate: `${connectRate}%`,
      incomingRequests,
      averageRating,
      ratingCount,
      recentMatches: recentProfiles,
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
