import { useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { useNotifications } from "../context/NotificationContext";
import { CheckIcon, BellIcon, CalendarIcon, InformationCircleIcon, UserIcon, TrashIcon } from "@heroicons/react/24/outline";

function Notifications() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, refreshNotifications } = useNotifications();

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  const getIcon = (type) => {
    switch (type) {
      case "event_created":
      case "event_updated":
        return <CalendarIcon className="w-6 h-6 text-indigo-500" />;
      case "event_cancelled":
        return <TrashIcon className="w-6 h-6 text-rose-500" />;
      case "student_joined":
      case "student_left":
        return <UserIcon className="w-6 h-6 text-emerald-500" />;
      case "attendance_marked":
        return <CheckIcon className="w-6 h-6 text-amber-500" />;
      default:
        return <InformationCircleIcon className="w-6 h-6 text-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
              <BellIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              Your Notifications
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
              Stay updated with your latest event activities and alerts.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 px-4 py-2 rounded-xl font-semibold transition-colors flex items-center gap-2"
            >
              <CheckIcon className="w-5 h-5" />
              Mark all as read
            </button>
          )}
        </div>

        {/* List */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors duration-300">
          {notifications.length === 0 ? (
            <div className="px-6 py-20 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                <BellIcon className="w-10 h-10 text-gray-300 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">You're all caught up!</h3>
              <p className="text-gray-500 dark:text-gray-400 font-medium">No new notifications to display right now.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-slate-700/50">
              {notifications.map((notif) => (
                <li
                  key={notif._id}
                  onClick={() => {
                    if (!notif.isRead) markAsRead(notif._id);
                  }}
                  className={`p-6 sm:p-8 transition-colors ${
                    !notif.isRead 
                      ? "bg-indigo-50/30 dark:bg-indigo-900/10 cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20" 
                      : "bg-white dark:bg-slate-800"
                  }`}
                >
                  <div className="flex gap-5">
                    <div className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${
                      !notif.isRead ? "bg-white dark:bg-slate-800 shadow-indigo-100 dark:shadow-indigo-900/20" : "bg-gray-50 dark:bg-slate-700/50"
                    }`}>
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <p className={`text-base sm:text-lg ${
                        !notif.isRead 
                          ? "text-gray-900 dark:text-white font-bold" 
                          : "text-gray-600 dark:text-gray-300 font-medium"
                      }`}>
                        {notif.message}
                      </p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1.5 font-medium flex items-center gap-1.5">
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <div className="shrink-0 flex items-center">
                         <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50"></div>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}

export default Notifications;
