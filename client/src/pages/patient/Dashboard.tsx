import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, Calendar, ClipboardList, Clock,
  CheckCircle, XCircle, Phone, TrendingUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../lib/api';
import type { MedicalRequest, Appointment } from '../../types';
import { requestStatusConfig, appointmentStatusConfig, formatDate, timeAgo } from '../../lib/utils';
import StatsCard from '../../components/StatsCard';
import EmergencyButton from '../../components/EmergencyButton';
import { toast } from 'sonner';

const PatientDashboard = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [requests, setRequests] = useState<MedicalRequest[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reqRes, apptRes] = await Promise.all([
          api.get('/requests/my'),
          api.get('/appointments/my'),
        ]);
        setRequests(reqRes.data.requests);
        setAppointments(apptRes.data.appointments);
      } catch {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('your-request-accepted', (data) => {
      setRequests((prev) =>
        prev.map((r) => (r.id === data.requestId ? { ...r, status: 'ACCEPTED' } : r))
      );
      toast.success(data.message);
    });

    socket.on('request-updated', (data) => {
      setRequests((prev) =>
        prev.map((r) => (r.id === data.requestId ? { ...r, status: data.status } : r))
      );
    });

    return () => {
      socket.off('your-request-accepted');
      socket.off('request-updated');
    };
  }, [socket]);

  const active = requests.filter((r) => ['PENDING', 'ACCEPTED', 'IN_PROGRESS'].includes(r.status));
  const completed = requests.filter((r) => r.status === 'COMPLETED').length;
  const upcoming = appointments.filter((a) => ['SCHEDULED', 'CONFIRMED'].includes(a.status));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-700 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-primary-800 to-primary-700 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Hello, {user?.name?.split(' ')[0]} 👋</h1>
              <p className="text-blue-200 mt-1 text-sm">Your health dashboard</p>
            </div>
            <EmergencyButton size="sm" className="flex-shrink-0" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard label="Active Requests" value={active.length} icon={AlertTriangle} color="red" />
          <StatsCard label="Appointments" value={upcoming.length} icon={Calendar} color="blue" />
          <StatsCard label="Completed" value={completed} icon={CheckCircle} color="green" />
          <StatsCard label="Total Visits" value={requests.length} icon={TrendingUp} color="yellow" />
        </div>

        {active.length > 0 && (
          <div className="card border-l-4 border-l-emergency-500 bg-emergency-50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-emergency-500 rounded-full animate-pulse" />
              <h2 className="font-bold text-emergency-700">Active Medical Requests</h2>
            </div>
            <div className="space-y-3">
              {active.map((req) => {
                const sc = requestStatusConfig[req.status];
                return (
                  <div key={req.id} className="bg-white rounded-xl p-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{req.description.slice(0, 80)}...</p>
                      <p className="text-xs text-slate-500 mt-1">{timeAgo(req.createdAt)}</p>
                      {req.doctor && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-primary-700 font-medium">Dr. {req.doctor.name}</span>
                          {req.doctor.phone && (
                            <a href={`tel:${req.doctor.phone}`} className="flex items-center gap-1 text-xs text-primary-600 hover:underline">
                              <Phone className="w-3 h-3" />{req.doctor.phone}
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                    <span className={`badge ${sc.bg} ${sc.color} flex-shrink-0`}>{sc.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-600" />
                Upcoming Appointments
              </h2>
              <Link to="/patient/appointments" className="text-sm text-primary-700 hover:underline font-medium">View all</Link>
            </div>

            {upcoming.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No upcoming appointments</p>
                <Link to="/patient/appointments" className="text-sm text-primary-700 font-medium hover:underline mt-1 block">Book one now</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.slice(0, 3).map((appt) => {
                  const sc = appointmentStatusConfig[appt.status];
                  return (
                    <div key={appt.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {new Date(appt.scheduledAt).getDate()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 text-sm">Dr. {appt.doctor?.name}</p>
                        <p className="text-xs text-slate-500">{formatDate(appt.scheduledAt)}</p>
                        <p className="text-xs text-slate-400">{appt.type.replace('_', ' ')}</p>
                      </div>
                      <span className={`badge ${sc.bg} ${sc.color} text-xs`}>{sc.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-primary-600" />
                Recent Requests
              </h2>
            </div>

            {requests.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No medical requests yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.slice(0, 4).map((req) => {
                  const sc = requestStatusConfig[req.status];
                  const icon = req.status === 'COMPLETED'
                    ? <CheckCircle className="w-4 h-4 text-medical-600" />
                    : req.status === 'CANCELLED'
                    ? <XCircle className="w-4 h-4 text-slate-400" />
                    : <Clock className="w-4 h-4 text-yellow-600" />;

                  return (
                    <div key={req.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="mt-0.5 flex-shrink-0">{icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 line-clamp-1">{req.description}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{timeAgo(req.createdAt)}</p>
                      </div>
                      <span className={`badge ${sc.bg} ${sc.color} text-xs flex-shrink-0`}>{sc.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="card bg-gradient-to-r from-primary-900 to-primary-800 text-white">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-bold text-xl mb-1">Need medical help now?</h3>
              <p className="text-blue-200 text-sm">Request a doctor to come to your home within minutes.</p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <Link to="/patient/emergency" className="btn-emergency">
                <AlertTriangle className="w-5 h-5" />
                Request Help
              </Link>
              <a href="tel:112" className="flex items-center gap-2 border-2 border-white/40 text-white font-semibold px-5 py-3 rounded-2xl hover:bg-white/10 transition-colors">
                <Phone className="w-5 h-5" />112
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
