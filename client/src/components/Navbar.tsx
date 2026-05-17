import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Heart, LayoutDashboard, Calendar, AlertTriangle,
  LogOut, Menu, X, Bell, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { getInitials, roleLabel } from '../lib/utils';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { isConnected } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isDoctor = user?.role && ['DOCTOR', 'NURSE', 'AMBULANCE'].includes(user.role);
  const dashboardPath = isDoctor ? '/doctor/dashboard' : '/patient/dashboard';

  const navLinks = isAuthenticated
    ? isDoctor
      ? [
          { to: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/doctor/requests', label: 'Requests', icon: AlertTriangle },
          { to: '/doctor/appointments', label: 'Appointments', icon: Calendar },
        ]
      : [
          { to: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/patient/emergency', label: 'Emergency', icon: AlertTriangle },
          { to: '/patient/appointments', label: 'Appointments', icon: Calendar },
        ]
    : [];

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowUserMenu(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to={isAuthenticated ? dashboardPath : '/'} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-primary-700 rounded-xl flex items-center justify-center shadow-sm group-hover:bg-primary-800 transition-colors">
              <Heart className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            <span className="text-xl font-bold text-slate-900">HealConnect</span>
          </Link>

          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(to)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className={`status-dot ${isConnected ? 'bg-green-500' : 'bg-slate-400'}`} />
                  <span className="hidden sm:inline">{isConnected ? 'Live' : 'Offline'}</span>
                </div>

                <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                  <Bell className="w-5 h-5" />
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">
                      {getInitials(user?.name || 'U')}
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-sm font-semibold text-slate-900 leading-none">{user?.name?.split(' ')[0]}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{roleLabel[user?.role || '']}</div>
                    </div>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 animate-fade-in">
                      <Link
                        to="/profile"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                      <hr className="my-1 border-slate-100" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {!isAuthenticated && (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="btn-outline py-2 px-4 text-sm min-h-0">Sign In</Link>
                <Link to="/register" className="btn-primary py-2 px-4 text-sm min-h-0">Get Started</Link>
              </div>
            )}

            <button
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white pb-4 animate-slide-up">
          <div className="px-4 pt-3 space-y-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                  isActive(to) ? 'bg-primary-50 text-primary-700' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            ))}
            {!isAuthenticated && (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-base font-medium text-primary-700 hover:bg-slate-100 rounded-xl">Sign In</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="block btn-primary w-full text-center">Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
