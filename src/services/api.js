const BASE = import.meta.env.VITE_API_URL;

export const registerUser = (data) =>
  fetch(`${BASE}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(async (r) => {
    const body = await r.json();
    if (!r.ok) {
      throw new Error(body.message || "Registration failed");
    }
    return body;
  });

export const getRecommendations = (userId) =>
  fetch(`${BASE}/recommend/${userId}`).then((r) => r.json());

export const recordSwipe = (swipedBy, swipedOn, action) =>
  fetch(`${BASE}/swipe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ swipedBy, swipedOn, action }),
  }).then((r) => r.json());

export const getMatches = (userId) =>
  fetch(`${BASE}/matches/${userId}`).then((r) => r.json());
