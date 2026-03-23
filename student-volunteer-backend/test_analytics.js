const mongoose = require('mongoose');
const User = require('./models/User');
const axios = require('axios');

async function checkAnalytics() {
  require('dotenv').config();
  await mongoose.connect(process.env.MONGO_URI);

  // Get or create an admin user
  let admin = await User.findOne({ role: "admin" });
  if (!admin) {
    console.log("No admin found, creating one for test...");
    admin = new User({ name: "Admin Test", email: "admin2@test.com", password: "123", role: "admin" });
    await admin.save();
  }

  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

  console.log("Accessing /analytics API...");
  try {
    const start = Date.now();
    const res = await axios.get("http://localhost:5000/api/events/analytics", {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Success! Data:", res.data);
    console.log(`Time taken: ${Date.now() - start}ms`);
  } catch (err) {
    console.log("API Error:", err.response ? err.response.data : err.message);
  }

  process.exit();
}

checkAnalytics();
