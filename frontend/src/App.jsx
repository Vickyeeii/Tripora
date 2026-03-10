import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ui/ToastProvider';
import Login from './pages/Login';
import Register from './pages/Register';
import TouristDashboard from './pages/TouristDashboard';
import Profile from './pages/Profile';
import PendingGuides from './pages/PendingGuides';
import HeritageList from './pages/HeritageList'; // Public Heritage List
import HeritageDetail from './pages/HeritageDetail'; // Public Heritage Detail
import HeritageCreate from './pages/HeritageCreate';
import HeritageEdit from './pages/HeritageEdit';
import ManageEvents from './pages/ManageEvents';
import EventsList from './pages/EventsList';
import EventDetail from './pages/EventDetail'; // Added
import LandingPage from './pages/LandingPage';
import BookingSuccess from './pages/BookingSuccess'; // Added
import TrackBooking from './pages/TrackBooking'; // Added

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('access_token');
  const userRole = localStorage.getItem('user_role');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />; // Redirect unauthorized access to their own dashboard
  }

  return children;
};

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Public Event Routes */}
          <Route path="/events" element={<EventsList />} />
          <Route path="/events/:id" element={<EventDetail />} />

          {/* Heritage Routes (Public Access) */}
          <Route path="/heritage" element={<HeritageList />} />
          <Route path="/heritage/:id" element={<HeritageDetail />} />

          {/* Booking Routes */}
          <Route path="/booking-success" element={<BookingSuccess />} />
          <Route path="/track-booking" element={<TrackBooking />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['tourist', 'guide', 'admin']}>
                <TouristDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['tourist', 'guide', 'admin']}>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/guides"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <PendingGuides />
              </ProtectedRoute>
            }
          />

          {/* Guide Routes */}
          <Route
            path="/heritage/create"
            element={
              <ProtectedRoute allowedRoles={['guide', 'admin']}>
                <HeritageCreate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/heritage/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['guide', 'admin']}>
                <HeritageEdit />
              </ProtectedRoute>
            }
          />
          {/* Guide detailed view for editing maybe? Or remove if HeritageEvents covers it */}
          <Route path="/heritage/admin/:id" element={<HeritageDetail />} />

          <Route
            path="/heritage/:heritageId/events"
            element={
              <ProtectedRoute allowedRoles={['guide', 'admin']}>
                <ManageEvents />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
