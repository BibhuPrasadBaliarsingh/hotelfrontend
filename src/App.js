import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Spinner from './components/Spinner';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Rooms = lazy(() => import('./pages/Rooms'));
const RoomDetail = lazy(() => import('./pages/RoomDetail'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const BookingConfirm = lazy(() => import('./pages/BookingConfirm'));
const BookingCart = lazy(() => import('./pages/BookingCart'));
const GuestDashboard = lazy(() => import('./pages/GuestDashboard'));
const BookingHistory = lazy(() => import('./pages/BookingHistory'));
const MyBookings = lazy(() => import('./pages/MyBookings'));
const Profile = lazy(() => import('./pages/Profile'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminRooms = lazy(() => import('./pages/admin/AdminRooms'));
const AdminRoomAvailability = lazy(() => import('./pages/admin/RoomAvailability'));
const AdminBookings = lazy(() => import('./pages/admin/AdminBookings'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminDocuments = lazy(() => import('./pages/admin/Documents'));
const AdminCalendar = lazy(() => import('./pages/admin/AdminCalendar'));
const AdminReception = lazy(() => import('./pages/admin/Reception'));
const AdminManagement = lazy(() => import('./pages/admin/Management'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Protected route wrapper
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <Spinner fullScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
}

// Public-only route (redirect if logged in)
function PublicRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <Spinner fullScreen />;
  if (isAuthenticated) return <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/'} replace />;
  return children;
}

// Layout: pages with Navbar+Footer
function MainLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-hotel-dark">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function AppRoutes() {
  return (
    <Suspense fallback={<Spinner fullScreen />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<MainLayout><Home /></MainLayout>} />
        <Route path="/rooms" element={<MainLayout><Rooms /></MainLayout>} />
        <Route path="/rooms/:id" element={<MainLayout><RoomDetail /></MainLayout>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* User protected */}
        <Route path="/book/:id" element={<ProtectedRoute allowedRoles={['user', 'guest', 'management', 'reception', 'admin']}><MainLayout><BookingPage /></MainLayout></ProtectedRoute>} />
        <Route path="/booking-cart" element={<ProtectedRoute allowedRoles={['user', 'guest', 'management', 'reception', 'admin']}><MainLayout><BookingCart /></MainLayout></ProtectedRoute>} />
        <Route path="/booking-confirm/:id" element={<ProtectedRoute allowedRoles={['user', 'guest', 'management', 'reception', 'admin']}><MainLayout><BookingConfirm /></MainLayout></ProtectedRoute>} />
        <Route path="/guest/dashboard" element={<ProtectedRoute allowedRoles={['guest', 'user']}><MainLayout><GuestDashboard /></MainLayout></ProtectedRoute>} />
        <Route path="/booking-history" element={<ProtectedRoute allowedRoles={['user', 'guest', 'management', 'reception', 'admin']}><MainLayout><BookingHistory /></MainLayout></ProtectedRoute>} />
        <Route path="/my-bookings" element={<ProtectedRoute allowedRoles={['user', 'guest', 'management', 'reception', 'admin']}><MainLayout><MyBookings /></MainLayout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute allowedRoles={['user', 'guest', 'management', 'reception', 'admin']}><MainLayout><Profile /></MainLayout></ProtectedRoute>} />

        {/* Admin protected */}
        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin', 'management', 'reception']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/rooms" element={<ProtectedRoute allowedRoles={['admin']}><AdminRooms /></ProtectedRoute>} />
        <Route path="/admin/availability" element={<ProtectedRoute allowedRoles={['admin']}><AdminRoomAvailability /></ProtectedRoute>} />
        <Route path="/admin/bookings" element={<ProtectedRoute allowedRoles={['admin', 'management', 'reception']}><AdminBookings /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/user" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/calendar" element={<ProtectedRoute allowedRoles={['admin']}><AdminCalendar /></ProtectedRoute>} />
        <Route path="/admin/documents" element={<ProtectedRoute allowedRoles={['admin']}><AdminDocuments /></ProtectedRoute>} />
        <Route path="/admin/reception" element={<ProtectedRoute allowedRoles={['admin']}><AdminReception /></ProtectedRoute>} />
        <Route path="/admin/management" element={<ProtectedRoute allowedRoles={['admin']}><AdminManagement /></ProtectedRoute>} />

        <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: '#13131a', color: '#f0ede8', border: '1px solid #2a2a3a', borderRadius: '12px', fontSize: '14px' },
              success: { iconTheme: { primary: '#d4882a', secondary: '#0c0c0e' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#0c0c0e' } },
              duration: 3500,
            }}
          />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
