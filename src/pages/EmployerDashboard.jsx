import { useOutletContext } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SwipeStack from "../components/dashboard/SwipeStack";

function EmployerDashboard() {
  const { user } = useAuth();
  const { setMatchData } = useOutletContext();

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-charcoal">
        Good morning, {user.name} 👋
      </h1>
      <p className="mt-1 font-body text-sm text-charcoalMuted">
        Swipe right to connect with workers near you
      </p>

      <div className="mt-6">
        <SwipeStack
          userRole={user.role}
          onMatch={setMatchData}
        />
      </div>
    </div>
  );
}

export default EmployerDashboard;
