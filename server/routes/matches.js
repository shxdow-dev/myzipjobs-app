import express from "express";
import mongoose from "mongoose";
import Match from "../models/Match.js";

const router = express.Router();

router.get("/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const matches = await Match.find({
      $or: [{ worker: userId }, { employer: userId }],
    })
      .populate("worker")
      .populate("employer")
      .sort({ createdAt: -1 });

    const profiles = matches.map((match) => {
      const isWorker = String(match.worker?._id) === userId;
      return {
        matchId: match._id,
        status: match.status,
        createdAt: match.createdAt,
        profile: isWorker ? match.employer : match.worker,
      };
    });

    return res.json({ matches: profiles });
  } catch (error) {
    return next(error);
  }
});

export default router;
