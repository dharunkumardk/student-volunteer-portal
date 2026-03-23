import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function CompleteProfile() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  const [formData, setFormData] = useState({
    phone: "",
    dob: "",
    bloodGroup: "",
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please upload an ID proof document.");
      return;
    }
    
    setError("");
    setLoading(true);

    const payload = new FormData();
    payload.append("phone", formData.phone);
    payload.append("dob", formData.dob);
    payload.append("bloodGroup", formData.bloodGroup);
    payload.append("idProof", file);

    try {
      await axios.put("http://localhost:5000/api/auth/complete-profile", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to complete profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <Navbar />
      <div className="max-w-2xl mx-auto p-6 md:p-12 mt-8">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 md:p-10 border border-gray-100 dark:border-slate-700">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center text-3xl mb-4 mx-auto shadow-sm">
              📋
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Complete Your Profile</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Almost there! We just need a few more details to verify your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 rounded-xl text-rose-700 dark:text-rose-400 text-sm font-semibold text-center">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider text-xs">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider text-xs">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white transition-all font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider text-xs">Blood Group</label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white transition-all font-medium appearance-none"
                >
                  <option value="" disabled>Select Group</option>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider text-xs">ID Proof (College/Gov)</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf, image/*"
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white transition-all text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4 active:scale-[0.98]"
            >
              {loading ? "Submitting..." : "Complete Profile"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
export default CompleteProfile;
