import { useState, useRef, useEffect } from "react";
import axios from "axios";
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
      await axios.post(
        "http://localhost:5000/api/auth/verify-otp",
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
      await axios.post(
        "http://localhost:5000/api/auth/send-otp",
        { email }
      );

      alert("OTP resent");
      setTimer(30);
    } catch (error) {
      alert("Failed to resend OTP");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">

        <h2 className="text-2xl font-bold mb-2">
          Verify OTP
        </h2>

        <p className="text-gray-500 mb-6">
          Enter the 6 digit code sent to
        </p>

        <p className="font-semibold mb-6">
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
              className="w-12 h-12 border rounded-lg text-center text-xl focus:ring-2 focus:ring-blue-400 outline-none"
            />
          ))}

        </div>

        {/* VERIFY BUTTON */}
        <button
          onClick={handleVerify}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition"
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