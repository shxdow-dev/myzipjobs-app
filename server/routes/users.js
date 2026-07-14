import express from "express";
import mongoose from "mongoose";
import Swipe from "../models/Swipe.js";
import Rating from "../models/Rating.js";
import User from "../models/User.js";

const router = express.Router();

router.post("/register", async (req, res, next) => {
  try {
    const {
      phone,
      role,
      name,
      category,
      location,
      languages,
      experience,
      about,
      requirement,
      time,
      wages,
      gender,
      membersRequired,
    } = req.body;

    const existingUser = await User.findOne({ phone: String(phone).trim() });
    if (existingUser) {
      return res.status(409).json({ message: "Phone already registered" });
    }

    const user = await User.create({
      phone,
      role,
      name,
      category,
      location,
      languages,
      experience,
      about,
      requirement,
      time,
      wages,
      gender,
      membersRequired,
    });

    return res.status(201).json(user);
  } catch (error) {
    return next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { phone } = req.body;
    const user = await User.findOne({ phone: String(phone).trim() });

    if (!user) {
      return res.status(404).json({
        message: "No account found with this number",
      });
    }

    return res.json({
      _id: user._id,
      name: user.name,
      role: user.role,
      category: user.category,
      location: user.location,
      wages: user.wages,
      time: user.time,
      gender: user.gender,
      languages: user.languages,
      about: user.about,
      membersRequired: user.membersRequired,
    });
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

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

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

    return res.json({
      ...user.toObject(),
      averageRating,
      ratingCount,
    });
  } catch (error) {
    return next(error);
  }
});

router.put("/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const oldUser = await User.findById(userId);
    if (!oldUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const body = { ...req.body };
    delete body._id;
    delete body.phone;
    delete body.role;

    const matchingFields = ["category", "time", "gender"];
    const preferencesChanged =
      matchingFields.some((f) => body[f] !== undefined && body[f] !== oldUser[f]) ||
      (body.location?.area !== undefined &&
        body.location.area !== oldUser.location?.area) ||
      (body.location?.city !== undefined &&
        body.location.city !== oldUser.location?.city) ||
      (body.wages?.min !== undefined && body.wages.min !== oldUser.wages?.min) ||
      (body.wages?.max !== undefined && body.wages.max !== oldUser.wages?.max);

    const updated = await User.findByIdAndUpdate(userId, body, {
      new: true,
      runValidators: true,
    });

    if (preferencesChanged) {
      await Swipe.deleteMany({ swipedBy: userId });
    }

    return res.json({
      ...updated.toObject(),
      swipesReset: preferencesChanged,
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
