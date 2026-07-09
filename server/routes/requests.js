import express from "express";
import mongoose from "mongoose";
import Match from "../models/Match.js";
import Request from "../models/Request.js";
import User from "../models/User.js";

const router = express.Router();

const userFields =
  "name category location wages time gender about verified rating jobsDone languages role";

function getWorkerEmployerIds(userA, userB) {
  const workerId =
    userA.role === "worker" ? userA._id : userB._id;
  const employerId =
    userA.role === "employer" ? userA._id : userB._id;
  return { workerId, employerId };
}

router.get("/incoming/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const requests = await Request.find({
      sentTo: userId,
      status: "pending",
    })
      .populate("sentBy", userFields)
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/outgoing/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const requests = await Request.find({ sentBy: userId })
      .populate("sentTo", userFields)
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/send", async (req, res) => {
  try {
    const { sentBy, sentTo, message } = req.body;

    if (!sentBy || !sentTo) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const [sender, receiver] = await Promise.all([
      User.findById(sentBy),
      User.findById(sentTo),
    ]);

    if (!sender || !receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    const { workerId, employerId } = getWorkerEmployerIds(sender, receiver);
    const existingMatch = await Match.findOne({ worker: workerId, employer: employerId });
    if (existingMatch) {
      return res.status(400).json({ message: "You are already matched" });
    }

    const existing = await Request.findOne({ sentBy, sentTo });
    if (existing) {
      return res.status(409).json({ message: "Request already sent" });
    }

    const request = await Request.create({
      sentBy,
      sentTo,
      message: message || "",
    });

    const saved = await Request.findById(request._id).populate("sentBy", userFields);

    const io = req.app.get("io");
    const userSocketMap = req.app.get("userSocketMap");

    if (io && userSocketMap) {
      const receiverSocket = userSocketMap.get(String(sentTo));
      if (receiverSocket) {
        io.to(receiverSocket).emit("newRequest", {
          requestId: saved._id,
          from: {
            _id: saved.sentBy._id,
            name: saved.sentBy.name,
            category: saved.sentBy.category,
            location: saved.sentBy.location,
          },
        });
      }
    }

    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:requestId/respond", async (req, res) => {
  try {
    const { requestId } = req.params;
    const { respondedBy, action } = req.body;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: "Invalid requestId" });
    }

    if (!["accept", "reject"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    const request = await Request.findById(requestId).populate(
      "sentBy sentTo",
      userFields
    );

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (String(request.sentTo._id) !== String(respondedBy)) {
      return res.status(403).json({ message: "Only the receiver can respond" });
    }

    const io = req.app.get("io");
    const userSocketMap = req.app.get("userSocketMap");

    if (action === "accept") {
      request.status = "accepted";
      request.respondedAt = new Date();
      await request.save();

      const { workerId, employerId } = getWorkerEmployerIds(
        request.sentBy,
        request.sentTo
      );

      const match = await Match.findOneAndUpdate(
        { worker: workerId, employer: employerId },
        { status: "active" },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      const matchedProfile = request.sentBy.toObject();

      if (io && userSocketMap) {
        const senderSocket = userSocketMap.get(String(request.sentBy._id));
        if (senderSocket) {
          io.to(senderSocket).emit("requestAccepted", {
            matchId: match._id,
            matchedProfile: request.sentTo.toObject(),
          });
        }

        const receiverSocket = userSocketMap.get(String(request.sentTo._id));
        if (receiverSocket) {
          io.to(receiverSocket).emit("requestAccepted", {
            matchId: match._id,
            matchedProfile: matchedProfile,
          });
        }
      }

      return res.json({
        accepted: true,
        matchId: match._id,
        matchedProfile,
      });
    }

    request.status = "rejected";
    request.respondedAt = new Date();
    await request.save();

    if (io && userSocketMap) {
      const senderSocket = userSocketMap.get(String(request.sentBy._id));
      if (senderSocket) {
        io.to(senderSocket).emit("requestRejected", {
          by: request.sentTo.name,
        });
      }
    }

    return res.json({ rejected: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
