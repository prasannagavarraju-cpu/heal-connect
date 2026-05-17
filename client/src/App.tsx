import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import PatientDashboard from './pages/patient/Dashboard';
import EmergencyRequest from './pages/patient/EmergencyRequest';
import PatientAppointments from './pages/patient/Appointments';
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorRequests from './pages/doctor/Requests';
import DoctorAppointments from './pages/doctor/Appointments';
import Profile from './pages/Profile';
import type { JSX } from 'react';

const ProtectedRoute = ({ children, roles }: { children: JSX.Element; roles?: string[] }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-700 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to={['DOCTOR', 'NURSE', 'AMBULANCE'].includes(user.role) ? '/doctor/dashboard' : '/patient/dashboard'} replace />;
  }

  return children;
};

const SmartRedirect = () => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Home />;
  return <Navigate to={['DOCTOR', 'NURSE', 'AMBULANCE'].includes(user?.role || '') ? '/doctor/dashboard' : '/patient/dashboard'} replace />;
};

const AppRoutes = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1">
      <Routes>
        <Route path="/" element={<SmartRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/patient/dashboard" element={
          <ProtectedRoute roles={['PATIENT']}><PatientDashboard /></ProtectedRoute>
        } />
        <Route path="/patient/emergency" element={
          <ProtectedRoute roles={['PATIENT']}><EmergencyRequest /></ProtectedRoute>
        } />
        <Route path="/patient/appointments" element={
          <ProtectedRoute roles={['PATIENT']}><PatientAppointments /></ProtectedRoute>
        } />

        <Route path="/doctor/dashboard" element={
          <ProtectedRoute roles={['DOCTOR', 'NURSE', 'AMBULANCE']}><DoctorDashboard /></ProtectedRoute>
        } />
        <Route path="/doctor/requests" element={
          <ProtectedRoute roles={['DOCTOR', 'NURSE', 'AMBULANCE']}><DoctorRequests /></ProtectedRoute>
        } />
        <Route path="/doctor/appointments" element={
          <ProtectedRoute roles={['DOCTOR', 'NURSE', 'AMBULANCE']}><DoctorAppointments /></ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  </div>
);

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <SocketProvider>
        <AppRoutes />
        <Toaster richColors position="top-right" duration={4000} />
      </SocketProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
