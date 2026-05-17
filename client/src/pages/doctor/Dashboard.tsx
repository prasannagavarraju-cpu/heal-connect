import { useEffect, useState } from 'react';
import {
  Users, CheckCircle, Clock, ToggleLeft, ToggleRight,
  MapPin, Calendar, AlertTriangle, Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useGeolocation } from '../../hooks/useGeolocation';
import api from '../../lib/api';
import type { MedicalRequest, Appointment } from '../../types';
import { urgencyConfig, appointmentStatusConfig, timeAgo, formatDate } from '../../lib/utils';
import RequestCard from '../../components/RequestCard';
import StatsCard from '../../components/StatsCard';
import { toast } from 'sonner';

const DoctorDashboard = () => {
  const { user, updateUser } = useAuth();
  const { socket, liveRequests } = useSocket();
  const { getCurrentLocation } = useGeolocation();
  const [requests, setRequests] = useState<MedicalRequest[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(user?.doctorProfile?.isAvailable ?? true);
  const [togglingAvail, setTogglingAvail] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

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
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const allRequests = [...liveRequests, ...requests.filter((r) => !liveRequests.find((l) => l.id === r.id))];

  const handleToggleAvailability = async () => {
    setTogglingAvail(true);
    try {
      let lat, lng;
      if (!isAvailable) {
        try { const pos = await getCurrentLocation(); lat = pos.latitude; lng = pos.longitude; } catch {}
      }
      await api.put('/doctors/availability', {
        isAvailable: !isAvailable,
        ...(lat ? { latitude: lat, longitude: lng } : {}),
      });
      setIsAvailable(!isAvailable);
      if (user?.doctorProfile) {
        updateUser({ ...user, doctorProfile: { ...user.doctorProfile, isAvailable: !isAvailable } });
      }
      toast.success(`You are now ${!isAvailable ? 'available' : 'offline'}`);
    } catch {
      toast.error('Failed to update availability');
    } finally {
      setTogglingAvail(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    setAcceptingId(requestId);
    try {
      const res = await api.put(`/requests/${requestId}/accept`);
      const updated = res.data.request;
      setRequests((prev) => [...prev, updated]);

      socket?.emit('request-accepted', {
        requestId,
        patientId: updated.patientId,
        doctorName: user?.name || 'Doctor',
      });

      toast.success('Request accepted! Patient has been notified.');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to accept request';
      toast.error(msg);
    } finally {
      setAcceptingId(null);
    }
  };

  const handleComplete = async (requestId: string) => {
    try {
      await api.put(`/requests/${requestId}/status`, { status: 'COMPLETED' });
      setRequests((prev) => prev.map((r) => r.id === requestId ? { ...r, status: 'COMPLETED' } : r));
      toast.success('Request marked as completed');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const pendingRequests = allRequests.filter((r) => r.status === 'PENDING');
  const activeRequests = requests.filter((r) => r.status === 'ACCEPTED' || r.status === 'IN_PROGRESS');
  const completedCount = requests.filter((r) => r.status === 'COMPLETED').length;
  const upcomingAppts = appointments.filter((a) => ['SCHEDULED', 'CONFIRMED'].includes(a.status));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-700 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-primary-900 to-primary-800 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Dr. {user?.name} 👨‍⚕️</h1>
              <p className="text-blue-200 text-sm mt-1">{user?.doctorProfile?.specialization}</p>
            </div>
            <button
              onClick={handleToggleAvailability}
              disabled={togglingAvail}
              className={`flex items-center gap-3 px-5 py-3 rounded-xl font-semibold transition-all ${
                isAvailable
                  ? 'bg-medical-600 hover:bg-medical-700 text-white'
                  : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
              }`}
            >
              {togglingAvail ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isAvailable ? (
                <ToggleRight className="w-5 h-5" />
              ) : (
                <ToggleLeft className="w-5 h-5" />
              )}
              {isAvailable ? 'Available' : 'Go Online'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard label="Pending Requests" value={pendingRequests.length} icon={AlertTriangle} color="red" />
          <StatsCard label="Active Cases" value={activeRequests.length} icon={Clock} color="yellow" />
          <StatsCard label="Completed" value={completedCount} icon={CheckCircle} color="green" />
          <StatsCard label="Appointments" value={upcomingAppts.length} icon={Calendar} color="blue" />
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-emergency-500 rounded-full animate-pulse" />
                Nearby Patient Requests
                {pendingRequests.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-emergency-600 text-white text-xs font-bold flex items-center justify-center">
                    {pendingRequests.length}
                  </span>
                )}
              </h2>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="card text-center py-12">
                <Users className="w-14 h-14 mx-auto mb-4 text-slate-300" />
                <p className="text-slate-500 font-medium">No pending requests right now</p>
                <p className="text-slate-400 text-sm mt-1">New requests will appear here in real time</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((req) => (
                  <RequestCard
                    key={req.id}
                    request={req}
                    onAccept={handleAccept}
                    isAccepting={acceptingId === req.id}
                    isDoctor
                  />
                ))}
              </div>
            )}

            {activeRequests.length > 0 && (
              <>
                <h3 className="font-semibold text-slate-700 mt-6">Active Cases</h3>
                <div className="space-y-4">
                  {activeRequests.map((req) => (
                    <RequestCard
                      key={req.id}
                      request={req}
                      onComplete={handleComplete}
                      isDoctor
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="lg:col-span-2 space-y-5">
            <div className="card">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary-600" />
                Today's Appointments
              </h3>
              {upcomingAppts.length === 0 ? (
                <div className="text-center py-6">
                  <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm text-slate-400">No appointments today</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingAppts.slice(0, 4).map((appt) => {
                    const sc = appointmentStatusConfig[appt.status];
                    return (
                      <div key={appt.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                        <div className="w-9 h-9 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {new Date(appt.scheduledAt).getHours()}:{String(new Date(appt.scheduledAt).getMinutes()).padStart(2, '0')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 text-sm">{appt.patient?.name}</p>
                          <p className="text-xs text-slate-400">{formatDate(appt.scheduledAt)}</p>
                        </div>
                        <span className={`badge text-xs ${sc.bg} ${sc.color}`}>{sc.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="card bg-primary-50 border border-primary-100">
              <h3 className="font-bold text-primary-900 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Your Service Area
              </h3>
              <p className="text-primary-700 text-sm mb-3">
                Radius: <strong>{user?.doctorProfile?.serviceRadius || 10} km</strong>
              </p>
              <div className={`flex items-center gap-2 text-sm font-medium ${isAvailable ? 'text-medical-700' : 'text-slate-500'}`}>
                <div className={`w-2.5 h-2.5 rounded-full ${isAvailable ? 'bg-medical-500 animate-pulse' : 'bg-slate-400'}`} />
                {isAvailable ? 'Visible to patients' : 'Not visible (offline)'}
              </div>
            </div>

            <div className="card">
              <h3 className="font-bold text-slate-900 mb-4">Recent Completed</h3>
              {requests.filter((r) => r.status === 'COMPLETED').length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No completed requests yet</p>
              ) : (
                <div className="space-y-2">
                  {requests.filter((r) => r.status === 'COMPLETED').slice(0, 3).map((req) => {
                    const urg = urgencyConfig[req.urgencyLevel];
                    return (
                      <div key={req.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50">
                        <CheckCircle className="w-4 h-4 text-medical-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-600 line-clamp-1">{req.patient?.name}</p>
                          <p className="text-xs text-slate-400">{timeAgo(req.updatedAt)}</p>
                        </div>
                        <span className={`badge text-xs ${urg.bg} ${urg.color}`}>{urg.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
