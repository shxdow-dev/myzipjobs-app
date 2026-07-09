import { useEffect, useState } from "react";
import PageMotion from "../../components/common/PageMotion";
import { useAuth } from "../../context/AuthContext";
import { getMySOSReports, resolveSOS } from "../../services/api.js";

const REASON_LABELS = {
  unsafe: "Feeling Unsafe",
  no_show: "No Show",
  harassment: "Harassment",
  suspicious_behavior: "Suspicious Behavior",
  other: "Other",
};

function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function MySOSReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);

  useEffect(() => {
    if (!user?._id) return;

    getMySOSReports(user._id)
      .then((data) => {
        setReports(Array.isArray(data) ? data : []);
      })
      .finally(() => setLoading(false));
  }, [user?._id]);

  const handleResolve = async (alertId) => {
    if (resolvingId) return;

    setResolvingId(alertId);
    try {
      const updated = await resolveSOS(alertId);
      if (updated?._id) {
        setReports((prev) =>
          prev.map((report) =>
            report._id === alertId ? { ...report, ...updated } : report
          )
        );
      }
    } finally {
      setResolvingId(null);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-charcoalMuted">
        Loading reports...
      </div>
    );
  }

  return (
    <PageMotion className="pb-24">
      {reports.length === 0 ? (
        <p className="py-16 text-center font-body text-charcoalMuted">
          No reports yet
        </p>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => {
            const otherName = report.otherUserId?.name;
            const isActive = report.status === "active";

            return (
              <div
                key={report._id}
                className="rounded-xl border border-[#e9ddd1] bg-warmWhite p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-heading text-sm font-bold text-charcoal">
                    {REASON_LABELS[report.reason] || report.reason}
                  </p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      isActive
                        ? "bg-alert/10 text-alert"
                        : "bg-success/10 text-success"
                    }`}
                  >
                    {isActive ? "Active" : "Resolved"}
                  </span>
                </div>

                {otherName && (
                  <p className="mt-1 font-body text-sm text-charcoalMuted">
                    Regarding {otherName}
                  </p>
                )}

                <p className="mt-1 font-body text-xs text-charcoalMuted">
                  {formatDate(report.createdAt)}
                </p>

                {isActive && (
                  <button
                    type="button"
                    disabled={resolvingId === report._id}
                    onClick={() => handleResolve(report._id)}
                    className="mt-3 font-body text-sm text-teal hover:underline disabled:opacity-50"
                  >
                    {resolvingId === report._id
                      ? "Updating..."
                      : "Mark Resolved"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </PageMotion>
  );
}

export default MySOSReportsPage;
