import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/common/Button";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [resendCountdown, setResendCountdown] = useState(30);
  const [resendMessage, setResendMessage] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const otpRefs = useRef([]);

  const otpValue = useMemo(() => otp.join(""), [otp]);

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

  const handlePhoneChange = (event) => {
    const onlyDigits = event.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(onlyDigits);
  };

  const goBack = () => {
    if (step === 2) {
      setOtp(["", "", "", "", "", ""]);
      setOtpError("");
      setLoginError("");
      setStep(1);
      return;
    }

    navigate("/");
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const nextOtp = [...otp];
    nextOtp[index] = value;
    setOtp(nextOtp);
    setOtpError("");
    setLoginError("");

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
    setLoginError("");
    otpRefs.current[5]?.focus();
  };

  const resendOtp = () => {
    if (resendCountdown > 0) return;

    setOtp(["", "", "", "", "", ""]);
    setOtpError("");
    setLoginError("");
    setResendCountdown(30);
    setResendMessage("OTP resent.");
    otpRefs.current[0]?.focus();
  };

  const handleLogin = async () => {
    if (otpValue !== "123456") {
      setOtpError("Incorrect OTP. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      return;
    }

    setLoggingIn(true);
    setLoginError("");
    setOtpError("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/users/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: `+91${phone}` }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 404) {
          setLoginError("No account found. Please register first.");
        } else {
          setLoginError(data.message || "Login failed. Please try again.");
        }
        return;
      }

      setUser(data);
      navigate(
        data.role === "worker"
          ? "/dashboard/worker"
          : "/dashboard/employer"
      );
    } catch {
      setLoginError("Login failed. Please try again.");
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <main className="px-6 py-10">
      <section className="mx-auto w-full max-w-[480px]">
        <button
          type="button"
          aria-label="Go back"
          onClick={goBack}
          className="mb-3 inline-flex rounded-lg p-2 text-charcoal transition-colors hover:bg-orangeLight"
        >
          <ArrowLeft size={20} />
        </button>

        {step === 1 && (
          <div>
            <h1 className="font-heading text-3xl font-bold text-charcoal">
              Welcome back
            </h1>
            <p className="mt-2 font-body text-charcoalMuted">
              Enter your mobile number to continue
            </p>

            <div className="mt-6 flex w-full items-center overflow-hidden rounded-xl border border-charcoalMuted bg-warmWhite">
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
              className="mt-6 w-full disabled:cursor-not-allowed disabled:opacity-50"
              disabled={phone.length !== 10}
              onClick={() => setStep(2)}
            >
              Send OTP
            </Button>

            <p className="mt-4 font-body text-sm text-charcoalMuted">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="text-teal hover:underline">
                Register here
              </Link>
            </p>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="font-heading text-3xl font-bold text-charcoal">
              Enter the OTP
            </h1>
            <p className="mt-2 font-body text-charcoalMuted">
              Sent to +91 {phone}
            </p>

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

            {otpError && (
              <p className="mt-3 text-sm text-alert">{otpError}</p>
            )}
            {loginError && (
              <div className="mt-3">
                <p className="text-sm text-alert">{loginError}</p>
                {loginError.includes("register") && (
                  <Link
                    to="/register"
                    className="mt-2 inline-block text-sm text-teal hover:underline"
                  >
                    Go to Register
                  </Link>
                )}
              </div>
            )}

            <Button
              className="mt-6 w-full disabled:cursor-not-allowed disabled:opacity-50"
              disabled={otpValue.length !== 6 || loggingIn}
              onClick={handleLogin}
            >
              {loggingIn ? "Logging in..." : "Login"}
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
      </section>
    </main>
  );
}

export default Login;
