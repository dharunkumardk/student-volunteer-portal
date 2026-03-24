import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import API from "../utils/axiosInstance";
import { useTheme } from "../context/ThemeContext";
import { useNotifications } from "../context/NotificationContext";
import NotificationDropdown from "./NotificationDropdown";
import { BellIcon, SunIcon, MoonIcon, UserCircleIcon, ArrowRightOnRectangleIcon, ComputerDesktopIcon } from "@heroicons/react/24/outline";

function Navbar() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { unreadCount } = useNotifications();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const profileRef = useRef(null);

  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  // Decode role safely
  let role = null;
  let decoded = null;
  if (token) {
    try {
      decoded = jwtDecode(token);
      role = decoded.role;
    } catch (e) {
      console.error("Invalid token");
    }
  }

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await API.get(`/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserProfile(response.data);
      } catch (err) {
        console.error("Failed to fetch user profile for navbar", err);
      }
    };
    if (token) fetchUser();
  }, [token]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileOpen]);

  // Early return comes AFTER all hooks
  if (!token) return null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleThemeToggle = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  return (
    <nav className="sticky top-0 z-50 glass dark:glass-dark text-gray-800 dark:text-gray-200 px-8 py-4 flex justify-between items-center transition-all duration-300 border-x-0 border-t-0 rounded-none">
      
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-indigo-200 shadow-lg text-white font-bold text-xl">
          V
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Volunteer Portal
        </h1>
      </div>

      <div className="flex items-center gap-6 text-sm">
        <Link to="/dashboard" className="font-medium text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:-translate-y-0.5 transition-all duration-200">
          Dashboard
        </Link>
        <Link to="/leaderboard" className="font-medium text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:-translate-y-0.5 transition-all duration-200">
          Leaderboard
        </Link>
        {(role === "student" || role === "organizer") && (
          <Link to="/profile" className="font-medium text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:-translate-y-0.5 transition-all duration-200">
            Profile
          </Link>
        )}

        {role === "organizer" && (
          <Link to="/create-event" className="font-medium text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:-translate-y-0.5 transition-all duration-200">
            Create Event
          </Link>
        )}

        {role === "admin" && (
          <>
            <Link to="/admin" className="font-medium text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:-translate-y-0.5 transition-all duration-200">
              Admin Panel
            </Link>
            <Link to="/analytics" className="font-medium text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:-translate-y-0.5 transition-all duration-200">
              Analytics
            </Link>
          </>
        )}
        {role === "student" && (
          <Link to="/scan-qr" className="font-medium text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:-translate-y-0.5 transition-all duration-200">
            Scan QR
          </Link>
        )}
        <div className="border-l border-gray-300 dark:border-gray-700 h-6 mx-2 hidden sm:block"></div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsProfileOpen(false);
            }}
            className="p-2.5 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors relative"
          >
            <BellIcon className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
            )}
          </button>
          
          <NotificationDropdown isOpen={isNotifOpen} setIsOpen={setIsNotifOpen} />
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotifOpen(false);
            }}
            className="flex items-center gap-2 focus:outline-none rounded-full ring-2 ring-transparent hover:ring-indigo-500/30 transition-all ml-1"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-slate-700 border-2 border-white dark:border-slate-800 shadow-sm shrink-0 flex items-center justify-center">
              {userProfile?.avatar ? (
                <img src={`${process.env.REACT_APP_BACKEND_URL}${userProfile.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-bold text-gray-500 dark:text-slate-400">
                  {userProfile?.name?.charAt(0).toUpperCase() || decoded.role.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 z-50 overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-200">
              
              <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {userProfile?.name || "User"}
                </p>
                <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mt-0.5">
                  {decoded.role}
                </p>
              </div>

              <div className="py-1">
                {(role === "student" || role === "organizer") && (
                  <Link
                    to="/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <UserCircleIcon className="w-5 h-5 text-gray-400" />
                    My Profile
                  </Link>
                )}

                <div className="px-4 py-2.5 flex items-center justify-between group hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer" onClick={handleThemeToggle}>
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {theme === "light" ? <SunIcon className="w-5 h-5 text-amber-500" /> : theme === "dark" ? <MoonIcon className="w-5 h-5 text-indigo-400" /> : <ComputerDesktopIcon className="w-5 h-5 text-gray-400" />}
                    Theme
                  </div>
                  <span className="text-xs font-semibold bg-gray-100 dark:bg-slate-900 px-2 py-1 rounded-md text-gray-500 dark:text-gray-400 capitalize">
                    {theme}
                  </span>
                </div>
              </div>

              <div className="pt-1 border-t border-gray-100 dark:border-slate-700">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;