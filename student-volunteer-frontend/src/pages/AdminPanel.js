import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

function AdminPanel() {
  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchEvents();
  }, []);

  const fetchUsers = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/auth/all-users",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setUsers(res.data);
  };

  const fetchEvents = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/events",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setEvents(res.data);
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    await axios.delete(
      `http://localhost:5000/api/auth/delete-user/${id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    fetchUsers();
  };

  const deleteEvent = async (id) => {
    if (!window.confirm("Delete this event?")) return;

    await axios.delete(
      `http://localhost:5000/api/events/delete/${id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    fetchEvents();
  };

  const totalUsers = users.length;
  const totalEvents = events.length;
  const completedEvents = events.filter(
    (e) => e.status === "completed"
  ).length;
  const totalVolunteers = events.reduce(
    (sum, e) => sum + e.volunteers.length,
    0
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 pb-12 antialiased transition-colors duration-300">
      <Navbar />

      <div className="max-w-7xl mx-auto p-6 mt-8">
        {/* TITLE */}
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Admin Dashboard
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Platform statistics and management</p>
        </div>

        {/* STATISTICS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total Users</h4>
              <p className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">{totalUsers}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center text-indigo-500 text-2xl">
              👥
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total Events</h4>
              <p className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">{totalEvents}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/40 rounded-xl flex items-center justify-center text-blue-500 text-2xl">
              📅
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Completed Events</h4>
              <p className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">{completedEvents}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center text-emerald-500 text-2xl">
              ✅
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total Volunteers</h4>
              <p className="text-4xl font-extrabold text-amber-500 dark:text-amber-400">{totalVolunteers}</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/40 rounded-xl flex items-center justify-center text-amber-500 text-2xl">
              🤝
            </div>
          </div>
        </div>

        {/* USERS TABLE */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 mb-10 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Users Management</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="p-4 px-6">Name</th>
                  <th className="p-4 px-6">Email</th>
                  <th className="p-4 px-6">Role</th>
                  <th className="p-4 px-6">Hours</th>
                  <th className="p-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="p-4 px-6 font-medium text-gray-900 dark:text-gray-100">{user.name}</td>
                    <td className="p-4 px-6 text-gray-500 dark:text-gray-400">{user.email}</td>
                    <td className="p-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize
                        ${user.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400' : 
                          user.role === 'organizer' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400' : 
                          'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 px-6 text-gray-900 dark:text-gray-100 font-semibold">{user.totalHours}</td>
                    <td className="p-4 px-6 text-right">
                      <button
                        onClick={() => deleteUser(user._id)}
                        className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500 dark:text-gray-400">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* EVENTS TABLE */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Events Management</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="p-4 px-6">Title</th>
                  <th className="p-4 px-6">Date</th>
                  <th className="p-4 px-6">Organizer</th>
                  <th className="p-4 px-6 text-center">Volunteers</th>
                  <th className="p-4 px-6">Status</th>
                  <th className="p-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                {events.map((event) => (
                  <tr key={event._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="p-4 px-6 font-medium text-gray-900 dark:text-gray-100">{event.title}</td>
                    <td className="p-4 px-6 text-gray-500 dark:text-gray-400">{new Date(event.date).toLocaleDateString()}</td>
                    <td className="p-4 px-6 text-gray-500 dark:text-gray-400">{event.createdBy?.name || 'Unknown'}</td>
                    <td className="p-4 px-6 text-center font-semibold text-gray-900 dark:text-gray-100">
                      {event.volunteers.length}
                    </td>
                    <td className="p-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize
                        ${event.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-400'}`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="p-4 px-6 text-right">
                      <button
                        onClick={() => deleteEvent(event._id)}
                        className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {events.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500 dark:text-gray-400">No events found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;