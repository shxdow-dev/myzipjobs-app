import express from "express";
import Match from "../models/Match.js";

const router = express.Router();

router.get("/:userId/history", async (req, res) => {
  try {
    const userId = req.params.userId;

    const matches = await Match.find({
      $or: [{ worker: userId }, { employer: userId }],
      jobStatus: "closed",
    })
      .populate("worker")
      .populate("employer")
      .sort({ closedAt: -1 });

    const profiles = matches.map((match) => {
      const isWorker = String(match.worker._id) === String(userId);
      const otherPerson = isWorker ? match.employer : match.worker;
      return {
        matchId: match._id,
        closedAt: match.closedAt,
        ...otherPerson.toObject(),
      };
    });

    res.json(profiles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const matches = await Match.find({
      $or: [{ worker: userId }, { employer: userId }],
      jobStatus: { $ne: "closed" },
    })
      .populate("worker")
      .populate("employer");

    const profiles = matches.map((match) => {
      const isWorker = String(match.worker._id) === String(userId);
      const otherProfile = isWorker ? match.employer : match.worker;
      return {
        matchId: match._id,
        ...otherProfile.toObject(),
      };
    });

    res.json(profiles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
