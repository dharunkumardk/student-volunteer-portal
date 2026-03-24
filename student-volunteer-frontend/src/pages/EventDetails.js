import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Navbar from "../components/Navbar";

function EventDetails() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [userFeedbackExists, setUserFeedbackExists] = useState(false);
  
  // Feedback form state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    fetchEventDetails();
    fetchFeedback();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvent(response.data);
    } catch (error) {
      alert(error.response?.data?.message || "Error fetching event details");
    }
  };

  const fetchFeedback = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/events/${eventId}/feedback`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeedbacks(response.data.feedbacks);
      setAverageRating(response.data.averageRating);
      setUserFeedbackExists(response.data.userFeedbackExists);
    } catch (error) {
      console.log("Error fetching feedback:", error);
    }
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please select a rating.");
      return;
    }
    try {
      await axios.post(`http://localhost:5000/api/events/${eventId}/feedback`, {
        rating, comment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Feedback submitted successfully!");
      setRating(0);
      setComment("");
      fetchFeedback();
    } catch (error) {
       alert(error.response?.data?.message || "Error submitting feedback");
    }
  };

  if (!event) return <div className="text-center mt-20 text-gray-500">Loading Event Details...</div>;

  const decoded = token ? jwtDecode(token) : null;
  const userId = decoded?.id;
  const role = decoded?.role;
  const isCompleted = event.computedStatus === "completed";
  const isOngoing = event.computedStatus === "ongoing";
  const attended = event.attendance?.includes(userId);
  const canLeaveFeedback = role === "student" && isCompleted && attended && !userFeedbackExists;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 pb-12 transition-colors duration-300">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 mt-8">
        <button onClick={() => navigate(-1)} className="mb-6 text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1 transition-all">
          &larr; Back
        </button>

        {/* Event Header */}
        <div className="bg-white dark:bg-slate-800/90 backdrop-blur-xl rounded-[2rem] p-10 border border-gray-100 dark:border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] mb-10">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2 line-clamp-2">
              {event.title}
            </h1>
            <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap">
              ⭐ {averageRating > 0 ? averageRating : "New"} <span className="text-xs font-semibold">({feedbacks.length} reviews)</span>
            </div>
            {isOngoing && (
              <span className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 shadow-sm animate-pulse">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Ongoing Now
              </span>
            )}
            {isCompleted && (
              <span className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50">
                 Completed
              </span>
            )}
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed whitespace-pre-wrap">{event.description}</p>
          
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 flex-1 min-w-[140px]">
              <p className="text-gray-400 font-bold uppercase tracking-wider text-xs mb-1">Location</p>
              <p className="font-semibold text-gray-800 dark:text-gray-200">
                {event.location || "Location TBD"}
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 flex-1 min-w-[140px]">
              <p className="text-gray-400 font-bold uppercase tracking-wider text-xs mb-1">Date & Time</p>
              <p className="font-semibold text-gray-800 dark:text-gray-200">
                {new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric'})} at {event.time || "09:00"}
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 flex-1 min-w-[140px]">
              <p className="text-gray-400 font-bold uppercase tracking-wider text-xs mb-1">Duration</p>
              <p className="font-semibold text-gray-800 dark:text-gray-200">{event.hours} Hours</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 flex-1 min-w-[140px]">
              <p className="text-gray-400 font-bold uppercase tracking-wider text-xs mb-1">Organizer</p>
              <p className="font-semibold text-gray-800 dark:text-gray-200">{event.createdBy?.name || "Unknown"}</p>
            </div>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Reviews List */}
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-3">Attendee Feedback</h2>
            
            {feedbacks.length === 0 ? (
              <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700">
                <span className="text-4xl mb-3 block">💬</span>
                <p className="text-gray-500 dark:text-gray-400 font-medium">No feedback submitted yet.</p>
              </div>
            ) : (
              feedbacks.map((f) => (
                <div key={f._id} className="bg-white dark:bg-slate-800/90 p-8 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-gray-100 dark:border-slate-700/50 hover:shadow-[0_10px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_10px_30px_rgba(99,102,241,0.1)] hover:-translate-y-1 transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/40 dark:to-indigo-800/40 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold shadow-sm">
                        {f.user?.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{f.user?.name || "Anonymous Student"}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{new Date(f.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(s => (
                        <span key={s} className={`text-xl ${s <= f.rating ? 'text-yellow-400 drop-shadow-sm' : 'text-gray-200 dark:text-slate-600'}`}>★</span>
                      ))}
                    </div>
                  </div>
                  {f.comment && (
                    <p className="text-gray-700 dark:text-gray-300 mt-2 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl text-sm leading-relaxed border border-gray-100/50 dark:border-slate-700/50">
                      "{f.comment}"
                    </p>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Leave Review Form */}
          <div className="md:col-span-1">
            {canLeaveFeedback ? (
              <div className="glass dark:glass-dark p-8 rounded-[2rem] sticky top-28 transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_20px_40px_rgba(99,102,241,0.15)] duration-300">
                <h3 className="font-bold text-lg mb-2 text-indigo-900 dark:text-white tracking-tight">Rate your experience</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-5 font-semibold">Your feedback helps organizers improve future events.</p>
                <form onSubmit={submitFeedback} className="space-y-5">
                  <div className="flex justify-center gap-1 bg-white dark:bg-slate-900/50 py-3 rounded-2xl border border-indigo-50 dark:border-slate-700">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRating(s)}
                        onMouseEnter={() => setHoverRating(s)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="text-3xl transition-transform hover:scale-125 focus:outline-none"
                      >
                        <span className={(hoverRating || rating) >= s ? 'text-yellow-400 drop-shadow' : 'text-gray-200 dark:text-slate-700'}>★</span>
                      </button>
                    ))}
                  </div>

                  <textarea
                    placeholder="Tell us what you thought... (optional)"
                    rows="4"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl px-4 py-3 focus:ring-4 focus:ring-indigo-500/20 dark:focus:ring-indigo-500/20 outline-none text-sm resize-none transition-all shadow-sm"
                  ></textarea>
                  
                  <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all active:scale-[0.98] focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 mt-2">
                    Submit Feedback
                  </button>
                </form>
              </div>
            ) : userFeedbackExists ? (
               <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-800/40 text-center sticky top-28">
                  <p className="text-3xl mb-3 drop-shadow-sm">🎉</p>
                  <p className="text-emerald-800 dark:text-emerald-400 font-bold mb-1">Thank you!</p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-500/80 font-medium leading-relaxed">You have successfully shared your feedback for this event.</p>
               </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 text-center sticky top-28 opacity-80">
                  <p className="text-3xl mb-3 opacity-50">🔒</p>
                  <p className="text-gray-700 dark:text-gray-300 font-semibold mb-1">Feedback Locked</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {isCompleted ? (
                      attended ? "You have already left feedback or are not eligible." : "Only verified attendees who scanned in can leave feedback."
                    ) : "Feedback opens after the event is completed."}
                  </p>
               </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default EventDetails;
