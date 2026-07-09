import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Compass, Heart, LayoutDashboard, LogOut, MapPin, MessageCircle, SlidersHorizontal, User } from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getDashboardStats } from "../../services/api.js";
import socket from "../../services/socket";
import Logo from "../common/Logo";
import Toast from "../common/Toast";
import MatchOverlay from "./MatchOverlay";
import SOSModal from "../safety/SOSModal";

function getPageInfo(pathname, basePath, role) {
  const isChat = /\/messages\/[^/]+$/.test(pathname);
  if (isChat) return { title: null, showBack: false, isChat: true, isHome: false };

  if (pathname.includes("/profile/edit")) {
    return { title: "Edit Profile", showBack: true, isChat: false, isHome: false };
  }
  if (pathname.includes("/reviews")) {
    return { title: "Reviews", showBack: true, isChat: false, isHome: false };
  }
  if (pathname.includes("/profile")) {
    return { title: "My Profile", showBack: true, isChat: false, isHome: false };
  }
  if (pathname.includes("/preferences")) {
    return { title: "Preferences", showBack: true, isChat: false, isHome: false };
  }
  if (pathname.includes("/safety/reports")) {
    return { title: "My Reports", showBack: true, isChat: false, isHome: false };
  }
  if (pathname === basePath || pathname === `${basePath}/`) {
    return { title: null, showBack: false, isChat: false, isHome: true };
  }
  if (pathname.includes("/discover")) {
    return {
      title: role === "worker" ? "Discover" : "Find Workers",
      showBack: false,
      isChat: false,
      isHome: false,
    };
  }
  if (pathname.includes("/matches")) {
    return { title: "Matches", showBack: false, isChat: false, isHome: false };
  }
  if (pathname.endsWith("/messages")) {
    return { title: "Messages", showBack: false, isChat: false, isHome: false };
  }

  return { title: null, showBack: false, isChat: false, isHome: false };
}

function DashboardLayout({ role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const [matchData, setMatchData] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [requestCount, setRequestCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSOSModal, setShowSOSModal] = useState(false);

  const basePath = `/dashboard/${role}`;
  const pageInfo = getPageInfo(location.pathname, basePath, role);

  const showToast = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const refreshStats = useCallback(() => {
    if (!user?._id) return;
    getDashboardStats(user._id).then((data) => {
      setUnreadCount(data.unreadMessages || 0);
      setRequestCount(data.incomingRequests || 0);
    });
  }, [user?._id]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== role) {
      navigate(`/dashboard/${user.role}`);
    }
  }, [user, role, navigate]);

  useEffect(() => {
    refreshStats();
  }, [refreshStats, location.pathname]);

  useEffect(() => {
    if (!showProfileMenu) return;
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showProfileMenu]);

  useEffect(() => {
    if (!user?._id) return;

    socket.emit("register", user._id);

    const handleMatched = (data) => setMatchData(data);
    const handleNewRequest = (data) => {
      showToast(`${data.from.name} sent you a request!`, "info");
      setRequestCount((prev) => prev + 1);
    };
    const handleRequestAccepted = (data) => {
      const name = data.matchedProfile?.name || "They";
      showToast(`${name} accepted your request! You can now message them 🎉`, "success");
      setMatchData({ matchedProfile: data.matchedProfile, matchId: data.matchId });
      refreshStats();
    };
    const handleRequestRejected = (data) => {
      showToast(`${data.by} declined your request.`, "error");
    };
    const handleNewMessage = () => setUnreadCount((prev) => prev + 1);

    socket.on("matched", handleMatched);
    socket.on("newRequest", handleNewRequest);
    socket.on("requestAccepted", handleRequestAccepted);
    socket.on("requestRejected", handleRequestRejected);
    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("matched", handleMatched);
      socket.off("newRequest", handleNewRequest);
      socket.off("requestAccepted", handleRequestAccepted);
      socket.off("requestRejected", handleRequestRejected);
      socket.off("newMessage", handleNewMessage);
    };
  }, [user?._id, showToast, refreshStats]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleBack = () => {
    if (pageInfo.title === "Reviews") {
      navigate(-1);
      return;
    }
    if (pageInfo.title === "Preferences" || pageInfo.title === "My Profile") {
      navigate(basePath);
      return;
    }
    if (pageInfo.title === "Edit Profile") {
      navigate(`${basePath}/profile`);
      return;
    }
    if (pageInfo.title === "My Reports") {
      navigate(basePath);
      return;
    }
    navigate(-1);
  };

  if (!user) return null;

  const locationLabel = [user.location?.area, user.location?.city].filter(Boolean).join(", ");
  const discoverLabel = role === "worker" ? "Discover" : "Find";
  const isMessagesActive =
    location.pathname.startsWith(`${basePath}/messages`);

  return (
    <div className="flex min-h-screen flex-col bg-warmWhite">
      {toasts.map((t, i) => (
        <Toast key={t.id} message={t.message} type={t.type} offset={i * 60} />
      ))}

      {!pageInfo.isChat && (
        <header className="relative border-b border-[#e9ddd1] bg-warmWhite">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              {pageInfo.showBack && (
                <button type="button" onClick={handleBack} aria-label="Go back" className="rounded-lg p-2 hover:bg-orangeLight">
                  <ArrowLeft className="h-5 w-5 text-charcoal" />
                </button>
              )}
              {pageInfo.title ? (
                <h1 className="truncate font-heading text-lg font-bold text-charcoal">
                  {pageInfo.title}
                </h1>
              ) : pageInfo.isHome ? (
                <Logo />
              ) : (
                <h1 className="truncate font-heading text-lg font-bold text-charcoal">
                  {pageInfo.title || (location.pathname.includes("/discover") ? discoverLabel : "")}
                </h1>
              )}
            </div>

            <div className="flex items-center gap-1">
              {pageInfo.isHome && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowSOSModal(true)}
                    className="mr-1 font-body text-sm text-alert hover:underline"
                  >
                    Safety
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`${basePath}/safety/reports`)}
                    className="mr-1 font-body text-xs text-charcoalMuted hover:text-teal"
                  >
                    My Reports
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => navigate(`${basePath}/preferences`)}
                className="rounded-xl p-2 transition hover:bg-orangeLight"
                title="Change Preferences"
              >
                <SlidersHorizontal className="h-5 w-5 text-charcoalMuted" />
              </button>

              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowProfileMenu((prev) => !prev)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-orangeLight transition hover:brightness-95"
                  title="Profile menu"
                >
                  <User className="h-5 w-5 text-teal" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 top-12 z-50 min-w-[200px] rounded-xl bg-warmWhite p-4 shadow-lg">
                    <p className="font-heading font-bold text-charcoal">{user.name}</p>
                    <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs ${user.role === "employer" ? "bg-orangeLight text-orange" : "bg-tealLight text-teal"}`}>
                      {user.role === "employer" ? "Employer" : "Worker"}
                    </span>
                    {user.category && <p className="mt-2 font-body text-sm text-charcoalMuted">{user.category}</p>}
                    {locationLabel && (
                      <p className="mt-1 flex items-center gap-1 font-body text-xs text-charcoalMuted">
                        <MapPin size={12} className="text-teal" />
                        {locationLabel}
                      </p>
                    )}
                    <hr className="my-3 border-[#e9ddd1]" />
                    <button type="button" onClick={() => { setShowProfileMenu(false); navigate(`${basePath}/profile`); }} className="block w-full py-1.5 text-left font-body text-sm text-charcoal hover:text-teal">
                      View Profile
                    </button>
                    <button type="button" onClick={() => { setShowProfileMenu(false); navigate(`${basePath}/preferences`); }} className="block w-full py-1.5 text-left font-body text-sm text-charcoal hover:text-teal">
                      Edit Preferences
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate(`${basePath}/user/${user._id}/reviews`);
                      }}
                      className="block w-full py-1.5 text-left font-body text-sm text-charcoal hover:text-orange"
                    >
                      Reviews
                    </button>
                    <hr className="my-3 border-[#e9ddd1]" />
                    <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2 py-1.5 font-body text-sm text-alert">
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
      )}

      <main className={`mx-auto flex w-full max-w-6xl flex-1 flex-col ${pageInfo.isChat ? "min-h-0 px-0 py-0" : "px-4 py-6"}`}>
        <Outlet
          context={{
            matchData,
            setMatchData,
            showToast,
            refreshRequestCount: refreshStats,
            refreshUnreadCount: refreshStats,
          }}
        />
      </main>

      <nav className="sticky bottom-0 z-40 border-t border-[#e9ddd1] bg-warmWhite">
        <div className="mx-auto flex max-w-md">
          <NavLink
            to={basePath}
            end
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-3 font-body text-xs transition-colors ${isActive ? "text-orange" : "text-charcoalMuted"}`
            }
          >
            <LayoutDashboard size={22} />
            Home
          </NavLink>
          <NavLink
            to={`${basePath}/discover`}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-3 font-body text-xs transition-colors ${isActive ? "text-orange" : "text-charcoalMuted"}`
            }
          >
            <Compass size={22} />
            {discoverLabel}
          </NavLink>
          <NavLink
            to={`${basePath}/matches`}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-3 font-body text-xs transition-colors ${isActive ? "text-orange" : "text-charcoalMuted"}`
            }
          >
            <div className="relative">
              <Heart size={22} />
              {requestCount > 0 && (
                <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange text-[10px] text-white">
                  {requestCount > 9 ? "9+" : requestCount}
                </span>
              )}
            </div>
            Matches
          </NavLink>
          <NavLink
            to={`${basePath}/messages`}
            className={() =>
              `flex flex-1 flex-col items-center gap-1 py-3 font-body text-xs transition-colors ${isMessagesActive ? "text-orange" : "text-charcoalMuted"}`
            }
          >
            <div className="relative">
              <MessageCircle size={22} />
              {unreadCount > 0 && (
                <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-teal text-[10px] text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            Messages
          </NavLink>
        </div>
      </nav>

      {matchData && (
        <MatchOverlay matchData={matchData} onClose={() => setMatchData(null)} />
      )}

      {showSOSModal && (
        <SOSModal onClose={() => setShowSOSModal(false)} />
      )}
    </div>
  );
}

export default DashboardLayout;
