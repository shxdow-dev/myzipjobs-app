import express from "express";
import mongoose from "mongoose";
import Match from "../models/Match.js";
import Message from "../models/Message.js";

const router = express.Router();

function isMatchParticipant(match, userId) {
  return (
    String(match.worker) === String(userId) ||
    String(match.employer) === String(userId)
  );
}

router.get("/conversations/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const matches = await Match.find({
      $or: [{ worker: userId }, { employer: userId }],
    })
      .populate("worker", "name category role")
      .populate("employer", "name category role");

    const conversations = await Promise.all(
      matches.map(async (match) => {
        const isWorker = String(match.worker._id) === String(userId);
        const otherPerson = isWorker ? match.employer : match.worker;

        const lastMessage = await Message.findOne({ matchId: match._id })
          .sort({ createdAt: -1 })
          .select("text createdAt senderId");

        const unreadCount = await Message.countDocuments({
          matchId: match._id,
          receiverId: userId,
          read: false,
        });

        return {
          matchId: match._id,
          otherPerson: {
            _id: otherPerson._id,
            name: otherPerson.name,
            category: otherPerson.category,
            role: otherPerson.role,
          },
          lastMessage: lastMessage
            ? {
                text: lastMessage.text,
                createdAt: lastMessage.createdAt,
                senderId: lastMessage.senderId,
              }
            : null,
          unreadCount,
        };
      })
    );

    conversations.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt
        ? new Date(a.lastMessage.createdAt).getTime()
        : 0;
      const bTime = b.lastMessage?.createdAt
        ? new Date(b.lastMessage.createdAt).getTime()
        : 0;
      return bTime - aTime;
    });

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { matchId, senderId, receiverId, text } = req.body;

    if (!matchId || !senderId || !receiverId || !text?.trim()) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    if (
      !isMatchParticipant(match, senderId) ||
      !isMatchParticipant(match, receiverId)
    ) {
      return res.status(403).json({ message: "Users are not part of this match" });
    }

    const message = await Message.create({
      matchId,
      senderId,
      receiverId,
      text: text.trim(),
    });

    const savedMessage = await Message.findById(message._id).populate(
      "senderId",
      "name"
    );

    const io = req.app.get("io");
    if (io) {
      io.to(String(matchId)).emit("newMessage", savedMessage);
    }

    res.status(201).json(savedMessage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:matchId", async (req, res) => {
  try {
    const { matchId } = req.params;
    const { userId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(matchId)) {
      return res.status(400).json({ message: "Invalid matchId" });
    }

    if (userId) {
      await Message.updateMany(
        { matchId, receiverId: userId, read: false },
        { read: true }
      );
    }

    const messages = await Message.find({ matchId })
      .sort({ createdAt: 1 })
      .populate("senderId", "name");

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
