import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Clubs from './pages/Clubs';
import ClubDetails from './pages/ClubDetails';
import ClubCreate from './pages/ClubCreate';
import ClubEdit from './pages/ClubEdit';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import EventCreate from './pages/EventCreate';
import EventEdit from './pages/EventEdit';
import Announcements from './pages/Announcements';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminClubs from './pages/admin/AdminClubs';
import AdminUsers from './pages/admin/AdminUsers';
import AdminEvents from './pages/admin/AdminEvents';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';

// President Pages
import PresidentDashboard from './pages/president/PresidentDashboard';
import PresidentClub from './pages/president/PresidentClub';
import PresidentMembers from './pages/president/PresidentMembers';
import PresidentEvents from './pages/president/PresidentEvents';
import PresidentEventRegistrations from './pages/president/PresidentEventRegistrations';
import PresidentAnnouncements from './pages/president/PresidentAnnouncements';
import SecretaryDashboard from './pages/secretary/SecretaryDashboard';
import SecretaryClub from './pages/secretary/SecretaryClub';
import SecretaryMembers from './pages/secretary/SecretaryMembers';
import SecretaryEvents from './pages/secretary/SecretaryEvents';
import SecretaryEventRegistrations from './pages/secretary/SecretaryEventRegistrations';
import SecretaryAnnouncements from './pages/secretary/SecretaryAnnouncements';
// Route Guards
import AdminRoute from './components/AdminRoute';
import PresidentRoute from './components/PresidentRoute';
import SecretaryRoute from './components/SecretaryRoute';

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes wrapped with layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          
          {/* Member / Common Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clubs" element={<Clubs />} />
          <Route path="/clubs/:clubId" element={<ClubDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/events" element={<Events />} />
          <Route path="/clubs/:clubId/events/:eventId" element={<EventDetails />} />

          {/* Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/clubs" element={<AdminClubs />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/events" element={<AdminEvents />} />
            <Route path="/admin/announcements" element={<AdminAnnouncements />} />
            {/* Admin can also create/edit clubs */}
            <Route path="/clubs/create" element={<ClubCreate />} />
            <Route path="/clubs/:clubId/edit" element={<ClubEdit />} />
          </Route>

          {/* President Routes */}
          <Route element={<PresidentRoute />}>
            <Route path="/president/dashboard" element={<PresidentDashboard />} />
            <Route path="/president/club" element={<PresidentClub />} />
            <Route path="/president/members" element={<PresidentMembers />} />
            <Route path="/president/events" element={<PresidentEvents />} />
            <Route path="/president/events/:eventId/registrations" element={<PresidentEventRegistrations />} />
            <Route path="/president/announcements" element={<PresidentAnnouncements />} />
            <Route path="/clubs/:clubId/events/create" element={<EventCreate />} />
            <Route path="/clubs/:clubId/events/:eventId/edit" element={<EventEdit />} />
          </Route>

          {/* Secretary Routes */}
          <Route element={<SecretaryRoute />}>
            <Route path="/secretary/dashboard" element={<SecretaryDashboard />} />
            <Route path="/secretary/club" element={<SecretaryClub />} />
            <Route path="/secretary/members" element={<SecretaryMembers />} />
            <Route path="/secretary/events" element={<SecretaryEvents />} />
            <Route path="/secretary/events/:eventId/registrations" element={<SecretaryEventRegistrations />} />
            <Route path="/secretary/announcements" element={<SecretaryAnnouncements />} />
            <Route path="/clubs/:clubId/events/create" element={<EventCreate />} />
            <Route path="/clubs/:clubId/events/:eventId/edit" element={<EventEdit />} />
          </Route>

          {/* Catch‑all redirects based on default Route Guard rules */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
