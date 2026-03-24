import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

import {
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  MapPinIcon
} from "@heroicons/react/24/outline";

function CreateEvent() {

  const navigate = useNavigate();

  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    capacity: "",
    date: "",
    time: "",
    hours: "",
    location: ""
  });

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.data.profileCompleted || !res.data.phone || !res.data.dob) {
          alert("Please complete your profile details (Phone, DOB, Blood Group, ID) before creating an event.");
          navigate("/profile");
        }
      } catch (err) {
        console.error("Profile check failed", err);
      }
    };
    if (token) checkProfile();
  }, [token, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      await axios.post(
        "http://localhost:5000/api/events/create",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert("Event created successfully");
      navigate("/dashboard");

    } catch (error) {
      const msg = error.response?.data?.message || "An error occurred";
      alert(msg);
      if (msg.includes("complete your profile")) {
        navigate("/complete-profile");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 pb-12 antialiased transition-colors duration-300">
      <Navbar />

      {/* Sticky Action Header */}
      <div className="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            Create Event
          </h1>

          <div className="flex gap-3">
            <button className="text-sm px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 font-semibold transition-all duration-200">
              Save Draft
            </button>
            <button
              onClick={handleSubmit}
              className="text-sm px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 active:scale-[0.98] transition-all focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            >
              Publish Event
            </button>
          </div>
        </div>
      </div>

      {/* Page Layout */}
      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Section */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-2 space-y-8 bg-white dark:bg-slate-800/90 p-10 rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.2)] border border-gray-100 dark:border-slate-700/50 backdrop-blur-xl"
        >
          {/* Basic Info */}
          <div className="space-y-6">
            <h2 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700 pb-2">
              Basic Information
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Event Title
                </label>
                <input
                  name="title"
                  type="text"
                  placeholder="e.g. Community Beach Cleanup"
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none font-medium text-gray-800 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Description
                </label>
                <textarea
                  name="description"
                  rows="4"
                  placeholder="Describe what volunteers will be doing..."
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none font-medium text-gray-800 dark:text-gray-100 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Location
                </label>
                <div className="relative">
                  <MapPinIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 absolute left-3.5 top-3.5" />
                  <input
                    name="location"
                    type="text"
                    placeholder="e.g. Community Center, Main Hall"
                    onChange={handleChange}
                    className="pl-11 w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none font-medium text-gray-800 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="space-y-6">
            <h2 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700 pb-2">
              Date & Time
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Event Date</label>
                <div className="relative">
                  <CalendarIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 absolute left-3.5 top-3.5" />
                  <input
                    type="date"
                    name="date"
                    onChange={handleChange}
                    className="pl-11 w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none font-medium text-gray-800 dark:text-gray-100 [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Start Time</label>
                <div className="relative">
                  <ClockIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 absolute left-3.5 top-3.5" />
                  <input
                    type="time"
                    name="time"
                    onChange={handleChange}
                    className="pl-11 w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none font-medium text-gray-800 dark:text-gray-100 [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Duration (Hours)</label>
                <div className="relative">
                  <ClockIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 absolute left-3.5 top-3.5" />
                  <input
                    type="number"
                    name="hours"
                    placeholder="e.g. 4"
                    onChange={handleChange}
                    className="pl-11 w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none font-medium text-gray-800 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Capacity */}
          <div className="space-y-6">
            <h2 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700 pb-2">
              Participation
            </h2>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Maximum Volunteers</label>
              <div className="relative max-w-sm">
                <UserGroupIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 absolute left-3.5 top-3.5" />
                <input
                  type="number"
                  name="capacity"
                  placeholder="e.g. 50"
                  onChange={handleChange}
                  className="pl-11 w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none font-medium text-gray-800 dark:text-gray-100"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Live Preview Card */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-28">
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 px-1">
              Live Preview
            </h3>
            <div className="glass dark:glass-dark rounded-[2rem] p-8 transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_20px_40px_rgba(99,102,241,0.15)]">
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 mr-1.5 animate-pulse"></span>
                Draft
              </div>

              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {formData.title || "Your Event Title"}
              </h2>

              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 line-clamp-3 min-h-[60px]">
                {formData.description || "Describe what volunteers will be doing, what they should bring, and why it matters."}
              </p>

              <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-gray-100 dark:border-slate-700 text-sm">
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <span className="w-6 text-center mr-2 text-lg">📍</span>
                  <span className="font-medium">
                    {formData.location || "Location TBD"}
                  </span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <span className="w-6 text-center mr-2 text-lg">📅</span>
                  <span className="font-medium">
                    {formData.date ? new Date(formData.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : "Date TBD"}
                    {formData.time ? ` at ${formData.time}` : ""}
                  </span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <span className="w-6 text-center mr-2 text-lg">⏱️</span>
                  <span className="font-medium">
                    {formData.hours ? `${formData.hours} Hours` : "Duration TBD"}
                  </span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <span className="w-6 text-center mr-2 text-lg">👥</span>
                  <span className="font-medium">
                    0 / {formData.capacity || "∞"} Volunteers
                  </span>
                </div>
              </div>

              <button disabled className="w-full mt-6 bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500 py-3 rounded-xl font-bold cursor-not-allowed">
                Preview Button
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default CreateEvent;