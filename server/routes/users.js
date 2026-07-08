import express from "express";
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

export default router;
