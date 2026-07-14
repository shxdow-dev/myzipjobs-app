import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import DashboardHome from "../components/dashboard/DashboardHome";

function EmployerDashboard() {
  const location = useLocation();

  useEffect(() => {
    const isHome =
      location.pathname === "/dashboard/employer" ||
      location.pathname === "/dashboard/employer/";
    if (isHome) {
      window.dispatchEvent(new CustomEvent("refreshDashboardStats"));
    }
  }, [location.pathname]);

  return <DashboardHome role="employer" />;
}

export default EmployerDashboard;
