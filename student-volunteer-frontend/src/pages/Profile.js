import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Activity, ShieldCheck, AlertTriangle, CheckCircle, Clock } from "lucide-react";

function Profile() {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const [user, setUser] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState("");
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editDetails, setEditDetails] = useState({ phone: "", dob: "", bloodGroup: "", idProof: null });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/auth/me",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUser(response.data);
      setEditNameValue(response.data.name);
    } catch (error) {
      console.log(error);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);
    setIsUploading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/auth/upload-avatar", formData, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } });
      setUser(response.data.user);
    } catch (error) {
      alert("Failed to upload avatar.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!window.confirm("Are you sure you want to remove your avatar?")) return;
    try {
      const response = await axios.put("http://localhost:5000/api/auth/remove-avatar", {}, { headers: { Authorization: `Bearer ${token}` } });
      setUser(response.data.user);
    } catch (error) {}
  };

  const handleUpdateName = async () => {
    if (!editNameValue.trim()) return;
    setIsUpdatingName(true);
    try {
      const response = await axios.put("http://localhost:5000/api/auth/update-name", { name: editNameValue }, { headers: { Authorization: `Bearer ${token}` } });
      setUser(response.data.user);
      setIsEditingName(false);
    } catch (error) {
      alert("Failed to update name.");
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    const payload = new FormData();
    if (editDetails.phone) payload.append("phone", editDetails.phone);
    if (editDetails.dob) payload.append("dob", editDetails.dob);
    if (editDetails.bloodGroup) payload.append("bloodGroup", editDetails.bloodGroup);
    if (editDetails.idProof) payload.append("idProof", editDetails.idProof);
    try {
      const response = await axios.put("http://localhost:5000/api/auth/update-profile", payload, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } });
      setUser({ ...user, ...response.data.user });
      setIsEditingDetails(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update profile details.");
    }
  };

  if (!user) return <div className="p-10 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 transition-colors duration-300">
      <Navbar />

      <div className="max-w-7xl mx-auto p-4 sm:p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT COLUMN: Profile & Details */}
          <div className="w-full lg:w-1/3 flex flex-col gap-8">
            <div className="bg-white dark:bg-slate-800/90 backdrop-blur-xl rounded-[2rem] shadow-sm p-8 border border-gray-100 dark:border-slate-700/50">
              <div className="flex flex-col items-center sm:items-start gap-6">
                <div className="relative group mx-auto sm:mx-0">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-slate-700 border-4 border-white dark:border-slate-800 shadow-md shrink-0 flex items-center justify-center">
                    {user.avatar ? (
                      <img src={`http://localhost:5000${user.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl font-bold text-gray-400 dark:text-slate-500">{user.name?.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity backdrop-blur-sm">
                    <span className="text-xs font-semibold">{isUploading ? "Uploading..." : user.avatar ? "Change" : "Upload"}</span>
                    <input type="file" accept="image/png, image/jpeg, image/jpg" className="hidden" onChange={handleAvatarChange} disabled={isUploading} />
                  </label>
                  {user.avatar && (
                    <button onClick={handleRemoveAvatar} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100"><XMarkIcon className="w-4 h-4" /></button>
                  )}
                </div>
                
                <div className="text-center sm:text-left w-full">
                  {isEditingName ? (
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                      <input type="text" value={editNameValue} onChange={(e) => setEditNameValue(e.target.value)} className="w-full max-w-[200px] px-3 py-1.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none" autoFocus />
                      <button onClick={handleUpdateName} disabled={isUpdatingName} className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg"><CheckIcon className="w-5 h-5" /></button>
                      <button onClick={() => { setIsEditingName(false); setEditNameValue(user.name); }} className="p-1.5 bg-gray-100 text-gray-500 rounded-lg"><XMarkIcon className="w-5 h-5" /></button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center sm:justify-start gap-3">
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white truncate">{user.name}</h2>
                      <button onClick={() => setIsEditingName(true)} className="text-gray-400 hover:text-indigo-500"><PencilIcon className="w-4 h-4" /></button>
                    </div>
                  )}
                  <p className="text-indigo-600 dark:text-indigo-400 font-medium capitalize mt-1">{user.role}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 truncate">{user.email}</p>
                </div>
              </div>

              <div className="mt-8">
                <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Total Verified Hours</p>
                <p className="text-4xl font-black text-indigo-600 dark:text-indigo-400">
                  {user.totalHours} <span className="text-lg font-semibold text-gray-400">hrs</span>
                </p>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-700">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="text-lg font-bold text-gray-900 dark:text-white">Personal Details</h3>
                   <button onClick={() => { setEditDetails({ phone: user.phone || "", dob: user.dob ? user.dob.split('T')[0] : "", bloodGroup: user.bloodGroup || "", idProof: null }); setIsEditingDetails(true); }} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                     Edit Details
                   </button>
                </div>
                
                {(user.role === "student" || user.role === "organizer") && (
                  <div className="space-y-3">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-500 uppercase">Phone</span>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{user.phone || "--"}</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-500 uppercase">DOB</span>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {user.dob ? new Date(user.dob).toLocaleDateString() : "--"}
                      </span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-500 uppercase">Blood</span>
                      <span className="text-sm font-bold text-red-500">{user.bloodGroup || "--"}</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-500 uppercase">ID Proof</span>
                      {user.idProof ? (
                        <a href={`http://localhost:5000${user.idProof}`} target="_blank" rel="noreferrer" className="text-indigo-600 text-sm font-bold hover:underline">
                          View Doc
                        </a>
                      ) : (
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">--</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Joined Events List */}
            <div className="bg-white dark:bg-slate-800/90 backdrop-blur-xl rounded-[2rem] shadow-sm p-6 border border-gray-100 dark:border-slate-700/50">
              <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">
                📅 My Events
              </h3>
              {(!user.joinedEvents || user.joinedEvents.length === 0) ? (
                <p className="text-gray-500 text-sm">No events joined yet.</p>
              ) : (
                <div className="space-y-3">
                  {user.joinedEvents.map(event => (
                    <div key={event._id} className="border-b dark:border-slate-700 pb-2">
                      <p className="text-slate-800 dark:text-slate-200 font-semibold text-sm line-clamp-1">{event.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {event.hoursDistributed ? "Completed" : "Pending"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Stats & Charts */}
          <div className="w-full lg:w-2/3 flex flex-col gap-8">
            
            {/* TOP STATS & CREDIBILITY GRID */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-800/90 backdrop-blur-xl p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700/50 flex flex-col justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Credibility</p>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-black text-slate-800 dark:text-white">{user.credibilityScore}</span>
                    <span className="text-sm font-bold text-gray-400 mb-1">/ 100</span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg font-bold text-xs ${
                    user.credibilityScore >= 80 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                    user.credibilityScore >= 50 ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
                    'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                  }`}>
                    {user.credibilityScore >= 80 ? "Reliable" : user.credibilityScore >= 50 ? "Average" : "Risky"}
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div className={`h-full rounded-full ${user.credibilityScore >= 80 ? 'bg-emerald-500' : user.credibilityScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${user.credibilityScore}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-5 rounded-3xl shadow-lg shadow-indigo-500/20 flex flex-col justify-between">
                <div>
                  <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-1">Completed</p>
                  <span className="text-4xl font-black">{user.completedEventsCount}</span>
                </div>
                <div className="mt-4 inline-flex items-center gap-2 font-bold text-xs bg-white/20 backdrop-blur-sm self-start px-2 py-1 rounded-lg">
                  <CheckCircle className="w-3.5 h-3.5" /> Total Events
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white p-5 rounded-3xl shadow-lg shadow-teal-500/20 flex flex-col justify-between">
                <div>
                  <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider mb-1">Missed</p>
                  <span className="text-4xl font-black">{user.missedEventsCount}</span>
                </div>
                <div className="mt-4 inline-flex items-center gap-2 font-bold text-xs bg-white/20 backdrop-blur-sm self-start px-2 py-1 rounded-lg">
                  <AlertTriangle className="w-3.5 h-3.5" /> Needs Focus
                </div>
              </div>
            </div>

            {/* IMPACT CHART AND TIMELINE GRID */}
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-6 flex-1">
              
              <div className="bg-white dark:bg-slate-800/90 backdrop-blur-xl rounded-[2rem] shadow-sm p-6 lg:p-8 border border-gray-100 dark:border-slate-700/50 flex flex-col min-h-[350px]">
                <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-500" /> Impact Overview
                </h3>
                <div className="flex-1 w-full">
                  {user.monthlyStats && user.monthlyStats.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={user.monthlyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} itemStyle={{ color: '#4f46e5', fontWeight: 'bold' }} />
                        <Area type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center"><p className="text-gray-500 text-sm">Not enough data to display chart.</p></div>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800/90 backdrop-blur-xl rounded-[2rem] shadow-sm p-6 lg:p-8 border border-gray-100 dark:border-slate-700/50 flex flex-col min-h-[350px]">
                <h3 className="text-lg font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-500" /> Recent Activity
                </h3>
                <div className="relative pl-4 border-l-2 border-indigo-100 dark:border-slate-700/80 space-y-6 flex-1 overflow-y-auto max-h-[300px] pr-2">
                  {user.activities && user.activities.length > 0 ? (
                    user.activities.map((activity, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[23px] top-1 rounded-full bg-white dark:bg-slate-800 p-0.5 border-2 border-indigo-500">
                          <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                        </div>
                        <div>
                          <p className="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold uppercase mb-0.5">
                            {new Date(activity.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">{activity.description}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-xs italic py-2">No recent activity detected.</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Edit Details Modal */}
        {isEditingDetails && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-[2rem] p-6 shadow-2xl relative">
              <button onClick={() => setIsEditingDetails(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <XMarkIcon className="w-6 h-6" />
              </button>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">Update Details</h2>
              <form onSubmit={handleUpdateDetails} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                  <input type="text" value={editDetails.phone} onChange={(e) => setEditDetails({...editDetails, phone: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
                  <input type="date" value={editDetails.dob} onChange={(e) => setEditDetails({...editDetails, dob: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Blood Group</label>
                  <select value={editDetails.bloodGroup} onChange={(e) => setEditDetails({...editDetails, bloodGroup: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none">
                    <option value="">Select</option>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">ID Document <span className="text-gray-400 font-normal">(Optional)</span></label>
                   <input type="file" accept=".pdf, image/*" onChange={(e) => setEditDetails({...editDetails, idProof: e.target.files[0]})} className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:bg-indigo-100 file:text-indigo-700" />
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl mt-4 active:scale-95 transition-all text-sm">Save Changes</button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Profile;