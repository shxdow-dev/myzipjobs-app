import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, User } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Button from "../components/common/Button";
import { useAuth } from "../context/AuthContext";
import { registerUser } from "../services/api";

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

const WORKER_GENDER_OPTIONS = ["Male", "Female", "Prefer not to say"];
const EMPLOYER_GENDER_OPTIONS = ["Male", "Female", "No Preference"];

function formatSalary(value) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function PillSelect({ label, options, value, onChange }) {
  return (
    <div>
      <p className="mb-2 font-body text-sm text-charcoalMuted">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`rounded-full border px-3 py-2 text-sm transition-colors ${
              value === option
                ? "border-teal bg-tealLight text-charcoal"
                : "border-charcoalMuted bg-warmWhite text-charcoalMuted"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function Register() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const role = searchParams.get("role");
  const [step, setStep] = useState(role ? 1 : 0);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [resendCountdown, setResendCountdown] = useState(30);
  const [resendMessage, setResendMessage] = useState("");
  const [fullName, setFullName] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [time, setTime] = useState("");
  const [salaryRange, setSalaryRange] = useState([5000, 20000]);
  const [gender, setGender] = useState("");
  const [membersRequired, setMembersRequired] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registering, setRegistering] = useState(false);
  const otpRefs = useRef([]);

  const successCta = role === "worker" ? "Explore Jobs" : "Find Workers";
  const successMessage =
    role === "worker"
      ? "Your profile is ready. Start exploring jobs near you."
      : "Your account is ready. Start finding help near you.";
  const otpValue = useMemo(() => otp.join(""), [otp]);

  useEffect(() => {
    setStep(role ? 1 : 0);
  }, [role]);

  useEffect(() => {
    if (step !== 2) return;
    setResendCountdown(30);
    setResendMessage("");
  }, [step]);

  useEffect(() => {
    if (step !== 2 || resendCountdown <= 0) return;
    const timer = window.setTimeout(() => {
      setResendCountdown((prev) => prev - 1);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [step, resendCountdown]);

  useEffect(() => {
    if (step === 2) {
      otpRefs.current[0]?.focus();
    }
  }, [step, otpError]);

  const selectRole = (selectedRole) => {
    setSearchParams({ role: selectedRole });
    setStep(1);
  };

  const handlePhoneChange = (event) => {
    const onlyDigits = event.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(onlyDigits);
  };

  const goBack = () => {
    if (step === 1) {
      navigate("/");
      return;
    }
    if (step === 2) {
      setOtp(["", "", "", "", "", ""]);
      setOtpError("");
    }
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const nextOtp = [...otp];
    nextOtp[index] = value;
    setOtp(nextOtp);
    setOtpError("");
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (event) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "");
    if (pasted.length !== 6) return;
    event.preventDefault();
    setOtp(pasted.split("").slice(0, 6));
    setOtpError("");
    otpRefs.current[5]?.focus();
  };

  const verifyOtp = () => {
    if (otpValue !== "123456") {
      setOtpError("Incorrect OTP. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      return;
    }
    setStep(3);
  };

  const resendOtp = () => {
    if (resendCountdown > 0) return;
    setOtp(["", "", "", "", "", ""]);
    setOtpError("");
    setResendCountdown(30);
    setResendMessage("OTP resent.");
    otpRefs.current[0]?.focus();
  };

  const completeProfile = async () => {
    setRegisterError("");
    setRegistering(true);
    try {
      const user = await registerUser({
        phone: `+91${phone}`,
        role,
        name: fullName.trim(),
        category,
        location: { area: location.trim(), city: "Hyderabad" },
        time,
        wages: { min: salaryRange[0], max: salaryRange[1] },
        gender,
        ...(role === "employer" && {
          membersRequired,
          requirement: category ? `Looking for a ${category.toLowerCase()}` : "",
        }),
      });
      setUser(user);
      setStep(4);
    } catch (error) {
      setRegisterError(
        error.message === "Phone already registered"
          ? "This number is already registered. Try logging in."
          : "Registration failed. Please try again."
      );
    } finally {
      setRegistering(false);
    }
  };

  const renderStepIndicator = () => {
    const displayStep = step <= 3 ? step : 3;
    return (
      <p className="mb-6 text-sm text-charcoalMuted">Step {displayStep} of 3</p>
    );
  };

  return (
    <main className="px-6 py-10">
      <section className="mx-auto w-full max-w-[480px]">
        {step === 0 && !role && (
          <div className="mx-auto flex w-full flex-col gap-4 text-center">
            <p className="mb-2 font-heading text-3xl font-bold text-charcoal">
              Choose your role
            </p>
            <Button className="w-full" onClick={() => selectRole("worker")}>
              I&apos;m looking for work
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => selectRole("employer")}
            >
              I need to hire someone
            </Button>
          </div>
        )}

        {step >= 1 && step <= 3 && role && (
          <>
            <button
              type="button"
              aria-label="Go back"
              onClick={goBack}
              className="mb-3 inline-flex rounded-lg p-2 text-charcoal transition-colors hover:bg-orangeLight"
            >
              <ArrowLeft size={20} />
            </button>
            {renderStepIndicator()}
          </>
        )}

        {step === 1 && role && (
          <div>
            <h1 className="font-heading text-3xl font-bold text-charcoal">
              Enter your mobile number
            </h1>
            <p className="mt-2 font-body text-charcoalMuted">
              We&apos;ll send you a one-time password to verify
            </p>
            <div className="mt-6 flex w-full max-w-[360px] items-center overflow-hidden rounded-xl border border-charcoalMuted bg-warmWhite">
              <div className="h-[52px] min-w-[72px] border-l-4 border-teal px-3 font-body leading-[52px] text-charcoal">
                +91
              </div>
              <input
                type="text"
                value={phone}
                onChange={handlePhoneChange}
                maxLength={10}
                placeholder="10-digit mobile number"
                className="h-[52px] w-full rounded-r-xl border-0 bg-transparent px-3 font-body text-charcoal outline-none focus:ring-2 focus:ring-teal"
              />
            </div>
            <Button
              className="mt-6 w-full max-w-[360px] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={phone.length !== 10}
              onClick={() => setStep(2)}
            >
              Send OTP
            </Button>
            <p className="mt-3 max-w-[360px] text-xs text-charcoalMuted">
              By continuing, you agree to our Terms of Service
            </p>
          </div>
        )}

        {step === 2 && role && (
          <div>
            <h1 className="font-heading text-3xl font-bold text-charcoal">
              Enter the OTP
            </h1>
            <p className="mt-2 font-body text-charcoalMuted">Sent to +91 {phone}</p>
            <div
              className="mt-6 flex flex-wrap gap-2 sm:gap-3"
              onPaste={handleOtpPaste}
            >
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    otpRefs.current[index] = element;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(event) =>
                    handleOtpChange(index, event.target.value)
                  }
                  onKeyDown={(event) => handleOtpKeyDown(index, event)}
                  className="h-14 w-[52px] rounded-xl border border-charcoalMuted text-center font-heading text-2xl font-bold text-charcoal outline-none focus:border-teal focus:ring-1 focus:ring-teal"
                />
              ))}
            </div>
            {otpError && <p className="mt-3 text-sm text-alert">{otpError}</p>}
            <Button
              className="mt-6 w-full max-w-[360px] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={otpValue.length !== 6}
              onClick={verifyOtp}
            >
              Verify OTP
            </Button>
            <button
              type="button"
              className="mt-4 font-body text-sm text-teal disabled:text-charcoalMuted"
              disabled={resendCountdown > 0}
              onClick={resendOtp}
            >
              {resendCountdown > 0
                ? `Resend in ${resendCountdown}s`
                : "Resend OTP"}
            </button>
            {resendMessage && (
              <p className="mt-2 text-sm text-success">{resendMessage}</p>
            )}
          </div>
        )}

        {step === 3 && role && (
          <div>
            <h1 className="font-heading text-3xl font-bold text-charcoal">
              Set up your profile
            </h1>
            <div className="mt-6 flex h-20 w-20 items-center justify-center rounded-full bg-orangeLight">
              <User size={34} className="text-teal" />
            </div>
            <div className="mt-6 space-y-5">
              <input
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Your full name"
                className="h-[52px] w-full rounded-xl border border-charcoalMuted bg-warmWhite px-4 font-body text-charcoal outline-none focus:border-teal focus:ring-1 focus:ring-teal"
              />
              <PillSelect
                label={role === "worker" ? "Category / Role" : "Help needed"}
                options={CATEGORY_OPTIONS}
                value={category}
                onChange={setCategory}
              />
              <input
                type="text"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Your area or neighbourhood, e.g. Banjara Hills"
                className="h-[52px] w-full rounded-xl border border-charcoalMuted bg-warmWhite px-4 font-body text-charcoal outline-none focus:border-teal focus:ring-1 focus:ring-teal"
              />
              <PillSelect
                label={role === "worker" ? "Available time" : "Required time"}
                options={TIME_OPTIONS}
                value={time}
                onChange={setTime}
              />
              <div>
                <p className="mb-2 font-body text-sm text-charcoalMuted">
                  {role === "worker"
                    ? "Expected Salary Range"
                    : "Budget Range"}
                </p>
                <p className="mb-4 text-center font-heading text-lg text-orange">
                  {formatSalary(salaryRange[0])} — {formatSalary(salaryRange[1])}{" "}
                  / month
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
                    className="pointer-events-none absolute w-full appearance-none bg-transparent"
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
                    className="pointer-events-none absolute w-full appearance-none bg-transparent"
                    style={{ zIndex: 4 }}
                  />
                </div>
              </div>
              <PillSelect
                label={
                  role === "worker" ? "Gender" : "Gender preference for worker"
                }
                options={
                  role === "worker"
                    ? WORKER_GENDER_OPTIONS
                    : EMPLOYER_GENDER_OPTIONS
                }
                value={gender}
                onChange={setGender}
              />
              {role === "employer" && (
                <div>
                  <label className="mb-1 block font-body text-sm text-charcoalMuted">
                    How many workers do you need?
                  </label>
                  <div className="relative">
                    <select
                      value={membersRequired}
                      onChange={(e) => setMembersRequired(e.target.value)}
                      className="h-[52px] w-full appearance-none rounded-xl border border-charcoalMuted bg-warmWhite px-4 font-body text-charcoal focus:border-teal focus:outline-none focus:ring-2 focus:ring-tealLight"
                    >
                      <option value="" disabled>
                        Select number of workers
                      </option>
                      <option value="1">1 Person</option>
                      <option value="2-3">2 - 3 People</option>
                      <option value="4-5">4 - 5 People</option>
                      <option value="5+">5+ People</option>
                      <option value="10+">10+ People (team)</option>
                    </select>
                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-charcoalMuted">
                      ▼
                    </div>
                  </div>
                </div>
              )}
            </div>
            <Button
              className="mt-6 w-full disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!fullName.trim() || registering}
              onClick={completeProfile}
            >
              {registering ? "Creating account..." : "Continue"}
            </Button>
            {registerError && (
              <p className="mt-3 text-sm text-alert">{registerError}</p>
            )}
          </div>
        )}

        {step === 4 && role && (
          <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
            <CheckCircle2 size={64} className="text-success" />
            <h1 className="mt-5 font-heading text-3xl font-bold text-charcoal">
              You&apos;re all set!
            </h1>
            <p className="mt-3 max-w-sm font-body text-charcoalMuted">
              {successMessage}
            </p>
            <Button
              className="mt-8 w-full max-w-[360px]"
              onClick={() =>
                navigate(
                  role === "worker"
                    ? "/dashboard/worker"
                    : "/dashboard/employer"
                )
              }
            >
              {successCta}
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}

export default Register;
