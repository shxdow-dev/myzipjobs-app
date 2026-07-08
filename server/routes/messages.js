import express from "express";
import mongoose from "mongoose";
import Match from "../models/Match.js";
import Message from "../models/Message.js";

const router = express.Router();

function isUserInMatch(match, userId) {
  const id = String(userId);
  return (
    String(match.worker?._id || match.worker) === id ||
    String(match.employer?._id || match.employer) === id
  );
}

function getOtherPerson(match, userId) {
  const id = String(userId);
  if (String(match.worker?._id || match.worker) === id) {
    return match.employer;
  }
  return match.worker;
}

router.get("/conversations/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const matches = await Match.find({
      $or: [{ worker: userId }, { employer: userId }],
    })
      .populate("worker", "name category role")
      .populate("employer", "name category role");

    const conversations = await Promise.all(
      matches.map(async (match) => {
        const other = getOtherPerson(match, userId);
        const otherDoc = other?.toObject ? other.toObject() : other;

        const [lastMessage, unreadCount] = await Promise.all([
          Message.findOne({ matchId: match._id })
            .sort({ createdAt: -1 })
            .select("text createdAt senderId"),
          Message.countDocuments({
            matchId: match._id,
            receiverId: userId,
            read: false,
          }),
        ]);

        return {
          matchId: match._id,
          otherPerson: {
            _id: otherDoc._id,
            name: otherDoc.name,
            category: otherDoc.category,
            role: otherDoc.role,
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

    return res.json(conversations);
  } catch (error) {
    return next(error);
  }
});

router.get("/:matchId", async (req, res, next) => {
  try {
    const { matchId } = req.params;
    const { userId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(matchId)) {
      return res.status(400).json({ message: "Invalid matchId" });
    }

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Valid userId query param required" });
    }

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    if (!isUserInMatch(match, userId)) {
      return res.status(403).json({ message: "Not part of this match" });
    }

    await Message.updateMany(
      { matchId, receiverId: userId, read: false },
      { read: true }
    );

    const messages = await Message.find({ matchId })
      .sort({ createdAt: 1 })
      .populate("senderId", "name");

    return res.json(messages);
  } catch (error) {
    return next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { matchId, senderId, receiverId, text } = req.body;

    if (
      !matchId ||
      !senderId ||
      !receiverId ||
      !text?.trim() ||
      !mongoose.Types.ObjectId.isValid(matchId) ||
      !mongoose.Types.ObjectId.isValid(senderId) ||
      !mongoose.Types.ObjectId.isValid(receiverId)
    ) {
      return res.status(400).json({ message: "Invalid message payload" });
    }

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    if (!isUserInMatch(match, senderId) || !isUserInMatch(match, receiverId)) {
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

    return res.status(201).json(savedMessage);
  } catch (error) {
    return next(error);
  }
});

export default router;
