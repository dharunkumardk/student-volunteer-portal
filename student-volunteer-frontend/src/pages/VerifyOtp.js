import { useState, useRef, useEffect } from "react";
import API from "../utils/axiosInstance";
import { useNavigate, useLocation } from "react-router-dom";

function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);

  const inputs = useRef([]);

  // countdown timer
  useEffect(() => {
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 10000);

    return () => clearInterval(interval);
  }, [timer]);

  // handle typing
  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  // handle backspace
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join("");

    try {
      await API.post(
        `/auth/verify-otp`,
        { email, otp: otpValue }
      );

      alert("Registration successful");
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "Invalid OTP");
    }
  };

  const resendOtp = async () => {
    try {
      await API.post(
        `/auth/send-otp`,
        { email }
      );

      alert("OTP resent");
      setTimer(30);
    } catch (error) {
      alert("Failed to resend OTP");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors duration-300">

      <div className="glass dark:glass-dark p-10 rounded-[2rem] w-full max-w-md text-center z-10 transition-all duration-300">

        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
          Verify OTP
        </h2>

        <p className="text-gray-500 dark:text-gray-400 mb-2">
          Enter the 6 digit code sent to
        </p>

        <p className="font-semibold text-gray-900 dark:text-gray-100 mb-8">
          {email}
        </p>

        {/* OTP BOXES */}
        <div className="flex justify-center gap-3 mb-6">

          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputs.current[index] = el)}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) =>
                handleChange(e.target.value, index)
              }
              onKeyDown={(e) =>
                handleKeyDown(e, index)
              }
              className="w-12 h-12 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl text-center text-xl font-bold focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white outline-none transition-all"
            />
          ))}

        </div>

        {/* VERIFY BUTTON */}
        <button
          onClick={handleVerify}
          className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all active:scale-[0.98] focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 mt-2"
        >
          Verify OTP
        </button>

        {/* TIMER / RESEND */}
        <div className="mt-4 text-sm text-gray-600">

          {timer > 0 ? (
            <p>Resend OTP in {timer}s</p>
          ) : (
            <button
              onClick={resendOtp}
              className="text-blue-500 hover:underline"
            >
              Resend OTP
            </button>
          )}

        </div>

      </div>

    </div>
  );
}

export default VerifyOtp;