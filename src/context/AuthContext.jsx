import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

function toStoredUser(user) {
  if (!user) return null;
  return {
    _id: user._id,
    name: user.name,
    role: user.role,
    category: user.category,
    location: user.location,
    wages: user.wages,
    time: user.time,
    gender: user.gender,
    languages: user.languages || [],
    about: user.about || "",
    membersRequired: user.membersRequired || "",
  };
}

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const setUser = (userData) => {
    const slim = toStoredUser(userData);
    setUserState(slim);
    if (slim) {
      localStorage.setItem("user", JSON.stringify(slim));
    }
  };

  const logout = () => {
    setUserState(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export default AuthContext;
