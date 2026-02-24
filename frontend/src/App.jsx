import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/common/Navbar';
import MouseTrailer from './components/common/MouseTrailer';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Onboarding from './pages/auth/Onboarding';

// Participant Pages
import ParticipantDashboard from './pages/participant/Dashboard';
import BrowseEvents from './pages/participant/BrowseEvents';
import EventDetail from './pages/participant/EventDetail';
import MyRegistrations from './pages/participant/MyRegistrations';
import ParticipantProfile from './pages/participant/Profile';
import OrganizersListing from './pages/participant/OrganizersListing';
import OrganizerDetail from './pages/participant/OrganizerDetail';

// Organizer Pages
import OrganizerDashboard from './pages/organizer/Dashboard';
import CreateEvent from './pages/organizer/CreateEvent';
import ManageEvent from './pages/organizer/ManageEvent';
import OrganizerProfile from './pages/organizer/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import ManageOrganizers from './pages/admin/ManageOrganizers';
import PasswordResets from './pages/admin/PasswordResets';

import './App.css';

const AppLayout = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {isAuthenticated && <Navbar />}
      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Participant Routes */}
          <Route path="/participant/onboarding" element={
            <ProtectedRoute roles={['participant']}><Onboarding /></ProtectedRoute>
          } />
          <Route path="/participant/dashboard" element={
            <ProtectedRoute roles={['participant']}><ParticipantDashboard /></ProtectedRoute>
          } />
          <Route path="/participant/events" element={
            <ProtectedRoute roles={['participant']}><BrowseEvents /></ProtectedRoute>
          } />
          <Route path="/participant/events/:id" element={
            <ProtectedRoute roles={['participant']}><EventDetail /></ProtectedRoute>
          } />
          <Route path="/participant/registrations" element={
            <ProtectedRoute roles={['participant']}><MyRegistrations /></ProtectedRoute>
          } />
          <Route path="/participant/profile" element={
            <ProtectedRoute roles={['participant']}><ParticipantProfile /></ProtectedRoute>
          } />
          <Route path="/participant/organizers" element={
            <ProtectedRoute roles={['participant']}><OrganizersListing /></ProtectedRoute>
          } />
          <Route path="/participant/organizers/:id" element={
            <ProtectedRoute roles={['participant']}><OrganizerDetail /></ProtectedRoute>
          } />

          {/* Organizer Routes */}
          <Route path="/organizer/dashboard" element={
            <ProtectedRoute roles={['organizer']}><OrganizerDashboard /></ProtectedRoute>
          } />
          <Route path="/organizer/events/create" element={
            <ProtectedRoute roles={['organizer']}><CreateEvent /></ProtectedRoute>
          } />
          <Route path="/organizer/events/:id" element={
            <ProtectedRoute roles={['organizer']}><ManageEvent /></ProtectedRoute>
          } />
          <Route path="/organizer/profile" element={
            <ProtectedRoute roles={['organizer']}><OrganizerProfile /></ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/organizers" element={
            <ProtectedRoute roles={['admin']}><ManageOrganizers /></ProtectedRoute>
          } />
          <Route path="/admin/password-resets" element={
            <ProtectedRoute roles={['admin']}><PasswordResets /></ProtectedRoute>
          } />

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <MouseTrailer />
        <AppLayout />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="light"
        />
      </AuthProvider>
    </Router>
  );
}

export default App;
