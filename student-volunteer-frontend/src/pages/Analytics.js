import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

import {
  UsersIcon,
  CalendarIcon,
  ChartBarIcon,
  ClockIcon
} from "@heroicons/react/24/outline";

function Analytics() {

  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  const [data, setData] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/events/analytics",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setData(response.data);

    } catch (error) {
      console.log(error);
    }
  };

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center text-zinc-500 dark:text-zinc-400 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      Loading analytics...
    </div>
  );

  const statusData = [
    { name: "Upcoming", value: data.upcomingEvents },
    { name: "Completed", value: data.completedEvents },
  ];

  const summaryCards = [
    {
      title: "Total Users",
      value: data.totalUsers,
      icon: UsersIcon
    },
    {
      title: "Total Events",
      value: data.totalEvents,
      icon: CalendarIcon
    },
    {
      title: "Total Volunteers",
      value: data.totalVolunteers,
      icon: ChartBarIcon
    },
    {
      title: "Total Hours",
      value: data.totalHours,
      icon: ClockIcon
    }
  ];

  const COLORS = ["#6366F1", "#10B981"];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 pb-12 antialiased transition-colors duration-300">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-10">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Analytics Overview
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Monitor events, volunteers and participation metrics.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {summaryCards.map((card, index) => {
            const Icon = card.icon;
            // Provide alternating colors based on index for the icons
            const colorClasses = [
              "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-500 dark:text-indigo-400",
              "bg-blue-50 dark:bg-blue-900/40 text-blue-500 dark:text-blue-400",
              "bg-emerald-50 dark:bg-emerald-900/40 text-emerald-500 dark:text-emerald-400",
              "bg-amber-50 dark:bg-amber-900/40 text-amber-500 dark:text-amber-400"
            ];
            
            return (
              <div
                key={index}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 flex flex-col justify-between transition-all hover:shadow-md dark:hover:shadow-indigo-900/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {card.title}
                  </span>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses[index % colorClasses.length]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                  {card.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Pie Chart */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm p-8">
            <h3 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-slate-700 pb-4">
              Event Status Distribution
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  outerRadius={110}
                  label
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm p-8">
            <h3 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-slate-700 pb-4">
              Platform Metrics
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={summaryCards.map(card => ({
                  name: card.title,
                  value: card.value
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'}} />
                <Bar
                  dataKey="value"
                  fill="#6366F1"
                  radius={[6, 6, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Analytics;