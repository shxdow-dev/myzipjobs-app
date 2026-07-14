import express from "express";
import mongoose from "mongoose";
import Match from "../models/Match.js";
import Notification from "../models/Notification.js";
import Rating from "../models/Rating.js";
import User from "../models/User.js";

const router = express.Router();

router.post("/:matchId/done", async (req, res, next) => {
  try {
    const { matchId } = req.params;
    const { workerId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(matchId)) {
      return res.status(400).json({ message: "Invalid matchId" });
    }

    if (!workerId || !mongoose.Types.ObjectId.isValid(workerId)) {
      return res.status(400).json({ message: "Invalid workerId" });
    }

    const match = await Match.findById(matchId)
      .populate("worker")
      .populate("employer");

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    if (String(match.worker._id) !== String(workerId)) {
      return res.status(403).json({ message: "Only worker can mark work done" });
    }

    if (match.jobStatus === "closed") {
      return res.status(400).json({ message: "Already marked as done" });
    }

    await Match.findByIdAndUpdate(matchId, {
      jobStatus: "closed",
      closedAt: new Date(),
      closedBy: workerId,
    });

    const title = "Work Completed! ✅";
    const message = `${match.worker.name} has marked the work as complete.`;

    await Notification.create({
      userId: match.employer._id,
      type: "work_done",
      title,
      message,
      matchId,
      fromUser: match.worker._id,
    });

    const io = req.app.get("io");
    const userSocketMap = req.app.get("userSocketMap");
    const employerSocketId = userSocketMap?.get(String(match.employer._id));

    if (employerSocketId && io) {
      io.to(employerSocketId).emit("workDone", {
        matchId,
        workerName: match.worker.name,
        workerCategory: match.worker.category,
        title,
        message: `${match.worker.name} has completed the work!`,
      });
    }

    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
});

router.get("/:matchId/hasRated/:userId", async (req, res, next) => {
  try {
    const { matchId, userId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(matchId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({ message: "Invalid IDs" });
    }

    const existing = await Rating.findOne({ matchId, ratedBy: userId });

    return res.json({
      hasRated: !!existing,
      score: existing?.score ?? null,
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/:matchId/status", async (req, res, next) => {
  try {
    const { matchId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(matchId)) {
      return res.status(400).json({ message: "Invalid matchId" });
    }

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    return res.json({
      jobStatus: match.jobStatus || "active",
      closedAt: match.closedAt,
      closedBy: match.closedBy,
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/:matchId/rate", async (req, res, next) => {
  try {
    const { matchId } = req.params;
    const { ratedBy, ratedTo, score, review } = req.body;

    if (!mongoose.Types.ObjectId.isValid(matchId)) {
      return res.status(400).json({ message: "Invalid matchId" });
    }

    if (
      !ratedBy ||
      !ratedTo ||
      score == null ||
      score < 1 ||
      score > 5 ||
      !mongoose.Types.ObjectId.isValid(ratedBy) ||
      !mongoose.Types.ObjectId.isValid(ratedTo)
    ) {
      return res.status(400).json({ message: "Invalid rating data" });
    }

    const existing = await Rating.findOne({ matchId, ratedBy });
    if (existing) {
      return res.status(409).json({ message: "Already rated this match" });
    }

    await Rating.create({
      matchId,
      ratedBy,
      ratedTo,
      score,
      review: review || "",
    });

    const allRatings = await Rating.find({ ratedTo });
    const avg =
      allRatings.reduce((sum, r) => sum + r.score, 0) / allRatings.length;
    const newRating = Math.round(avg * 10) / 10;

    await User.findByIdAndUpdate(ratedTo, {
      rating: newRating,
      jobsDone: allRatings.length,
    });

    return res.json({ success: true, newRating });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Already rated this match" });
    }
    return next(error);
  }
});

export default router;
