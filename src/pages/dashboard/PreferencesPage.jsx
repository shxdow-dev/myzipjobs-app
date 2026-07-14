import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import PageMotion from "../../components/common/PageMotion";
import Toast from "../../components/common/Toast";
import { useAuth } from "../../context/AuthContext";
import {
  getUser,
  resetSwipeHistory,
  updateUser,
} from "../../services/api.js";

const CATEGORY_OPTIONS = [
  "House Help",
  "Cook",
  "Driver",
  "Electrician",
  "Plumber",
  "Carpenter",
  "Security Guard",
  "Construction Labour",
  "Other",
];

const TIME_OPTIONS = [
  "Full Time",
  "Part Time - Mornings",
  "Part Time - Evenings",
  "Weekends Only",
  "Flexible",
];

const LANGUAGE_OPTIONS = [
  "Telugu",
  "Hindi",
  "English",
  "Urdu",
  "Tamil",
  "Kannada",
];

const WORKER_GENDER_OPTIONS = ["Male", "Female", "Prefer not to say"];
const EMPLOYER_GENDER_OPTIONS = ["Male", "Female", "No Preference"];

function formatSalary(value) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function PillSelect({ label, options, value, onChange }) {
  return (
    <div>
      <p className="mb-2 font-body text-sm text-charcoalMuted dark:text-gray-400">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`rounded-full border px-3 py-2 text-sm transition-colors ${
              value === option
                ? "border-teal bg-tealLight text-teal dark:bg-teal/20"
                : "border-charcoalMuted bg-white text-charcoalMuted dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function MultiPillSelect({ label, options, values, onChange }) {
  const toggle = (option) => {
    if (values.includes(option)) {
      onChange(values.filter((v) => v !== option));
    } else {
      onChange([...values, option]);
    }
  };

  return (
    <div>
      <p className="mb-2 font-body text-sm text-charcoalMuted dark:text-gray-400">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            className={`rounded-full border px-3 py-2 text-sm transition-colors ${
              values.includes(option)
                ? "border-teal bg-tealLight text-teal dark:bg-teal/20"
                : "border-charcoalMuted bg-white text-charcoalMuted dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function PreferencesPage() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [toast, setToast] = useState(null);

  const [category, setCategory] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [time, setTime] = useState("");
  const [salaryRange, setSalaryRange] = useState([5000, 20000]);
  const [gender, setGender] = useState("");
  const [languages, setLanguages] = useState([]);
  const [about, setAbout] = useState("");
  const [membersRequired, setMembersRequired] = useState("");

  useEffect(() => {
    if (!user?._id) return;

    getUser(user._id)
      .then((profile) => {
        setCategory(profile.category || "");
        setArea(profile.location?.area || "");
        setCity(profile.location?.city || "");
        setTime(profile.time || "");
        setSalaryRange([
          profile.wages?.min || 5000,
          profile.wages?.max || 20000,
        ]);
        setGender(profile.gender || "");
        setLanguages(profile.languages || []);
        setAbout(profile.about || "");
        setMembersRequired(profile.membersRequired || "");
      })
      .catch(() => {
        setCategory(user.category || "");
        setArea(user.location?.area || "");
        setCity(user.location?.city || "");
        setTime(user.time || "");
        setSalaryRange([user.wages?.min || 5000, user.wages?.max || 20000]);
        setGender(user.gender || "");
        setLanguages(user.languages || []);
        setAbout(user.about || "");
        setMembersRequired(user.membersRequired || "");
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleSave = async () => {
    if (!user?._id || saving) return;

    setSaving(true);
    try {
      const payload = {
        category,
        location: { area: area.trim(), city: city.trim() },
        time,
        wages: { min: salaryRange[0], max: salaryRange[1] },
        gender,
        languages,
        about: about.trim(),
        ...(user.role === "employer" && {
          membersRequired,
          requirement: category
            ? `Looking for a ${category.toLowerCase()}`
            : "",
        }),
      };

      const updated = await updateUser(user._id, payload);
      setUser({ ...user, ...updated });

      const message = updated.swipesReset
        ? "Preferences saved! Your matches have been refreshed ✅"
        : "Preferences saved! ✅";
      setToast({ message, type: "success" });

      setTimeout(() => {
        navigate(`/dashboard/${user.role}`);
      }, 1500);
    } catch (err) {
      setToast({
        message: err.message || "Failed to save preferences",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!user?._id || resetting) return;

    setResetting(true);
    try {
      await resetSwipeHistory(user._id);
      navigate(`/dashboard/${user.role}`);
    } catch {
      setToast({ message: "Failed to reset swipe history", type: "error" });
    } finally {
      setResetting(false);
      setShowResetConfirm(false);
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="py-12 text-center text-charcoalMuted">Loading...</div>
    );
  }

  const isWorker = user.role === "worker";

  return (
    <PageMotion className="mx-auto max-w-lg bg-warmWhite pb-28 dark:bg-gray-900">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          offset={0}
        />
      )}

      <p className="font-body text-sm text-charcoalMuted dark:text-gray-400">
        Update what you&apos;re looking for. Changing preferences will refresh
        your profile pool.
      </p>

      <div className="mt-6 space-y-5">
        <PillSelect
          label={isWorker ? "Job Category" : "Help needed"}
          options={CATEGORY_OPTIONS}
          value={category}
          onChange={setCategory}
        />

        <div>
          <label className="mb-1 block font-body text-sm text-charcoalMuted dark:text-gray-400">
            {isWorker ? "Your Area" : "Area"}
          </label>
          <input
            type="text"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="e.g. Banjara Hills"
            className="h-[52px] w-full rounded-xl border border-charcoalMuted bg-white px-4 font-body text-charcoal outline-none focus:border-teal focus:ring-1 focus:ring-teal dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div>
          <label className="mb-1 block font-body text-sm text-charcoalMuted dark:text-gray-400">
            City
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Hyderabad"
            className="h-[52px] w-full rounded-xl border border-charcoalMuted bg-white px-4 font-body text-charcoal outline-none focus:border-teal focus:ring-1 focus:ring-teal dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <PillSelect
          label={isWorker ? "Availability" : "Required time"}
          options={TIME_OPTIONS}
          value={time}
          onChange={setTime}
        />

        <div>
          <p className="mb-2 font-body text-sm text-charcoalMuted dark:text-gray-400">
            {isWorker ? "Expected Salary Range" : "Budget Range"}
          </p>
          <p className="mb-4 text-center font-heading text-lg text-orange">
            {formatSalary(salaryRange[0])} — {formatSalary(salaryRange[1])}/mo
          </p>
          <div className="relative h-6 w-full">
            <div className="absolute top-2 h-2 w-full rounded-full bg-orangeLight" />
            <div
              className="absolute top-2 h-2 rounded-full bg-orange"
              style={{
                left: `${((salaryRange[0] - 1000) / 79000) * 100}%`,
                right: `${100 - ((salaryRange[1] - 1000) / 79000) * 100}%`,
              }}
            />
            <input
              type="range"
              min={1000}
              max={80000}
              step={1000}
              value={salaryRange[0]}
              onChange={(e) => {
                const val = Math.min(
                  Number(e.target.value),
                  salaryRange[1] - 1000
                );
                setSalaryRange([val, salaryRange[1]]);
              }}
              className="pointer-events-auto absolute w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange"
              style={{ zIndex: salaryRange[0] > 70000 ? 5 : 3 }}
            />
            <input
              type="range"
              min={1000}
              max={80000}
              step={1000}
              value={salaryRange[1]}
              onChange={(e) => {
                const val = Math.max(
                  Number(e.target.value),
                  salaryRange[0] + 1000
                );
                setSalaryRange([salaryRange[0], val]);
              }}
              className="pointer-events-auto absolute w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange"
              style={{ zIndex: 4 }}
            />
          </div>
        </div>

        <PillSelect
          label={
            isWorker ? "Gender" : "Gender preference"
          }
          options={
            isWorker ? WORKER_GENDER_OPTIONS : EMPLOYER_GENDER_OPTIONS
          }
          value={gender}
          onChange={setGender}
        />

        {!isWorker && (
          <div>
            <label className="mb-1 block font-body text-sm text-charcoalMuted dark:text-gray-400">
              Workers needed
            </label>
            <div className="relative">
              <select
                value={membersRequired}
                onChange={(e) => setMembersRequired(e.target.value)}
                className="h-[52px] w-full appearance-none rounded-xl border border-charcoalMuted bg-white px-4 font-body text-charcoal focus:border-teal focus:outline-none focus:ring-2 focus:ring-tealLight dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                <option value="" disabled>
                  Select number of workers
                </option>
                <option value="1">1 Person</option>
                <option value="2-3">2-3 People</option>
                <option value="4-5">4-5 People</option>
                <option value="5+">5+ People</option>
                <option value="10+">10+ People</option>
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-charcoalMuted">
                ▼
              </div>
            </div>
          </div>
        )}

        <MultiPillSelect
          label="Languages"
          options={LANGUAGE_OPTIONS}
          values={languages}
          onChange={setLanguages}
        />

        <div>
          <label className="mb-1 block font-body text-sm text-charcoalMuted dark:text-gray-400">
            About
          </label>
          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            rows={4}
            placeholder={
              isWorker
                ? "Tell employers about yourself"
                : "Describe the help you need"
            }
            className="w-full rounded-xl border border-charcoalMuted bg-white px-4 py-3 font-body text-charcoal outline-none focus:border-teal focus:ring-1 focus:ring-teal dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      <div className="mb-4 mt-8 rounded-xl border border-dashed border-charcoalMuted p-4 dark:border-gray-600">
        <p className="font-heading text-sm font-bold text-charcoal dark:text-white">
          Start Fresh
        </p>
        <p className="mt-1 font-body text-sm text-charcoalMuted dark:text-gray-400">
          Reset your swipe history to see all profiles again
        </p>

        {!showResetConfirm ? (
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="mt-3 flex items-center gap-2 rounded-xl border border-alert px-4 py-2 font-body text-sm text-alert transition hover:bg-alert/5"
          >
            <RefreshCw className="h-4 w-4" />
            Reset Swipe History
          </button>
        ) : (
          <div className="mt-3">
            <p className="font-body text-sm text-charcoalMuted">
              This will show you all profiles again. Are you sure?
            </p>
            <div className="mt-3 flex gap-3">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="flex h-12 flex-1 items-center justify-center rounded-xl border border-orange font-heading font-medium text-orange transition-colors hover:bg-orange hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={resetting}
                onClick={handleReset}
                className="flex h-12 flex-1 items-center justify-center rounded-xl border border-orange font-heading font-medium text-orange transition-colors hover:bg-orange hover:text-white disabled:opacity-50"
              >
                Yes, Reset
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-16 left-0 right-0 border-t border-[#e9ddd1] bg-warmWhite p-4 dark:border-gray-700 dark:bg-gray-900">
        <div className="mx-auto max-w-lg">
          <Button
            className="w-full disabled:cursor-not-allowed disabled:opacity-50"
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </div>
    </PageMotion>
  );
}

export default PreferencesPage;
