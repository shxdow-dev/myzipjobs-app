<div align="center">

```
╔╦╗╦ ╦  ╔═╗╦╔═╗     ╦╔═╗╔╗ ╔═╗
║║║╚╦╝  ╔═╝║╠═╝     ║║ ║╠╩╗╚═╗
╩ ╩ ╩   ╚═╝╩╩   ╚═╝╚═╝╚═╝╚═╝
```

# myZipJobs

**Swipe. Match. Work. — Built for Bharat's backbone.**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101?style=flat-square&logo=socket.io)](https://socket.io)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express)](https://expressjs.com)
[![License](https://img.shields.io/badge/License-MIT-F2661D?style=flat-square)](LICENSE)

<br/>

> *450 million workers. Zero digital presence. One platform to change that.*

<br/>

[🚀 Get Started](#-getting-started) · [📖 How It Works](#-how-matching-works) · [🔌 API Docs](#-api-reference) · [🗺️ Roadmap](#-roadmap)

</div>

---

## 📌 Table of Contents

- [The Problem](#-the-problem)
- [Our Solution](#-our-solution)
- [Key Features](#-key-features)
- [Two Ways to Connect](#-two-ways-to-connect)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [How Matching Works](#-how-matching-works)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Usage](#-usage)
- [API Reference](#-api-reference)
- [Testing the Backend](#-testing-the-backend)
- [Demo Scenarios](#-demo-scenarios)
- [Roadmap](#-roadmap)

---

## 🔥 The Problem

India's unorganized workforce is the backbone of every city — yet hiring them still happens through torn notices on walls, middlemen, and WhatsApp forwards from 2015.

```
A cook in Banjara Hills has no way to tell employers 500m away she's available.
A family in Jubilee Hills has no way to find a trusted driver before Monday.
They're 10 minutes apart. They never meet.
```

Here's why existing platforms fail them:

| Platform | Why it doesn't work |
|---|---|
| 🔵 LinkedIn | English-first, resume-required, corporate |
| 🟡 Naukri | Formal jobs only, no daily wage support |
| 🟠 Urban Company | Premium pricing, app-fluency required |
| 📱 WhatsApp | No discovery, no trust, no structure |

> **The problem isn't a shortage of workers or employers — it's that they have no efficient way to find each other.**

myZipJobs fixes this with a swipe-based, preference-matched, real-time platform built specifically for India's unorganized sector.

---

## 💡 Our Solution

A two-sided mobile-first platform where:

- **Workers** build a simple profile in minutes (no resume needed) and discover nearby employers
- **Employers** post what they need and browse pre-matched workers in their area
- **Both sides** connect through swipes, direct requests, and real-time chat — all in one app

```
Worker opens app → sees ranked employer cards → swipes right → match → chat → hired
Employer opens app → sees ranked worker cards → swipes right → match → chat → hired
```

The matching engine scores every candidate across **5 dimensions** — location, job category, salary range, time availability, and gender preference — so the best fits always appear first.

---

## ✨ Key Features

### 🎯 Smart Matching & Discovery
- **Preference-based recommendation engine** — 5-dimension scoring system ranks profiles before they're shown. Best fits appear first, always.
- **Drag-gesture swipe UI** — Built with `react-swipeable` + Framer Motion. Drag right to match, left to pass. Visual overlay confirms the action mid-swipe.
- **City expansion fallback** — If no profiles found nearby, automatically expands search to the whole city with a banner telling the user why.
- **Undo last swipe** — Accidentally passed on someone? One tap brings them back.
- **Already-swiped filtering** — The engine never shows the same profile twice in the same session.

### 🤝 Two Ways to Connect
- **Mutual Swipe** — Both swipe right → instant match → chat opens
- **Direct Request** — Send a job request to anyone you've seen → they accept → match created

### 📱 Registration & Onboarding
- **OTP-based phone auth** — No email, no password. Phone number is identity.
- **Role-split onboarding** — Worker and employer flows collect different fields from one shared `/register` route
- **Salary range slider** — Dual-thumb ₹1,000 — ₹80,000/month slider, used directly in match scoring
- **Preferences page** — Change job category, location, salary, availability anytime. Changing preferences automatically refreshes the profile pool.

### ⚡ Real-Time Everything
- **Instant match events** — Socket.io fires a `matched` event to BOTH users simultaneously the moment a mutual match is detected — zero polling
- **Live messaging** — Chat rooms via Socket.io. Messages appear on both screens without refresh
- **Request notifications** — Real-time toast when someone sends you a job request
- **Unread badges** — Bottom nav badges update live as messages and requests arrive

### 🎨 Design System
- **Mobile-first** — Designed at 375px. Every tap target is minimum 52px. No pinching, no squinting.
- **Warm color palette** — Orange `#F2661D` primary, Teal `#0F766E` secondary, Warm White `#FFF8F0` background. Never pure black or pure white.
- **Icon-first UI** — `lucide-react` throughout. Readable with low text literacy.
- **Framer Motion** — Card swipe animations, match overlay spring entrance, smooth page transitions.

---

## 🔀 Two Ways to Connect

```
┌─────────────────────────────────────────────────────────────┐
│                    WAY 1 — Mutual Swipe                      │
│                                                              │
│   Worker swipes ❤️  +  Employer swipes ❤️                   │
│              ↓                                               │
│         AUTO MATCH → Match overlay fires on both screens    │
│              ↓                                               │
│         Chat opens immediately ✅                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  WAY 2 — Direct Request                      │
│                                                              │
│   Worker taps 📨 Request on employer card                   │
│              ↓                                               │
│   Employer sees request in Requests tab                     │
│   (with full profile + optional message)                    │
│              ↓                                               │
│   Employer taps ✓ Accept → Match created                    │
│   OR taps ✕ Decline → Request disappears                    │
│              ↓                                               │
│   Chat opens for accepted matches ✅                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      React Frontend                          │
│                                                              │
│  Landing Page  →  Register / Login  →  Dashboard            │
│  Discover (Swipe UI)  →  Matches  →  Requests  →  Chat      │
│  Preferences  →  Profile                                     │
│                                                              │
│  State: AuthContext + localStorage                           │
│  Real-time: socket.io-client                                 │
└────────────────────────┬────────────────────────────────────┘
                         │
              REST API (fetch) + Socket.io
                         │
┌────────────────────────▼────────────────────────────────────┐
│                     Express Backend                          │
│                                                              │
│  /api/users      → register, login, update profile          │
│  /api/recommend  → scored + ranked profile feed             │
│  /api/swipe      → record pass/connect, detect mutual match │
│  /api/requests   → send, respond, incoming, outgoing        │
│  /api/matches    → fetch all matches for a user             │
│  /api/messages   → chat history, send message, convos       │
│  /api/stats      → dashboard counters                       │
│  /api/seed       → dev-only profile seeder                  │
│                                                              │
│  Socket.io events:                                           │
│  register · joinRoom · leaveRoom                            │
│  matched · newRequest · requestAccepted · requestRejected   │
│  newMessage                                                  │
└────────────────────────┬────────────────────────────────────┘
                         │ Mongoose ODM
┌────────────────────────▼────────────────────────────────────┐
│                   MongoDB Atlas                              │
│                                                              │
│  users  ·  swipes  ·  matches  ·  requests  ·  messages     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Frontend** | React 19 + Vite | Fast dev + modern React features |
| **Styling** | Tailwind CSS | Custom design tokens, mobile-first |
| **Animations** | Framer Motion | Swipe gestures, overlays, transitions |
| **Swipe** | react-swipeable | Touch + mouse drag support |
| **Icons** | lucide-react | Clean, consistent, lightweight |
| **Fonts** | Baloo 2 + Inter | Warm headings, readable body |
| **Backend** | Node.js + Express 5 | Async-first REST API |
| **Database** | MongoDB Atlas + Mongoose | Flexible schema, free tier |
| **Real-Time** | Socket.io 4.x | Bidirectional match + chat events |
| **Routing** | React Router v6 | Nested routes, protected routes |
| **State** | React Context | Global auth, no Redux needed |

---

## 🔬 How Matching Works

Every time a user opens the Discover page, the recommendation engine runs a full scoring pipeline:

```
Step 1 — Load user profile
         role, location, category, wages, time, gender

Step 2 — Exclude already-swiped profiles
         Query Swipe collection: swipedBy = userId

Step 3 — Query opposite-role profiles
         Same city (case-insensitive regex match)
         Not in already-swiped list

Step 4 — Score every candidate

Step 5 — Sort by score descending

Step 6 — Return top 20 profiles to frontend

Step 7 — If 0 results → expand search citywide
         Return with expanded: true flag
         Frontend shows "Showing profiles from other cities" banner
```

### 📊 Scoring Breakdown

| Dimension | Condition | Points |
|---|---|---|
| 📍 Location | Same neighbourhood / area | **+40** |
| 📍 Location | Same city only | **+20** |
| 💼 Category | Exact job type match | **+30** |
| 🕐 Availability | Same time preference | **+15** |
| 💰 Salary | Ranges overlap at all | **+10** |
| 💰 Salary | Overlap exceeds ₹5,000 | **+5** bonus |
| 👤 Gender | Employer preference matches | **+5** |
| ✅ Verified | Profile is verified | **+5** |

> **Max possible score: 110 points**

### 🔁 Mutual Match Detection

```javascript
// Worker swipes Connect on Employer
POST /api/swipe { swipedBy: workerID, swipedOn: employerID, action: "connect" }
→ Swipe saved
→ Check: did employerID already swipe "connect" on workerID?
→ NO  → return { matched: false }
→ YES → create Match document
        emit "matched" to BOTH socket IDs
        return { matched: true, matchedProfile }
```

### 🔄 Preference Reset Logic

```javascript
// When user updates preferences in PUT /api/users/:userId
const preferencesChanged = checkIfChanged([
  'category', 'time', 'gender', 'location.area', 
  'location.city', 'wages.min', 'wages.max'
]);

if (preferencesChanged) {
  await Swipe.deleteMany({ swipedBy: userId });
  // User gets a completely fresh profile pool
}
```

---

## 📁 Project Structure

```
myzipjobs/
│
├── server/                          # Express + Socket.io backend
│   ├── models/
│   │   ├── User.js                  # Worker/employer schema with wages, time, gender
│   │   ├── Swipe.js                 # Pass/connect records (compound unique index)
│   │   ├── Match.js                 # Mutual match documents
│   │   ├── Request.js               # Direct job requests between users
│   │   └── Message.js               # Chat messages (indexed by matchId)
│   │
│   ├── routes/
│   │   ├── users.js                 # register, login, update, get profile
│   │   ├── recommend.js             # Scoring engine + city expansion fallback
│   │   ├── swipe.js                 # Record swipe, undo, reset, passed profiles
│   │   ├── requests.js              # Send, respond, incoming, outgoing requests
│   │   ├── matches.js               # Fetch matches with matchId
│   │   ├── messages.js              # Chat history, send, conversations list
│   │   ├── stats.js                 # Dashboard counters (matches, unread, rate)
│   │   └── seed.js                  # Dev-only: seeds 20 realistic Hyderabad profiles
│   │
│   └── index.js                     # Express app + Socket.io + userSocketMap
│
├── src/                             # React frontend
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.jsx           # primary / secondary / outline variants
│   │   │   └── Toast.jsx            # Real-time toast notifications
│   │   ├── layout/
│   │   │   ├── Header.jsx           # Landing page nav
│   │   │   ├── MobileMenu.jsx       # Hamburger menu
│   │   │   └── DashboardLayout.jsx  # Top bar + 4-tab bottom nav + badges
│   │   └── swipe/
│   │       ├── SwipeCard.jsx        # Profile card (Pass / Request / Match buttons)
│   │       ├── SwipeStack.jsx       # Gesture stack + undo + empty state
│   │       └── MatchOverlay.jsx     # "It's a Match!" spring animation popup
│   │
│   ├── context/
│   │   └── AuthContext.jsx          # Global user state + localStorage persistence
│   │
│   ├── pages/
│   │   ├── Landing.jsx              # Hero + floating emoji + stats bar
│   │   ├── Register.jsx             # 3-step flow: role → phone → OTP → profile
│   │   ├── Login.jsx                # Phone → OTP → dashboard redirect by role
│   │   └── dashboard/
│   │       ├── WorkerDashboard.jsx  # Stats grid + recent matches + quick actions
│   │       ├── EmployerDashboard.jsx
│   │       ├── DiscoverPage.jsx     # Swipe stack (separated from dashboard)
│   │       ├── MatchesPage.jsx      # 4 tabs: Requests / Sent / Matches / Passed
│   │       ├── ConversationsPage.jsx
│   │       ├── ChatPage.jsx         # Real-time chat + quick reply chips
│   │       ├── PreferencesPage.jsx  # Edit preferences + manual swipe reset
│   │       ├── WorkerProfilePage.jsx
│   │       ├── WorkerProfileEditPage.jsx
│   │       ├── EmployerProfilePage.jsx
│   │       └── EmployerProfileEditPage.jsx
│   │
│   └── services/
│       ├── api.js                   # All fetch functions (15+ endpoints)
│       └── socket.js                # Socket.io client singleton
│
├── .env                             # VITE_API_URL
├── server/.env                      # MONGODB_URI, PORT, NODE_ENV, CLIENT_URL
├── package.json                     # Scripts: dev, dev:server, build
└── tailwind.config.js               # Custom color tokens
```

---

## 🚀 Getting Started

### Prerequisites

```
Node.js 18+
npm
MongoDB Atlas account (free tier is enough)
```

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/myzipjobs.git
cd myzipjobs
```

### 2. Install all dependencies

```bash
npm install
```

### 3. Set up environment variables

**Root `.env`** — frontend config:
```env
VITE_API_URL=http://localhost:5000/api
```

**`server/.env`** — backend config:
```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/myzipjobs
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 4. Start the backend

```bash
# Terminal 1
npm run dev:server
```

You should see:
```
MongoDB connected successfully ✅
Server running on http://localhost:5000
```

### 5. Seed the database

```bash
# Using Postman, Thunder Client, or curl:
POST http://localhost:5000/api/seed

# Expected response:
{ "inserted": 20, "workers": 10, "employers": 10 }
```

### 6. Start the frontend

```bash
# Terminal 2
npm run dev
```

Open `http://localhost:5173` — you're in.

---

## 📱 Usage

### As a Worker

```
1. http://localhost:5173 → click "Find Work"
2. Enter phone number → OTP: 123456 (dev)
3. Fill profile:
   Name · Job category · Location
   Availability · Salary range · Gender · Languages
4. Land on Worker Dashboard
5. Tap Discover → swipe employer cards
6. ❤️ Swipe right = match request
7. 📨 Tap Request = send direct job request
8. Check Matches tab → accept/reject incoming requests
9. Chat with matches in Messages tab
```

### As an Employer

```
1. http://localhost:5173 → click "Hire Someone"
2. Enter phone number → OTP: 123456 (dev)
3. Fill profile:
   Name · Help needed · Location · Required time
   Budget range · Gender preference · Workers needed
4. Land on Employer Dashboard
5. Tap Find → swipe worker cards
6. Same swipe + request flow as workers
7. Requests tab shows workers who requested you
8. Chat with matched workers
```

### Change Preferences Anytime

```
Dashboard → tap ⚙️ icon in top bar → Preferences
Change any field → Save
→ Swipe history resets automatically
→ Fresh profiles load with new criteria
```

---

## 🔌 API Reference

### Users

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/users/register` | Register new user (worker or employer) |
| `POST` | `/api/users/login` | Login with phone number |
| `GET` | `/api/users/:userId` | Get user profile |
| `PUT` | `/api/users/:userId` | Update profile + auto-reset swipes if prefs changed |

### Discovery & Matching

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/recommend/:userId` | Scored + ranked profile feed (city expansion fallback) |
| `POST` | `/api/swipe` | Record pass or connect action |
| `DELETE` | `/api/swipe/undo` | Undo the last pass |
| `DELETE` | `/api/swipe/reset/:userId` | Clear all swipe history |
| `GET` | `/api/swipe/passed/:userId` | Get all passed profiles |

### Requests

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/requests/send` | Send a direct job request |
| `GET` | `/api/requests/incoming/:userId` | Incoming pending requests |
| `GET` | `/api/requests/outgoing/:userId` | Sent requests with status |
| `POST` | `/api/requests/:requestId/respond` | Accept or reject a request |

### Matches & Messages

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/matches/:userId` | All matches with matchId |
| `GET` | `/api/messages/:matchId` | Chat history (marks as read) |
| `POST` | `/api/messages` | Send a message |
| `GET` | `/api/messages/conversations/:userId` | All convos with last message + unread count |

### Dashboard & Utility

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/stats/:userId` | Dashboard counters (matches, unread, rate, requests) |
| `POST` | `/api/seed` | Seed 20 Hyderabad profiles (dev only) |
| `GET` | `/api/health` | Server + DB health check |

### Response Examples

**Mutual match detected:**
```json
{
  "matched": true,
  "matchId": "64f3abc...",
  "matchedProfile": {
    "_id": "64f1...",
    "name": "Priya Sharma",
    "role": "employer",
    "category": "Driver",
    "location": { "area": "Jubilee Hills", "city": "Hyderabad" },
    "wages": { "min": 10000, "max": 20000 }
  }
}
```

**Recommendation engine response:**
```json
{
  "profiles": [
    {
      "name": "Ravi Kumar",
      "category": "Driver",
      "location": { "area": "Banjara Hills", "city": "Hyderabad" },
      "wages": { "min": 8000, "max": 15000 },
      "time": "Full Time",
      "rating": 4.5,
      "verified": true
    }
  ],
  "expanded": false,
  "total": 8
}
```

**Request accepted → match created:**
```json
{
  "accepted": true,
  "matchId": "64f9..."
}
```

---

## 🧪 Testing the Backend

Use **Postman** (desktop app) or **Thunder Client** (VS Code extension).
Run requests in this exact order:

```
Request 1  →  POST /api/seed
              Expected: { inserted: 20 }

Request 2  →  GET  /api/recommend/:workerId
              Expected: array of employer profiles, sorted by score
              Copy one employer _id as EMPLOYER_ID

Request 3  →  POST /api/swipe
              Body: { swipedBy: WORKER_ID, swipedOn: EMPLOYER_ID, action: "connect" }
              Expected: { matched: false }

Request 4  →  POST /api/swipe
              Body: { swipedBy: EMPLOYER_ID, swipedOn: WORKER_ID, action: "connect" }
              Expected: { matched: true, matchId, matchedProfile } ✅

Request 5  →  GET  /api/matches/:workerId
              Expected: employer profile with matchId field

Request 6  →  POST /api/requests/send
              Body: { sentBy: WORKER_ID, sentTo: EMPLOYER_ID, message: "Hi!" }
              Expected: request document saved

Request 7  →  GET  /api/requests/incoming/:employerId
              Expected: worker's request card with full profile

Request 8  →  POST /api/requests/:requestId/respond
              Body: { respondedBy: EMPLOYER_ID, action: "accept" }
              Expected: { accepted: true, matchId }

Request 9  →  POST /api/swipe (duplicate)
              Same body as Request 3
              Expected: 409 Conflict ✅

Request 10 →  GET  /api/recommend/:workerId
              Expected: EMPLOYER_ID no longer in list ✅
```

---

## 🎬 Demo Scenarios

| # | Scenario | How to trigger | What you should see |
|---|---|---|---|
| 1 | **Full worker registration** | Register with phone, fill all fields | Dashboard with real employer cards |
| 2 | **Preference-based ranking** | Register as Driver in Banjara Hills | Driver employers appear before others |
| 3 | **Swipe gesture** | Drag card right past 80px | Green "MATCH" overlay → card flies off → API fires |
| 4 | **Undo swipe** | Pass on someone → tap Undo | Same card returns to top of stack |
| 5 | **Real-time mutual match** | Two windows, both swipe right | Match overlay fires on BOTH screens simultaneously |
| 6 | **Direct request flow** | Tap 📨 on card → send message | Employer gets toast → sees request in Requests tab |
| 7 | **Request accept → match** | Employer accepts request | Match overlay fires, chat unlocks |
| 8 | **Real-time chat** | Message a match | Message appears on other screen without refresh |
| 9 | **City expansion** | Register rare category | "Showing profiles from other cities" banner appears |
| 10 | **Preference reset** | Change location in Preferences | Swipe history clears, fresh profiles load |
| 11 | **Duplicate protection** | Swipe same profile twice | 409 Conflict, no duplicate swipe saved |
| 12 | **Persistent nav** | Navigate to chat, preferences, profile | Bottom nav always visible, always home-accessible |

---

## 🗺️ Roadmap

```
✅ Done
   Phone-based OTP registration and login
   Preference-based swipe matching (5-dimension scoring)
   Mutual match detection via Socket.io
   Direct job request system (two-way matching)
   Real-time messaging with chat history
   Preferences page with auto swipe reset
   Undo last swipe
   City expansion fallback
   Dashboard stats (matches, unread, connect rate)
   Persistent bottom navigation

⏳ In Progress
   Full profile pages (view + edit)
   Ratings and reviews after job completion

🔜 Planned
   Real SMS OTP via MSG91 or Twilio
   Profile photo upload via Cloudinary
   SOS safety feature for workers in distress
   Push notifications (PWA + Firebase)
   Hindi and Telugu language support
   Job status tracking (Requested → Active → Completed)
   Admin verification panel
   Worker portfolio (photos of past work)
   Employer review history
```

---

## 🤝 Contributing

```bash
# Fork the repo, then:
git checkout -b feature/your-feature-name
git commit -m "feat: describe what you built"
git push origin feature/your-feature-name
# Open a pull request
```

---

<div align="center">

**Built in Hyderabad. Built for Hyderabad.**

*myZipJobs — where the city's real workforce finds work.*

`Swipe first. Work smart.` 🧡

---

*Made with care for the 450 million workers who keep India running.*

</div>