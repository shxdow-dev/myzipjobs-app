import express from "express";
import mongoose from "mongoose";
import SOSAlert from "../models/SOSAlert.js";

const router = express.Router();

const VALID_REASONS = [
  "unsafe",
  "no_show",
  "harassment",
  "suspicious_behavior",
  "other",
];

router.post("/", async (req, res, next) => {
  try {
    const { userId, matchId, otherUserId, location, reason, note } = req.body;

    if (!userId || !reason) {
      return res.status(400).json({ message: "userId and reason are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    if (!VALID_REASONS.includes(reason)) {
      return res.status(400).json({ message: "Invalid reason" });
    }

    if (matchId && !mongoose.Types.ObjectId.isValid(matchId)) {
      return res.status(400).json({ message: "Invalid matchId" });
    }

    if (otherUserId && !mongoose.Types.ObjectId.isValid(otherUserId)) {
      return res.status(400).json({ message: "Invalid otherUserId" });
    }

    const alertData = {
      userId,
      reason,
      note: note || "",
      status: "active",
    };

    if (matchId) alertData.matchId = matchId;
    if (otherUserId) alertData.otherUserId = otherUserId;

    if (location?.lat != null && location?.lng != null) {
      alertData.location = {
        lat: Number(location.lat),
        lng: Number(location.lng),
      };
    }

    const alert = await SOSAlert.create(alertData);
    return res.status(201).json(alert);
  } catch (error) {
    return next(error);
  }
});

router.get("/user/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const alerts = await SOSAlert.find({ userId })
      .populate("otherUserId", "name")
      .sort({ createdAt: -1 });

    return res.json(alerts);
  } catch (error) {
    return next(error);
  }
});

router.put("/:alertId/resolve", async (req, res, next) => {
  try {
    const { alertId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(alertId)) {
      return res.status(400).json({ message: "Invalid alertId" });
    }

    const alert = await SOSAlert.findByIdAndUpdate(
      alertId,
      { status: "resolved", resolvedAt: new Date() },
      { new: true }
    ).populate("otherUserId", "name");

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    return res.json(alert);
  } catch (error) {
    return next(error);
  }
});

export default router;
