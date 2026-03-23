import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

function Leaderboard() {
  const token =
  localStorage.getItem("token") ||
  sessionStorage.getItem("token");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/auth/leaderboard",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUsers(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 pb-12 antialiased transition-colors duration-300">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-10">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl mb-4 text-indigo-600 dark:text-indigo-400 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Volunteer Leaderboard
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-lg mx-auto">
            Recognizing our top contributors making a difference in the community.
          </p>
        </div>

        {/* Leaderboard List */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-2 sm:p-4 overflow-hidden">
          {users.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">🌟</div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">No volunteers yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Be the first to join an event and earn hours!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((user, index) => {
                
                // Styling based on rank
                let rankStyle = "bg-gray-50 dark:bg-slate-800/50 text-gray-700 dark:text-gray-300 border-gray-100 dark:border-slate-700/50";
                let badgeIcon = null;
                
                if (index === 0) {
                  rankStyle = "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700/50 text-amber-900 dark:text-amber-400 shadow-sm shadow-amber-100/50 dark:shadow-amber-900/20";
                  badgeIcon = "🏆";
                } else if (index === 1) {
                  rankStyle = "bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-300 shadow-sm dark:shadow-none";
                  badgeIcon = "🥈";
                } else if (index === 2) {
                  rankStyle = "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800/50 text-orange-900 dark:text-orange-400 shadow-sm dark:shadow-none";
                  badgeIcon = "🥉";
                }

                return (
                  <div
                    key={user._id}
                    className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all hover:-translate-y-0.5 hover:shadow-md ${rankStyle}`}
                  >
                    <div className="flex items-center gap-4 sm:gap-6">
                      
                      {/* Rank Indicator */}
                      <div className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white dark:bg-slate-700 shadow-sm dark:shadow-none font-bold text-lg sm:text-xl shrink-0">
                        {badgeIcon ? (
                          <span className="text-2xl">{badgeIcon}</span>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">#{index + 1}</span>
                        )}
                      </div>

                      {/* User Info */}
                      <div>
                        <h3 className="font-bold text-base sm:text-lg flex items-center gap-2 text-slate-900 dark:text-slate-100">
                          {user.name}
                          {index === 0 && (
                            <span className="text-xs bg-amber-200 dark:bg-amber-500/20 text-amber-800 dark:text-amber-400 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold border border-amber-300 dark:border-amber-500/30 hidden sm:inline-block">
                              Top Volunteer
                            </span>
                          )}
                        </h3>
                        <p className="text-sm opacity-70 truncate max-w-[120px] sm:max-w-xs block">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {/* Hours */}
                    <div className="text-right shrink-0">
                      <div className="font-extrabold text-xl sm:text-2xl tracking-tight">
                        {user.totalHours}
                      </div>
                      <div className="text-xs sm:text-sm font-semibold uppercase tracking-wider opacity-70">
                        Hours
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;