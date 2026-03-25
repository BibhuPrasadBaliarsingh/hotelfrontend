import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
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
const MyBookings = lazy(() => import('./pages/MyBookings'));
const Profile = lazy(() => import('./pages/Profile'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminRooms = lazy(() => import('./pages/admin/AdminRooms'));
const AdminBookings = lazy(() => import('./pages/admin/AdminBookings'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Protected route wrapper
function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <Spinner fullScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/" replace />;
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
        <Route path="/book/:id" element={<ProtectedRoute><MainLayout><BookingPage /></MainLayout></ProtectedRoute>} />
        <Route path="/booking-confirm/:id" element={<ProtectedRoute><MainLayout><BookingConfirm /></MainLayout></ProtectedRoute>} />
        <Route path="/my-bookings" element={<ProtectedRoute><MainLayout><MyBookings /></MainLayout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><MainLayout><Profile /></MainLayout></ProtectedRoute>} />

        {/* Admin protected */}
        <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/rooms" element={<ProtectedRoute adminOnly><AdminRooms /></ProtectedRoute>} />
        <Route path="/admin/bookings" element={<ProtectedRoute adminOnly><AdminBookings /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />

        <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <AuthProvider>
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
    </AuthProvider>
  );
}
