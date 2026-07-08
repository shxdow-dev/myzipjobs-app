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

export const recordSwipe = async (swipedBy, swipedOn, action) => {
  const res = await fetch(`${BASE}/swipe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ swipedBy, swipedOn, action }),
  });
  return res.json();
};

export const getMatches = async (userId) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/matches/${userId}`
  );
  return res.json();
};

export const getMessages = async (matchId, userId) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/messages/${matchId}?userId=${userId}`
  );
  return res.json();
};

export const sendMessage = async (matchId, senderId, receiverId, text) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ matchId, senderId, receiverId, text }),
  });
  return res.json();
};

export const getConversations = async (userId) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/messages/conversations/${userId}`
  );
  return res.json();
};
