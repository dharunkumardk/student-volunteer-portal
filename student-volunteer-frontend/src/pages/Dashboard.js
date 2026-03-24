import { useEffect, useState } from "react";
import API from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Navbar from "../components/Navbar";

function Dashboard() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const token =
  localStorage.getItem("token") ||
  sessionStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    fetchEvents();
    fetchUser();
  }, []);

  // Removed automatic redirect to allow users to browse dashboard.
  // Profile completion is now enforced only when joining or creating an event.

  const fetchUser = async () => {
    try {
      const response = await API.get(
        `/auth/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCurrentUser(response.data);
    } catch (error) {
      console.log("User fetch error:", error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await API.get(
        `/events`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEvents(response.data);
    } catch (error) {
      console.log("Fetch error:", error);
    }
  };

  const handleJoin = async (eventId) => {
    try {
      const response = await API.post(
        `/events/join/${eventId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(response.data.message);
      fetchEvents();
    } catch (error) {
      const msg = error.response?.data?.message || "Join failed";
      alert(msg);
      if (msg.includes("complete your profile")) {
        navigate("/complete-profile");
      }
    }
  };

  const handleLeave = async (eventId) => {
    try {
      const response = await API.post(
        `/events/leave/${eventId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(response.data.message);
      fetchEvents();
    } catch (error) {
      alert(error.response?.data?.message || "Leave failed");
    }
  };

  const handleDelete = async (eventId) => {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this event?"
      );
      if (!confirmDelete) return;

      const response = await API.delete(
        `/events/delete/${eventId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(response.data.message);
      fetchEvents();
    } catch (error) {
      alert(error.response?.data?.message || "Delete failed");
    }
  };

  const handleComplete = async (eventId) => {
    try {
      const response = await API.put(
        `/events/complete/${eventId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(response.data.message);
      fetchEvents();
      fetchUser(); // refresh hours
    } catch (error) {
      alert(error.response?.data?.message || "Completion failed");
    }
  };

  const decoded = token ? jwtDecode(token) : null;
  const userId = decoded?.id;
  const role = decoded?.role;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 pb-12 transition-colors duration-300">
      <Navbar />

      <div className="max-w-6xl mx-auto p-6 mt-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight drop-shadow-sm">
              Dashboard
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium text-lg">Discover and manage your volunteer events</p>
          </div>
          
          {/* ✅ HOURS DISPLAY */}
          {role === "student" && currentUser && (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 text-indigo-800 dark:text-indigo-300 px-6 py-3 rounded-2xl shadow-sm flex items-center gap-3">
              <span className="text-2xl">🌟</span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">Total Impact</p>
                <p className="text-xl font-bold">{currentUser.totalHours} Hours</p>
              </div>
            </div>
          )}
        </div>

        {events.length === 0 && (
          <div className="text-center py-24 bg-white dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-gray-100 dark:border-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
            <div className="w-24 h-24 mx-auto bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-5xl mb-6 shadow-inner">
              📭
            </div>
            <h3 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">No events available</h3>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Check back later for new volunteer opportunities.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const alreadyJoined = event.volunteers.includes(userId);
            const capacity = event.capacity || 0;
            const volunteerCount = event.volunteers.length;
            const slotsLeft = capacity - volunteerCount;
            const isFull = capacity > 0 && volunteerCount >= capacity;
            const isCreator =
              role === "organizer" &&
              event.createdBy?._id === userId;
            const isCompleted = event.computedStatus === "completed";
            const isOngoing = event.computedStatus === "ongoing";

            return (
              <div
                key={event._id}
                className="group bg-white dark:bg-slate-800/90 rounded-3xl p-7 border border-gray-100 dark:border-slate-700/50 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.2)] dark:hover:shadow-[0_20px_40px_rgba(99,102,241,0.15)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="mt-1 flex gap-2">
                    {isCompleted ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                        Completed
                      </span>
                    ) : isOngoing ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 shadow-sm animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
                        Ongoing Now
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-1.5 animate-pulse"></span>
                        Upcoming
                      </span>
                    )}
                  </div>
                  {capacity > 0 && !isCompleted && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${slotsLeft === 0 ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'}`}>
                      {slotsLeft === 0 ? 'Full' : `${slotsLeft} spots left`}
                    </span>
                  )}
                </div>

                <h3 
                  className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  onClick={() => navigate(`/event/${event._id}`)}
                >
                  {event.title}
                </h3>

                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-3 flex-grow">
                  {event.description}
                </p>

                <div className="space-y-2 mb-6 text-sm">
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <span className="w-5 text-center mr-2">📅</span>
                    <span className="font-medium">
                      {new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })} at {event.time || "09:00"}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <span className="w-5 text-center mr-2">👤</span>
                    <span>Org: <span className="font-medium">{event.createdBy?.name || 'Unknown'}</span></span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <span className="w-5 text-center mr-2">👥</span>
                    <span>Volunteers: <span className="font-medium">{volunteerCount}</span> {capacity > 0 && <span className="text-gray-400 dark:text-gray-500">/ {capacity}</span>}</span>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-slate-700 flex flex-wrap gap-2">
                  {!isCompleted && (
                    <>
                      {alreadyJoined ? (
                        <button
                          onClick={() => handleLeave(event._id)}
                          className="flex-1 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:border-rose-300 py-2.5 px-4 rounded-xl font-bold shadow-sm active:scale-[0.98] transition-all focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                        >
                          Leave Event
                        </button>
                      ) : isFull ? (
                        <button
                          disabled
                          className="flex-1 bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500 py-2.5 px-4 rounded-xl font-bold cursor-not-allowed"
                        >
                          Event Full
                        </button>
                      ) : (
                        <button
                          onClick={() => handleJoin(event._id)}
                          className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white py-2.5 px-4 rounded-xl font-bold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 active:scale-[0.98] transition-all focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                        >
                          Join Event
                        </button>
                      )}
                    </>
                  )}

                  {isCreator && (
                    <div className="w-full flex gap-2 mt-2">
                      {isCompleted && !event.hoursDistributed && (
                        <button
                          onClick={() => handleComplete(event._id)}
                          className="flex-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-800/40 py-2 px-3 rounded-xl text-sm font-semibold transition-colors"
                        >
                          Give Hours
                        </button>
                      )}

                      <button
                        onClick={() =>
                          navigate(`/edit-event/${event._id}`)
                        }
                        className="flex-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/40 py-2 px-3 rounded-xl text-sm font-semibold transition-colors"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(event._id)}
                        className="bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 py-2 px-3 rounded-xl text-sm font-semibold transition-colors"
                        title="Delete Event"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => navigate(`/event/${event._id}`)}
                    className="w-full mt-4 bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 py-2.5 px-4 rounded-xl font-bold border border-gray-200 dark:border-slate-600 active:scale-[0.98] transition-all focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900 group-hover:border-gray-300 dark:group-hover:border-slate-500"
                  >
                    View Details & Feedback
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;