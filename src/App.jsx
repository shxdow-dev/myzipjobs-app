import { useContext } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/layout/Header";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import AuthContext from "./context/AuthContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import WorkerDashboard from "./pages/WorkerDashboard";
import EmployerDashboard from "./pages/EmployerDashboard";
import MatchesPage from "./pages/MatchesPage";
import ConversationsPage from "./pages/dashboard/ConversationsPage";
import ChatPage from "./pages/dashboard/ChatPage";
import PreferencesPage from "./pages/dashboard/PreferencesPage";
import DiscoverPage from "./pages/dashboard/DiscoverPage";
import WorkerProfilePage from "./pages/dashboard/WorkerProfilePage";
import ProfileEditPage from "./pages/dashboard/ProfileEditPage";
import ReviewsListPage from "./pages/dashboard/ReviewsListPage";
import MySOSReportsPage from "./pages/dashboard/MySOSReportsPage";

function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  const location = useLocation();
  const hideHeader =
    location.pathname.startsWith("/register") ||
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/dashboard");

  return (
    <div className="min-h-screen bg-warmWhite text-charcoal">
      {!hideHeader && <Header />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard/worker"
          element={
            <ProtectedRoute>
              <DashboardLayout role="worker" />
            </ProtectedRoute>
          }
        >
          <Route index element={<WorkerDashboard />} />
          <Route path="discover" element={<DiscoverPage />} />
          <Route path="matches" element={<MatchesPage />} />
          <Route path="messages" element={<ConversationsPage />} />
          <Route path="messages/:matchId" element={<ChatPage role="worker" />} />
          <Route path="preferences" element={<PreferencesPage />} />
          <Route path="profile" element={<WorkerProfilePage />} />
          <Route path="user/:userId" element={<WorkerProfilePage />} />
          <Route path="profile/edit" element={<ProfileEditPage />} />
          <Route path="user/:userId/reviews" element={<ReviewsListPage />} />
          <Route path="safety/reports" element={<MySOSReportsPage />} />
        </Route>
        <Route
          path="/dashboard/employer"
          element={
            <ProtectedRoute>
              <DashboardLayout role="employer" />
            </ProtectedRoute>
          }
        >
          <Route index element={<EmployerDashboard />} />
          <Route path="discover" element={<DiscoverPage />} />
          <Route path="matches" element={<MatchesPage />} />
          <Route path="messages" element={<ConversationsPage />} />
          <Route path="messages/:matchId" element={<ChatPage role="employer" />} />
          <Route path="preferences" element={<PreferencesPage />} />
          <Route path="profile" element={<WorkerProfilePage />} />
          <Route path="user/:userId" element={<WorkerProfilePage />} />
          <Route path="profile/edit" element={<ProfileEditPage />} />
          <Route path="user/:userId/reviews" element={<ReviewsListPage />} />
          <Route path="safety/reports" element={<MySOSReportsPage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
