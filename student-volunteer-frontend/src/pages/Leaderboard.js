import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { jwtDecode } from "jwt-decode";

function Leaderboard() {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const [users, setUsers] = useState([]);
  const [timeFilter, setTimeFilter] = useState("all_time");
  const [category, setCategory] = useState("hours");

  const decoded = token ? jwtDecode(token) : null;
  const currentUserId = decoded?.id;

  useEffect(() => {
    fetchLeaderboard();
  }, [timeFilter, category]);

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/auth/leaderboard?timeFilter=${timeFilter}&category=${category}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUsers(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const currentUserIndex = users.findIndex(user => user._id === currentUserId);
  const currentUserRank = currentUserIndex !== -1 ? currentUserIndex + 1 : null;

  const top3 = users.slice(0, 3);
  const restUsers = users.slice(3);

  const renderPodiumCard = (user, rank) => {
    if (!user) return null;
    
    const isFirst = rank === 1;
    const bgClass = isFirst 
      ? "bg-gradient-to-t from-amber-200 to-amber-50 dark:from-amber-900/40 dark:to-amber-900/10 border-amber-300 dark:border-amber-700/50 shadow-amber-200/50" 
      : rank === 2 
      ? "bg-gradient-to-t from-slate-200 to-slate-50 dark:from-slate-700/40 dark:to-slate-800/10 border-slate-300 dark:border-slate-600/50 shadow-slate-200/50"
      : "bg-gradient-to-t from-orange-200 to-orange-50 dark:from-orange-900/40 dark:to-orange-900/10 border-orange-300 dark:border-orange-800/50 shadow-orange-200/50";

    const badgeIcon = rank === 1 ? "🏆" : rank === 2 ? "🥈" : "🥉";
    const baseScale = isFirst ? "scale-105 z-10" : "scale-100 mt-8";
    
    return (
      <div key={user._id} className={`flex flex-col items-center flex-1 transition-all ${baseScale}`}>
        <div className="relative mb-3">
          <div className={`w-16 h-16 ${isFirst ? 'sm:w-20 sm:h-20 border-4 border-amber-400' : 'sm:w-16 sm:h-16 border-4 border-gray-300'} rounded-full overflow-hidden bg-gray-200 dark:bg-slate-700 shadow-xl flex items-center justify-center`}>
            {user.avatar ? (
              <img src={`http://localhost:5000${user.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-bold text-gray-400 dark:text-slate-500">{user.name.charAt(0)}</span>
            )}
          </div>
          <div className="absolute -bottom-3 -right-2 text-3xl drop-shadow-md">{badgeIcon}</div>
        </div>
        
        <div className={`w-full flex-1 rounded-t-2xl border-t border-x px-2 pt-4 pb-2 flex flex-col items-center text-center ${bgClass}`}>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base line-clamp-1 w-full">{user.name}</h3>
          <p className="text-indigo-600 dark:text-indigo-400 font-black text-lg sm:text-2xl mt-1">{category === "hours" ? user.totalHours : user.totalEvents}</p>
          <p className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 tracking-wider">{category === "hours" ? "Hours" : "Events"}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 pb-12 antialiased transition-colors duration-300">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-10">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl mb-4 text-indigo-600 dark:text-indigo-400 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Leaderboard
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-lg mx-auto">
            Recognizing our top contributors making a difference.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-700/50 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex bg-gray-100 dark:bg-slate-900 rounded-xl p-1 w-full md:w-auto">
            {["all_time", "this_month", "this_week"].map((time) => (
              <button
                key={time}
                onClick={() => setTimeFilter(time)}
                className={`flex-1 md:px-4 py-2 rounded-lg text-sm font-bold transition-all ${timeFilter === time ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                {time.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </button>
            ))}
          </div>

          <div className="flex bg-gray-100 dark:bg-slate-900 rounded-xl p-1 w-full md:w-auto">
             <button
                onClick={() => setCategory("hours")}
                className={`flex-1 md:px-4 py-2 rounded-lg text-sm font-bold transition-all ${category === "hours" ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                Most Hours
              </button>
              <button
                onClick={() => setCategory("events")}
                className={`flex-1 md:px-4 py-2 rounded-lg text-sm font-bold transition-all ${category === "events" ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                Most Events
              </button>
          </div>
        </div>

        {currentUserRank && (
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-900 text-white rounded-2xl p-4 mb-8 shadow-lg flex items-center justify-between transform hover:scale-[1.01] transition-all">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full backdrop-blur-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="font-semibold text-lg">Your Current Rank</p>
            </div>
            <div className="text-right">
               <p className="text-3xl font-black drop-shadow-md">#{currentUserRank}</p>
               <p className="text-xs uppercase tracking-wider opacity-80 font-bold">
                 {category === "hours" ? `${users[currentUserIndex].totalHours} hrs` : `${users[currentUserIndex].totalEvents} evts`}
               </p>
            </div>
          </div>
        )}

        {users.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-800/90 backdrop-blur-xl rounded-[2rem] border border-gray-100 dark:border-slate-700/50 shadow-sm">
            <div className="text-4xl mb-3">🌟</div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">No activity found</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Check back later or change the filters!</p>
          </div>
        ) : (
          <>
            {top3.length > 0 && (
              <div className="flex justify-center items-end gap-2 md:gap-4 mb-10 pt-8 px-2 md:px-8 h-64">
                {top3.length > 1 && renderPodiumCard(top3[1], 2)}
                {top3.length > 0 && renderPodiumCard(top3[0], 1)}
                {top3.length > 2 && renderPodiumCard(top3[2], 3)}
              </div>
            )}

            {restUsers.length > 0 && (
              <div className="bg-white dark:bg-slate-800/90 backdrop-blur-xl rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.2)] border border-gray-100 dark:border-slate-700/50 p-3 sm:p-5 overflow-hidden space-y-2">
                {restUsers.map((user, idx) => {
                  const actualRank = idx + 4;
                  return (
                    <div
                      key={user._id}
                      className="flex items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all hover:-translate-y-0.5 hover:shadow-md bg-gray-50 dark:bg-slate-800/50 text-gray-700 dark:text-gray-300 border-gray-100 dark:border-slate-700/50"
                    >
                      <div className="flex items-center gap-4 sm:gap-6">
                        <div className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white dark:bg-slate-700 font-bold text-lg sm:text-xl shrink-0 text-gray-500 dark:text-gray-400">
                          #{actualRank}
                        </div>

                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-slate-700 hidden sm:flex items-center justify-center">
                              {user.avatar ? (
                                <img src={`http://localhost:5000${user.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-sm font-bold">{user.name.charAt(0)}</span>
                              )}
                           </div>
                           <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100 line-clamp-1">
                             {user.name}
                           </h3>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-extrabold text-xl sm:text-2xl tracking-tight text-indigo-600 dark:text-indigo-400">
                          {category === "hours" ? user.totalHours : user.totalEvents}
                        </div>
                        <div className="text-xs sm:text-sm font-semibold uppercase tracking-wider opacity-70">
                          {category === "hours" ? "Hours" : "Events"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Leaderboard;