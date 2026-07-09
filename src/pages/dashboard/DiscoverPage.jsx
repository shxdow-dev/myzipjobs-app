import { useOutletContext } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PageMotion from "../../components/common/PageMotion";
import SwipeStack from "../../components/dashboard/SwipeStack";

function DiscoverPage() {
  const { user } = useAuth();
  const { setMatchData } = useOutletContext() || {};
  const isWorker = user.role === "worker";

  return (
    <PageMotion className="pb-24">
      <p className="font-body text-sm text-charcoalMuted">
        {isWorker
          ? "Swipe to connect with employers near you"
          : "Swipe to connect with workers near you"}
      </p>
      <div className="mt-6">
        <SwipeStack userRole={user.role} onMatch={setMatchData} />
      </div>
    </PageMotion>
  );
}

export default DiscoverPage;
