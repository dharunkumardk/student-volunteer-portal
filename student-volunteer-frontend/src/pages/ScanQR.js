import { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import axios from "axios";
import Navbar from "../components/Navbar";

function ScanQR() {
  const token =
  localStorage.getItem("token") ||
  sessionStorage.getItem("token");

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        qrbox: {
          width: 250,
          height: 250,
        },
        fps: 5,
      },
      false
    );

    scanner.render(
      async (decodedText) => {
        try {
          const parsed = JSON.parse(decodedText);

          const response = await axios.post(
            `http://localhost:5000/api/events/attendance/${parsed.eventId}`,
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          alert(response.data.message);
          scanner.clear();
        } catch (error) {
          alert(error.response?.data?.message || "Attendance failed");
        }
      },
      (error) => {
        // Ignore scan errors
      }
    );
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 transition-colors duration-300">
      <Navbar />

      <div className="max-w-md mx-auto p-8">
        <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">
          📷 Scan QR Code
        </h2>

        <div id="reader" className="bg-white dark:bg-slate-800 dark:text-white p-4 rounded-xl shadow dark:shadow-none dark:border-slate-700"></div>
      </div>
    </div>
  );
}

export default ScanQR;