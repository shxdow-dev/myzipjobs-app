import { useOutletContext } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import SwipeStack from "../../components/dashboard/SwipeStack";

function ExplorePage() {
  const { user } = useAuth();
  const { setMatchData } = useOutletContext() || {};

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-charcoal">
        {user.role === "worker" ? "Explore Jobs" : "Find Workers"}
      </h1>
      <p className="mt-1 font-body text-sm text-charcoalMuted">
        {user.role === "worker"
          ? "Swipe right to connect with employers near you"
          : "Swipe right to connect with workers near you"}
      </p>
      <div className="mt-6">
        <SwipeStack userRole={user.role} onMatch={setMatchData} />
      </div>
    </div>
  );
}

export default ExplorePage;
