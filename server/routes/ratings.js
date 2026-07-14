import express from "express";
import mongoose from "mongoose";
import Match from "../models/Match.js";
import Rating from "../models/Rating.js";
import User from "../models/User.js";

const router = express.Router();

async function getRatingStats(userId) {
  const result = await Rating.aggregate([
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

  return {
    average: result[0]?.avg ? Math.round(result[0].avg * 10) / 10 : 0,
    count: result[0]?.count || 0,
  };
}

async function syncUserRating(userId) {
  const { average, count } = await getRatingStats(userId);
  await User.findByIdAndUpdate(userId, { rating: average, jobsDone: count });
  return { average, count };
}

router.post("/", async (req, res, next) => {
  try {
    const { matchId, ratedBy, ratedTo, score, review } = req.body;
    const raterId = ratedBy || req.body.raterId;
    const ratedUserId = ratedTo || req.body.ratedUserId;
    const stars = score ?? req.body.stars;
    const comment = review ?? req.body.comment ?? "";

    if (
      !matchId ||
      !raterId ||
      !ratedUserId ||
      stars == null ||
      stars < 1 ||
      stars > 5
    ) {
      return res.status(400).json({ message: "Invalid rating data" });
    }

    if (
      !mongoose.Types.ObjectId.isValid(matchId) ||
      !mongoose.Types.ObjectId.isValid(raterId) ||
      !mongoose.Types.ObjectId.isValid(ratedUserId)
    ) {
      return res.status(400).json({ message: "Invalid IDs" });
    }

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    const isParticipant =
      String(match.worker) === String(raterId) ||
      String(match.employer) === String(raterId);

    if (!isParticipant) {
      return res.status(403).json({ message: "Not part of this match" });
    }

    const otherUserId =
      String(match.worker) === String(raterId)
        ? String(match.employer)
        : String(match.worker);

    if (String(ratedUserId) !== otherUserId) {
      return res.status(400).json({ message: "Invalid rated user for match" });
    }

    const existing = await Rating.findOne({ matchId, ratedBy: raterId });
    if (existing) {
      return res.status(409).json({ message: "Already rated this match" });
    }

    const rating = await Rating.create({
      matchId,
      ratedBy: raterId,
      ratedTo: ratedUserId,
      score: stars,
      review: comment,
    });

    await syncUserRating(ratedUserId);

    return res.status(201).json(rating);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Already rated this match" });
    }
    return next(error);
  }
});

router.get("/user/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const ratings = await Rating.find({
      ratedTo: new mongoose.Types.ObjectId(String(userId)),
    })
      .populate("ratedBy", "name category")
      .sort({ createdAt: -1 });

    const { average, count } = await getRatingStats(userId);

    return res.json({
      ratings,
      average,
      count,
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/match/:matchId/:userId", async (req, res, next) => {
  try {
    const { matchId, userId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(matchId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({ message: "Invalid IDs" });
    }

    const existing = await Rating.findOne({ matchId, ratedBy: userId });

    if (existing) {
      return res.json({
        alreadyRated: true,
        hasRated: true,
        score: existing.score,
        stars: existing.score,
        review: existing.review,
      });
    }

    return res.json({ alreadyRated: false, hasRated: false });
  } catch (error) {
    return next(error);
  }
});

export default router;
