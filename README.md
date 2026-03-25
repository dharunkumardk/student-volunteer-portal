<div align="center">

# 🌟 Student Volunteer Platform

**A modern, full-stack web application designed to connect students with meaningful community events and automatically track their volunteer impact.**

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

</div>

## 🚀 Project Overview

This platform serves as a centralized hub bridging the gap between **Event Organizers** and passionate **Student Volunteers**. Organizers can seamlessly publish and manage community drives, while students can join events, earn verified community service hours, and climb the public volunteer leaderboard.

### 🔥 Key Features

* **Role-Based Access Control:** Distinct experiences for `students`, `organizers`, and system `admins` utilizing secure JWT middleware.
* **Smart Profiles & Credibility Scores:** A dynamic `0-100` credibility rating based on the user's ratio of completed vs. missed events. Profiles also showcase graphical `Recharts` visualizations tracking monthly impact history.
* **Activity Timeline:** Automatically records timestamps and interactions whenever a user joins a drive, completes an event, or earns verified hours.
* **Dynamic Podium Leaderboards:** View the top volunteers locally with visual top 3 podium placements and active filters for `This Week`, `This Month`, `All Time`, sorted by `Most Events` or `Most Hours`.
* **Secure Onboarding:** Encrypted credentials via `Bcrypt`, email verification (OTP) via `Nodemailer`, and enforced profile completeness guards on the backend before any events can be created.
* **Glassmorphism Aesthetic:** A stunning, premium frontend UI featuring layered glow effects, dark/light transitions, and micro-interactions optimized with TailwindCSS.

---

## 🛠️ Architecture & Tech Stack

**Frontend (`student-volunteer-frontend`)**
- **Framework:** React.js
- **Styling:** Tailwind CSS
- **Icons & Data Visualization:** Lucide-react, Recharts
- **Network:** Axios (Centralized dynamic instance)

**Backend (`student-volunteer-backend`)**
- **Runtime & Framework:** Node.js, Express.js
- **Database ODM:** MongoDB & Mongoose
- **Security:** JSON Web Tokens (JWT), Bcryptjs
- **File Handling:** Multer (Local file parsing for avatars/ID proofs)

---

## ⚙️ Installation & Local Setup

Follow these steps to run the platform locally on your machine.

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/student-volunteer-portal.git
cd student-volunteer-portal
```

### 2. Backend Setup
Navigate into the backend directory and install the Node dependencies:
```bash
cd student-volunteer-backend
npm install
```
Create a `.env` file in the root of the `student-volunteer-backend` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_cluster_connection_string
JWT_SECRET=your_super_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
```
Run the backend server in development mode:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal tab, navigate into the frontend directory, and install its dependencies:
```bash
cd student-volunteer-frontend
npm install
```
Create a `.env` file in the root of the `student-volunteer-frontend` directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_BACKEND_URL=http://localhost:5000
```
Boot up the React frontend:
```bash
npm start
```

---

## ☁️ Deployment Guide (Render & Vercel/Netlify)

### Backend (Render)
1. Connect your repository to Render as a **Web Service**.
2. **Root Directory:** `student-volunteer-backend`
3. **Build Command:** `npm install`
4. **Start Command:** `npm start`
5. Add your `.env` variables in Render's environment panel.

### Frontend (Vercel / Netlify / Render Static Site)
1. Connect your repository.
2. **Root Directory:** `student-volunteer-frontend`
3. **Build Command:** `npm run build`
4. **Publish Directory:** `build`
5. Crucially, **override your environment variables** so the frontend talks to your newly deployed live backend:
   * `REACT_APP_API_URL` = `https://your-render-backend-url.onrender.com/api`
   * `REACT_APP_BACKEND_URL` = `https://your-render-backend-url.onrender.com`

---

## 🧪 Demo Data
The backend includes a useful seeder script to populate your database with dummy users, dynamic historical activity tracking logs, and pre-completed events to easily visualize advanced profile interactions.
```bash
cd student-volunteer-backend
node seedDemo.js
```
*This will auto-generate demo accounts logging exact credentials directly to your terminal console.*

---

<div align="center">

**Built with ❤️ for student communities everywhere.**

</div>
