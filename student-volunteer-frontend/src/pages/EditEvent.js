import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";

function EditEvent() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const token =
  localStorage.getItem("token") ||
  sessionStorage.getItem("token");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    capacity: "",
    hours: "",
    location: "",
  });

  useEffect(() => {
    fetchEvent();
  }, []);

  const fetchEvent = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/events",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const event = response.data.find((e) => e._id === eventId);

      if (event) {
        setFormData({
          title: event.title,
          description: event.description,
          date: event.date.split("T")[0],
          time: event.time || "09:00",
          capacity: event.capacity,
          hours: event.hours, // ✅ VERY IMPORTANT
          location: event.location || "",
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.type === "number"
          ? Number(e.target.value)
          : e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(
        `http://localhost:5000/api/events/update/${eventId}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert(response.data.message);
      navigate("/dashboard");
    } catch (error) {
      alert(error.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 transition-colors duration-300">
      <Navbar />

      <div className="max-w-md mx-auto bg-white dark:bg-slate-800 p-6 mt-10 rounded-xl shadow dark:shadow-none dark:border dark:border-slate-700">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Edit Event</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-gray-100 p-2 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required
          />

          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-gray-100 p-2 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required
          />

          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Location"
            className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-gray-100 p-2 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required
          />

          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-gray-100 p-2 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none [color-scheme:light] dark:[color-scheme:dark]"
            required
          />

          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-gray-100 p-2 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none [color-scheme:light] dark:[color-scheme:dark]"
            required
          />

          <input
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-gray-100 p-2 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required
          />

          <input
            type="number"
            name="hours"
            value={formData.hours}
            onChange={handleChange}
            className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-gray-100 p-2 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded transition"
          >
            Update Event
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditEvent;