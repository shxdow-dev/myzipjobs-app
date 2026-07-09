import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import PageMotion from "../../components/common/PageMotion";
import Toast from "../../components/common/Toast";
import { useAuth } from "../../context/AuthContext";
import { getUser, updateUser } from "../../services/api.js";

function ProfileEditPage() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [about, setAbout] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!user?._id) return;
    getUser(user._id)
      .then((data) => setAbout(data.about || ""))
      .catch(() => setAbout(user.about || ""))
      .finally(() => setLoading(false));
  }, [user]);

  const handleSave = async () => {
    if (!user?._id || saving) return;
    setSaving(true);
    try {
      const updated = await updateUser(user._id, { about: about.trim() });
      setUser({ ...user, ...updated });
      setToast({ message: "Profile updated! ✅", type: "success" });
      setTimeout(() => navigate(`/dashboard/${user.role}/profile`), 1200);
    } catch (err) {
      setToast({
        message: err.message || "Failed to save profile",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-charcoalMuted">Loading...</div>
    );
  }

  return (
    <PageMotion className="mx-auto max-w-lg pb-28">
      {toast && <Toast message={toast.message} type={toast.type} />}
      <p className="font-body text-sm text-charcoalMuted">
        Tell others a bit about yourself to get more matches.
      </p>
      <textarea
        value={about}
        onChange={(e) => setAbout(e.target.value)}
        rows={6}
        placeholder="Tell employers about yourself..."
        className="mt-4 w-full rounded-xl border border-charcoalMuted bg-warmWhite px-4 py-3 font-body text-charcoal outline-none focus:border-teal focus:ring-1 focus:ring-teal"
      />
      <div className="fixed bottom-16 left-0 right-0 border-t border-[#e9ddd1] bg-warmWhite p-4">
        <div className="mx-auto max-w-lg">
          <Button className="w-full" disabled={saving} onClick={handleSave}>
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </div>
    </PageMotion>
  );
}

export default ProfileEditPage;
