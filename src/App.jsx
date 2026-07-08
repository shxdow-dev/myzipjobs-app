import { Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/layout/Header";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import Landing from "./pages/Landing";
import Register from "./pages/Register";
import WorkerDashboard from "./pages/WorkerDashboard";
import EmployerDashboard from "./pages/EmployerDashboard";
import MatchesPage from "./pages/MatchesPage";
import ConversationsPage from "./pages/dashboard/ConversationsPage";
import ChatPage from "./pages/dashboard/ChatPage";

function LoginPlaceholder() {
  return (
    <main className="px-4 py-10">
      <p className="mx-auto max-w-3xl text-center font-body text-xl text-charcoal">
        Login page coming in the next step
      </p>
    </main>
  );
}

function App() {
  const location = useLocation();
  const hideHeader =
    location.pathname.startsWith("/register") ||
    location.pathname.startsWith("/dashboard");

  return (
    <div className="min-h-screen bg-warmWhite text-charcoal">
      {!hideHeader && <Header />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<LoginPlaceholder />} />
        <Route path="/dashboard/worker" element={<DashboardLayout role="worker" />}>
          <Route index element={<WorkerDashboard />} />
          <Route path="matches" element={<MatchesPage />} />
          <Route path="messages" element={<ConversationsPage />} />
        </Route>
        <Route
          path="/dashboard/worker/messages/:matchId"
          element={<ChatPage role="worker" />}
        />
        <Route
          path="/dashboard/employer"
          element={<DashboardLayout role="employer" />}
        >
          <Route index element={<EmployerDashboard />} />
          <Route path="matches" element={<MatchesPage />} />
          <Route path="messages" element={<ConversationsPage />} />
        </Route>
        <Route
          path="/dashboard/employer/messages/:matchId"
          element={<ChatPage role="employer" />}
        />
      </Routes>
    </div>
  );
}

export default App;
