import express from "express";
import mongoose from "mongoose";
import Match from "../models/Match.js";
import Swipe from "../models/Swipe.js";
import User from "../models/User.js";

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const { swipedBy, swipedOn, action } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(swipedBy) ||
      !mongoose.Types.ObjectId.isValid(swipedOn)
    ) {
      return res.status(400).json({ message: "Invalid user IDs" });
    }

    const actor = await User.findById(swipedBy);
    const target = await User.findById(swipedOn);
    if (!actor || !target) {
      return res.status(404).json({ message: "User not found" });
    }

    const swipe = await Swipe.findOneAndUpdate(
      { swipedBy, swipedOn },
      { action, createdAt: Date.now() },
      { upsert: true, new: true, runValidators: true }
    );

    if (action === "pass") {
      return res.json({ matched: false, swipeId: swipe._id });
    }

    const reverseConnect = await Swipe.findOne({
      swipedBy: swipedOn,
      swipedOn: swipedBy,
      action: "connect",
    });

    if (!reverseConnect) {
      return res.json({ matched: false, swipeId: swipe._id });
    }

    const workerId = actor.role === "worker" ? actor._id : target._id;
    const employerId = actor.role === "employer" ? actor._id : target._id;

    const match = await Match.findOneAndUpdate(
      { worker: workerId, employer: employerId },
      { status: "active" },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const io = req.app.get("io");
    const userSocketMap = req.app.get("userSocketMap");

    if (io && userSocketMap) {
      const actorSocket = userSocketMap.get(String(actor._id));
      const targetSocket = userSocketMap.get(String(target._id));

      if (actorSocket) {
        io.to(actorSocket).emit("matched", {
          matchedProfile: target,
          matchId: match._id,
        });
      }

      if (targetSocket) {
        io.to(targetSocket).emit("matched", {
          matchedProfile: actor,
          matchId: match._id,
        });
      }
    }

    return res.json({
      matched: true,
      matchId: match._id,
      matchedProfile: target,
    });
  } catch (error) {
    return next(error);
  }
});

router.delete("/undo", async (req, res, next) => {
  try {
    const { swipedBy, swipedOn } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(swipedBy) ||
      !mongoose.Types.ObjectId.isValid(swipedOn)
    ) {
      return res.status(400).json({ message: "Invalid user IDs" });
    }

    await Swipe.deleteOne({ swipedBy, swipedOn });
    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
});

router.delete("/reset/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    await Swipe.deleteMany({ swipedBy: userId });
    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
});

export default router;
