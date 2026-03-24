import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useNotifications } from "../context/NotificationContext";
import { CheckIcon, BellIcon, CalendarIcon, InformationCircleIcon, UserIcon, TrashIcon } from "@heroicons/react/24/outline";

function NotificationDropdown({ isOpen, setIsOpen }) {
  const dropdownRef = useRef(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  const getIcon = (type) => {
    switch (type) {
      case "event_created":
      case "event_updated":
        return <CalendarIcon className="w-5 h-5 text-indigo-500" />;
      case "event_cancelled":
        return <TrashIcon className="w-5 h-5 text-rose-500" />;
      case "student_joined":
      case "student_left":
        return <UserIcon className="w-5 h-5 text-emerald-500" />;
      case "attendance_marked":
        return <CheckIcon className="w-5 h-5 text-amber-500" />;
      default:
        return <InformationCircleIcon className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-80 sm:w-96 glass dark:glass-dark rounded-[1.5rem] shadow-[0_10px_40px_rgb(0,0,0,0.08)] dark:shadow-[0_10px_40px_rgb(0,0,0,0.3)] border border-gray-100 dark:border-slate-700/50 z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
          Notifications
          {unreadCount > 0 && (
            <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 text-xs px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </h3>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
            <BellIcon className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-sm font-medium">No notifications yet</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50 dark:divide-slate-700/50">
            {notifications.map((notif) => (
              <li
                key={notif._id}
                onClick={() => {
                  if (!notif.isRead) markAsRead(notif._id);
                }}
                className={`p-4 transition-colors hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer ${
                  !notif.isRead ? "bg-indigo-50/30 dark:bg-indigo-900/10" : "bg-white dark:bg-slate-800"
                }`}
              >
                <div className="flex gap-3">
                  <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    !notif.isRead ? "bg-indigo-100 dark:bg-indigo-900/30" : "bg-gray-100 dark:bg-slate-700"
                  }`}>
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${
                      !notif.isRead 
                        ? "text-gray-900 dark:text-white font-semibold" 
                        : "text-gray-600 dark:text-gray-300 font-medium"
                    }`}>
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-medium flex items-center gap-1">
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <div className="shrink-0 w-2 h-2 mt-1.5 rounded-full bg-indigo-500 absolute right-4"></div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 text-center">
        <Link
          to="/notifications"
          onClick={() => setIsOpen(false)}
          className="text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors uppercase tracking-wider"
        >
          View All Activity
        </Link>
      </div>
    </div>
  );
}

export default NotificationDropdown;
