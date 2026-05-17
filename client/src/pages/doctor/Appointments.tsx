import { useEffect, useState } from 'react';
import { Calendar, Home, Video, Clock, CheckCircle } from 'lucide-react';
import api from '../../lib/api';
import type { Appointment } from '../../types';
import { appointmentStatusConfig, formatDate } from '../../lib/utils';
import { toast } from 'sonner';

const typeIcon = { HOME_VISIT: Home, VIDEO_CALL: Video, CLINIC: Calendar };
const typeLabel = { HOME_VISIT: 'Home Visit', VIDEO_CALL: 'Video Call', CLINIC: 'Clinic' };

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');

  useEffect(() => {
    api.get('/appointments/my')
      .then((res) => setAppointments(res.data.appointments))
      .catch(() => toast.error('Failed to load appointments'))
      .finally(() => setLoading(false));
  }, []);

  const handleComplete = async (id: string) => {
    try {
      await api.put(`/appointments/${id}`, { status: 'COMPLETED' });
      setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status: 'COMPLETED' } : a));
      toast.success('Appointment marked as completed');
    } catch {
      toast.error('Failed to update appointment');
    }
  };

  const filtered = appointments.filter((a) => {
    if (filter === 'upcoming') return ['SCHEDULED', 'CONFIRMED'].includes(a.status);
    if (filter === 'completed') return a.status === 'COMPLETED';
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-700 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-primary-800 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-2xl font-bold">Appointments</h1>
          <p className="text-blue-200 text-sm mt-1">{appointments.length} total</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-2 mb-6">
          {(['all', 'upcoming', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                filter === f ? 'bg-primary-700 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="card text-center py-16">
            <Calendar className="w-14 h-14 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500 font-medium">No appointments found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((appt) => {
              const sc = appointmentStatusConfig[appt.status];
              const Icon = typeIcon[appt.type];
              return (
                <div key={appt.id} className="card hover:shadow-md transition-all animate-slide-up">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{appt.patient?.name}</p>
                        <p className="text-sm text-slate-500">
                          {appt.patient?.patientProfile?.age && `${appt.patient.patientProfile.age} yrs`}
                          {appt.patient?.patientProfile?.bloodGroup && ` · ${appt.patient.patientProfile.bloodGroup}`}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-600">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-primary-600" />
                            {formatDate(appt.scheduledAt)}
                          </span>
                          <span className={`badge text-xs ${
                            appt.type === 'HOME_VISIT' ? 'bg-blue-100 text-blue-700' :
                            appt.type === 'VIDEO_CALL' ? 'bg-purple-100 text-purple-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {typeLabel[appt.type]}
                          </span>
                        </div>
                        {appt.symptoms && (
                          <p className="text-xs text-slate-400 mt-1">Symptoms: {appt.symptoms}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className={`badge ${sc.bg} ${sc.color}`}>{sc.label}</span>
                      {['SCHEDULED', 'CONFIRMED'].includes(appt.status) && (
                        <button
                          onClick={() => handleComplete(appt.id)}
                          className="flex items-center gap-1.5 text-xs text-medical-700 hover:text-medical-800 font-medium"
                        >
                          <CheckCircle className="w-4 h-4" /> Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorAppointments;
