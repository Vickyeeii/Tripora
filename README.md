# Tripora

A QR-Based Digital Heritage Platform with Local Event Display and Visitor Feedback System

## 📋 Abstract

Many of Kerala's smaller heritage sites—temples, forts, and traditional homes—remain undocumented and disconnected from digital tourism initiatives. Visitors who reach these places often find no verified information, signage, or cultural context. Tripora aims to bridge this information gap by providing a simple, interactive web platform that connects the Tourism Department, local guides, and tourists through verified digital records and QR-based access.

This project functions as a **Lightweight Digital Heritage Directory**, not a large tourism portal. It provides an end-to-end system from heritage registration and QR generation to visitor feedback, making cultural discovery accessible and measurable.

---

## 👥 User Roles & Permissions

The system operates using role-based access control, where each type of user contributes according to defined permissions:

### 🛡️ Admin (Tourism Officer)
- Approves local guides
- Edits/updates heritage information
- Generates QR codes
- Manages cultural events and announcements
- Reviews visitor feedback to improve site maintenance
- Disables inaccurate/outdated heritage entries

### 🗺️ Local Guide
- Adds new heritage information (history, photos, map)
- Updates or corrects information when needed
- Adds cultural events/rituals/festival announcements
- Posts event cancellations and safety warnings
- Views visitor feedback related to their uploaded sites

### 🧳 Tourist
- Scans QR codes to view heritage information
- Explores history/photos/cultural details and map location
- Views today/tomorrow's cultural events
- Submits ratings and feedback without logging in
- Reports issues/complaints
- Receives suggestions for nearby heritage spots
- Manages tourist queues during peak visiting hours

---

## 🏗️ Core Modules

The system consists of six core modules that together form a complete, working MVP:

### 1. 🔐 Secure Authentication
Authorized users (tourism officers and local guides) log in using verified credentials to prevent unauthorized content uploads.

### 2. 🏛️ Heritage Site Management
Admins and verified contributors can add, edit, or delete heritage site entries containing:
- Site name
- Photos
- Short history
- Map location

### 3. 📱 QR Code Generation
Each heritage entry automatically generates a unique QR code that can be printed and installed at the physical site for tourists to scan.

### 4. 📅 Event Whiteboard
A real-time board displays today's and tomorrow's cultural or tourism-related events added by verified users, improving visitor engagement.

### 5. ⭐ Visitor Feedback & Rating System
After scanning the QR, tourists can:
- Rate the site (1-5 stars)
- Submit short feedback without logging in
- View average ratings publicly
- See ratings summarized in admin analytics

### 6. 📊 Admin Dashboard & Reports
Displays:
- Total heritage sites
- Event statistics
- Top-rated locations

This helps tourism officers identify which sites attract the most interest.

---

## 🎯 Project Goals

By combining digital signage, local event updates, and real visitor feedback, Tripora:
- ✅ Promotes micro-tourism
- ✅ Preserves Kerala's heritage identity
- ✅ Provides a structured yet minimal model for interactive cultural documentation

---

## 💻 Technology Stack

### Frontend
- **React (Vite)** — Fast and modern build tool
- **Tailwind CSS** — Mobile-friendly UI with utility-first styling

### Backend
- **FastAPI** — Fast, secure API with role-based access control

### Database
- **PostgreSQL** — Reliable relational data storage

### Libraries & APIs
- **Python qrcode** — QR code generation
- **Chart.js** — Analytics and data visualization
- **Leaflet Maps API** — Interactive maps and navigation

---

## 📁 Project Structure

```
Tripora/
├── backend/          # FastAPI backend application
│   ├── app/         # Main application code
│   ├── auth/        # Authentication modules
│   ├── middleware/  # Database and other middleware
│   └── alembic/     # Database migrations
├── frontend/        # React (Vite) frontend application
├── Docs/            # Project documentation
└── README.md        # This file
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL 12+

### Backend Setup
1. Navigate to the backend directory
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set up database migrations:
   ```bash
   alembic upgrade head
   ```
4. Run the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup
1. Navigate to the frontend directory
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

## 📝 License

See [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

This project is part of a college project for digital heritage preservation in Kerala. Contributions and feedback are welcome!

---

## 📧 Contact

For questions or support regarding this project, please refer to the project documentation in the `Docs/` directory.

