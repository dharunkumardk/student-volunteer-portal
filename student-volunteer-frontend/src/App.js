import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateEvent from "./pages/CreateEvent";
import CompleteProfile from "./pages/CompleteProfile";
import AdminPanel from "./pages/AdminPanel";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";
import ScanQR from "./pages/ScanQR";


import EditEvent from "./pages/EditEvent";
import EventDetails from "./pages/EventDetails";
import Notifications from "./pages/Notifications";
import VerifyOTP from "./pages/VerifyOtp";
function App() {
  return (
    <Router>
       <h1 className="text-3xl font-bold text-blue-600">
</h1>
      <Routes>
       
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/create-event" element={<CreateEvent />} />
        <Route path="/edit-event/:eventId" element={<EditEvent />} />
        <Route path="/event/:eventId" element={<EventDetails />} />
        <Route path="/admin" element={<AdminPanel />} />   
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/profile" element={<Profile />} />  
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/scan-qr" element={<ScanQR />} />
        <Route path="/notifications" element={<Notifications />} />
        
        <Route path="/verify-otp" element={<VerifyOTP />} />
      </Routes>
    </Router>
  );
}

export default App;