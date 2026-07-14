import express from "express";
import mongoose from "mongoose";
import Notification from "../models/Notification.js";

const router = express.Router();

router.get("/:userId/unread", async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const count = await Notification.countDocuments({
      userId,
      read: false,
    });

    return res.json({ count });
  } catch (error) {
    return next(error);
  }
});

router.put("/:userId/markRead", async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    await Notification.updateMany({ userId, read: false }, { read: true });

    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
});

router.put("/:notificationId/read", async (req, res, next) => {
  try {
    const { notificationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({ message: "Invalid notificationId" });
    }

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
});

router.get("/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.json(notifications);
  } catch (error) {
    return next(error);
  }
});

export default router;
