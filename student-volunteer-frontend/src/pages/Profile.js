import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

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
      const response = await axios.post(
        "http://localhost:5000/api/auth/upload-avatar",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      // Update local user state with the new avatar path
      setUser(response.data.user);
    } catch (error) {
      console.error("Avatar upload failed", error);
      alert("Failed to upload avatar. Check file size/type.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!window.confirm("Are you sure you want to remove your avatar?")) return;
    
    try {
      const response = await axios.put(
        "http://localhost:5000/api/auth/remove-avatar",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUser(response.data.user);
    } catch (error) {
      console.error("Failed to remove avatar", error);
    }
  };

  const handleUpdateName = async () => {
    if (!editNameValue.trim()) return;
    
    setIsUpdatingName(true);
    try {
      const response = await axios.put(
        "http://localhost:5000/api/auth/update-name",
        { name: editNameValue },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUser(response.data.user);
      setIsEditingName(false);
    } catch (error) {
      console.error("Failed to update name", error);
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
      const response = await axios.put("http://localhost:5000/api/auth/update-profile", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      setUser({ ...user, ...response.data.user });
      setIsEditingDetails(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update profile details.");
    }
  };

  if (!user) return <div className="p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 transition-colors duration-300">
      <Navbar />

      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 mb-8">
          
          <div className="flex flex-col sm:flex-row items-center sm:justify-start gap-6 mb-8">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-slate-700 border-4 border-white dark:border-slate-800 shadow-lg shrink-0 flex items-center justify-center">
                {user.avatar ? (
                  <img src={`http://localhost:5000${user.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-gray-400 dark:text-slate-500">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              
              <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity backdrop-blur-sm">
                <span className="text-xs font-semibold">{isUploading ? "Uploading..." : user.avatar ? "Change" : "Upload"}</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={isUploading}
                />
              </label>

              {user.avatar && (
                <button
                  onClick={handleRemoveAvatar}
                  className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition-transform hover:scale-110 opacity-0 group-hover:opacity-100"
                  title="Remove Avatar"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="text-center sm:text-left">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{user.name}</h2>
              <p className="text-indigo-600 dark:text-indigo-400 font-medium capitalize mt-1 text-lg">{user.role}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-gray-100 dark:border-slate-700">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-1 uppercase tracking-wider font-semibold">Name</p>
              
              {isEditingName ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={editNameValue}
                    onChange={(e) => setEditNameValue(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                    autoFocus
                  />
                  <button
                    onClick={handleUpdateName}
                    disabled={isUpdatingName}
                    className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                  >
                    <CheckIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingName(false);
                      setEditNameValue(user.name);
                    }}
                    className="p-1.5 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">{user.name}</p>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-gray-400 hover:text-indigo-500 transition-colors"
                    title="Edit Name"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-1 uppercase tracking-wider font-semibold">Email</p>
              <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">{user.email}</p>
            </div>

            <div className="md:col-span-2">
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-1 uppercase tracking-wider font-semibold">Total Verified Hours</p>
              <p className="text-4xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                {user.totalHours} <span className="text-xl font-semibold text-gray-400">hrs</span>
              </p>
            </div>
            
            <div className="md:col-span-2 pt-6 border-t border-gray-100 dark:border-slate-700 flex justify-between items-center">
               <h3 className="text-xl font-bold text-gray-900 dark:text-white">Personal Details</h3>
               <button 
                  onClick={() => {
                    setEditDetails({ 
                      phone: user.phone || "", 
                      dob: user.dob ? user.dob.split('T')[0] : "", 
                      bloodGroup: user.bloodGroup || "",
                      idProof: null
                    });
                    setIsEditingDetails(true);
                  }}
                  className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-xl"
               >
                 ✎ Edit Details
               </button>
            </div>
            
            {user.role === "student" && (
              <>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700/50">
                  <p className="text-gray-500 dark:text-gray-400 text-xs mb-1 uppercase tracking-wider font-bold">Phone Number</p>
                  <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">{user.phone || "Not Provided"}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700/50">
                  <p className="text-gray-500 dark:text-gray-400 text-xs mb-1 uppercase tracking-wider font-bold">Date of Birth</p>
                  <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                    {user.dob ? new Date(user.dob).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : "Not Provided"}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700/50">
                  <p className="text-gray-500 dark:text-gray-400 text-xs mb-1 uppercase tracking-wider font-bold">Blood Group</p>
                  <p className="text-lg font-bold text-red-500 dark:text-red-400">{user.bloodGroup || "Not Provided"}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700/50">
                  <p className="text-gray-500 dark:text-gray-400 text-xs mb-1 uppercase tracking-wider font-bold">ID Document</p>
                  {user.idProof ? (
                    <a href={`http://localhost:5000${user.idProof}`} target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold inline-flex items-center gap-1 mt-1">
                      📄 View Saved Document
                    </a>
                  ) : (
                    <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">Not Uploaded</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Edit Details Modal */}
        {isEditingDetails && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl p-8 shadow-2xl relative shadow-indigo-900/20">
              <button 
                onClick={() => setIsEditingDetails(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Update Personal Details</h2>
              <form onSubmit={handleUpdateDetails} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                    <input 
                      type="text" 
                      value={editDetails.phone} 
                      onChange={(e) => setEditDetails({...editDetails, phone: e.target.value})} 
                      className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
                    <input 
                      type="date" 
                      value={editDetails.dob} 
                      onChange={(e) => setEditDetails({...editDetails, dob: e.target.value})} 
                      className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Blood Group</label>
                    <select
                      value={editDetails.bloodGroup}
                      onChange={(e) => setEditDetails({...editDetails, bloodGroup: e.target.value})}
                      className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    >
                      <option value="">Select Group</option>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Update ID Document <span className="text-xs text-gray-400 font-normal ml-1">(Optional)</span></label>
                    <input 
                      type="file" 
                      accept=".pdf, image/*"
                      onChange={(e) => setEditDetails({...editDetails, idProof: e.target.files[0]})} 
                      className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none text-sm file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-100 file:text-indigo-700"
                    />
                  </div>
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl mt-6 transition-all active:scale-[0.98] shadow-md shadow-indigo-200 dark:shadow-none">
                  Save Changes
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-r from-green-500 to-green-700 dark:from-green-600 dark:to-green-900 text-white p-6 rounded-xl shadow">
            <h3 className="text-lg">Total Events Participated</h3>
            <p className="text-3xl font-bold">
              {user.totalParticipatedEvents}
            </p>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-700 dark:from-purple-600 dark:to-purple-900 text-white p-6 rounded-xl shadow">
            <h3 className="text-lg">Completed Events</h3>
            <p className="text-3xl font-bold">
              {user.completedEventsCount}
            </p>
          </div>
        </div>

        {/* Joined Events List */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">
          <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
            📅 My Events
          </h3>

          {(!user.joinedEvents || user.joinedEvents.length === 0) ? (
            <p className="text-gray-500 dark:text-gray-400">No events joined yet.</p>
          ) : (
            user.joinedEvents.map(event => (
              <div
                key={event._id}
                className="border-b dark:border-slate-700 py-3 flex justify-between"
              >
                <span className="text-slate-800 dark:text-slate-200">{event.title}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {event.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;