import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import DashboardHome from "../components/dashboard/DashboardHome";

function WorkerDashboard() {
  const location = useLocation();

  useEffect(() => {
    const isHome =
      location.pathname === "/dashboard/worker" ||
      location.pathname === "/dashboard/worker/";
    if (isHome) {
      window.dispatchEvent(new CustomEvent("refreshDashboardStats"));
    }
  }, [location.pathname]);

  return <DashboardHome role="worker" />;
}

export default WorkerDashboard;
