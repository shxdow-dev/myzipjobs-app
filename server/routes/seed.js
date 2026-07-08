import express from "express";
import User from "../models/User.js";

const router = express.Router();

const workerNames = [
  "Ravi Kumar",
  "Sunita Devi",
  "Imran Khan",
  "Lakshmi Reddy",
  "Arun Yadav",
  "Shabana Begum",
  "Mahesh Naik",
  "Pooja Sharma",
  "Karthik Goud",
  "Farida Sheikh",
];

const employerNames = [
  "Neha Verma",
  "Suresh Reddy",
  "Priya Nair",
  "Amit Agarwal",
  "Meera Rao",
  "Nitin Arora",
  "Divya Iyer",
  "Rahul Bansal",
  "Ananya Gupta",
  "Vikram Singh",
];

const categories = [
  "House Help",
  "Cook",
  "Driver",
  "Electrician",
  "Plumber",
  "Carpenter",
  "Security Guard",
  "Construction Labour",
];

const hyderabadAreas = [
  "Banjara Hills",
  "Jubilee Hills",
  "Madhapur",
  "Kukatpally",
  "Gachibowli",
  "Begumpet",
  "Ameerpet",
  "Miyapur",
  "Hitech City",
  "Secunderabad",
];

router.post("/", async (req, res, next) => {
  try {
    if (process.env.NODE_ENV !== "development") {
      return res.status(403).json({
        message: "Seed route is allowed only in development",
      });
    }

    await User.deleteMany({});

    const workers = workerNames.map((name, index) => ({
      phone: `90000000${String(index).padStart(2, "0")}`,
      role: "worker",
      name,
      category: categories[index % categories.length],
      location: { area: hyderabadAreas[index], city: "Hyderabad" },
      languages: ["Hindi", "Telugu"],
      verified: index % 2 === 0,
      about: `${name} is an experienced ${categories[index % categories.length].toLowerCase()}.`,
      experience: `${2 + (index % 6)} years`,
      rating: 3.8 + (index % 3) * 0.4,
      jobsDone: 25 + index * 7,
      available: true,
    }));

    const employers = employerNames.map((name, index) => ({
      phone: `98888000${String(index).padStart(2, "0")}`,
      role: "employer",
      name,
      category: categories[(index + 2) % categories.length],
      requirement: `Need a reliable ${categories[
        (index + 2) % categories.length
      ].toLowerCase()} for home support.`,
      location: { area: hyderabadAreas[(index + 3) % hyderabadAreas.length], city: "Hyderabad" },
      languages: ["English", "Telugu"],
      verified: index % 3 !== 0,
      about: `${name} is looking for trusted local help.`,
      postedAgo: new Date(Date.now() - index * 86400000),
    }));

    const inserted = await User.insertMany([...workers, ...employers]);

    return res.status(201).json({
      insertedCount: inserted.length,
      message: "Seed data inserted successfully",
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
