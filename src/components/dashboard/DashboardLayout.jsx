import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Heart, LogOut, Search } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import socket from "../../services/socket";
import Logo from "../common/Logo";
import MatchOverlay from "./MatchOverlay";

function DashboardLayout({ role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [matchData, setMatchData] = useState(null);

  const basePath = `/dashboard/${role}`;

  useEffect(() => {
    if (!user) {
      navigate("/register");
      return;
    }

    if (user.role !== role) {
      navigate(`/dashboard/${user.role}`);
    }
  }, [user, role, navigate]);

  useEffect(() => {
    if (!user?._id) return;

    socket.emit("register", user._id);

    const handleMatched = (data) => {
      setMatchData(data);
    };

    socket.on("matched", handleMatched);

    return () => {
      socket.off("matched", handleMatched);
    };
  }, [user?._id]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen flex-col bg-warmWhite">
      <header className="border-b border-[#e9ddd1] bg-warmWhite">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Logo />
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 font-body text-sm text-charcoalMuted transition-colors hover:bg-orangeLight hover:text-charcoal"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet context={{ matchData, setMatchData }} />
      </main>

      <nav className="sticky bottom-0 border-t border-[#e9ddd1] bg-warmWhite">
        <div className="mx-auto flex max-w-md">
          <NavLink
            to={basePath}
            end
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-3 font-body text-xs transition-colors ${
                isActive ? "text-orange" : "text-charcoalMuted"
              }`
            }
          >
            <Search size={22} />
            Discover
          </NavLink>
          <NavLink
            to={`${basePath}/matches`}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-3 font-body text-xs transition-colors ${
                isActive ? "text-orange" : "text-charcoalMuted"
              }`
            }
          >
            <Heart size={22} />
            Matches
          </NavLink>
        </div>
      </nav>

      {matchData && (
        <MatchOverlay
          matchData={matchData}
          onClose={() => setMatchData(null)}
        />
      )}
    </div>
  );
}

export default DashboardLayout;
