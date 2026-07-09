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

export const sendJobRequest = async (sentBy, sentTo, message) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/requests/send`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sentBy, sentTo, message }),
    }
  );
  const data = await res.json();
  if (!res.ok) {
    return { error: true, message: data.message };
  }
  return data;
};

export const respondToRequest = async (requestId, respondedBy, action) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/requests/${requestId}/respond`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ respondedBy, action }),
    }
  );
  const data = await res.json();
  if (!res.ok) {
    return { error: true, message: data.message };
  }
  return data;
};

export const getIncomingRequests = async (userId) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/requests/incoming/${userId}`
  );
  return res.json();
};

export const getOutgoingRequests = async (userId) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/requests/outgoing/${userId}`
  );
  return res.json();
};

export const getDashboardStats = async (userId) => {
  const res = await fetch(`${BASE}/stats/${userId}`);
  return res.json();
};

export const getUser = async (userId) => {
  const res = await fetch(`${BASE}/users/${userId}`);
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "Failed to load user");
  }
  return res.json();
};

export const updateUser = async (userId, data) => {
  const res = await fetch(`${BASE}/users/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.message || "Failed to update preferences");
  }
  return body;
};

export const undoSwipe = async (swipedBy, swipedOn) => {
  const res = await fetch(`${BASE}/swipe/undo`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ swipedBy, swipedOn }),
  });
  return res.json();
};

export const resetSwipeHistory = async (userId) => {
  const res = await fetch(`${BASE}/swipe/reset/${userId}`, {
    method: "DELETE",
  });
  return res.json();
};

export const submitRating = async (data) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/ratings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) {
    return { error: true, message: body.message };
  }
  return body;
};

export const getUserRatings = async (userId) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/ratings/user/${userId}`
  );
  return res.json();
};

export const checkAlreadyRated = async (matchId, userId) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/ratings/match/${matchId}/${userId}`
  );
  return res.json();
};

export const triggerSOS = async (data) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/sos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getMySOSReports = async (userId) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/sos/user/${userId}`
  );
  return res.json();
};

export const resolveSOS = async (alertId) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/sos/${alertId}/resolve`,
    { method: "PUT" }
  );
  return res.json();
};
