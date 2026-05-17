import { useEffect, useState } from 'react';
import { AlertTriangle, Users, Filter } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useGeolocation } from '../../hooks/useGeolocation';
import api from '../../lib/api';
import type { MedicalRequest, UrgencyLevel } from '../../types';
import RequestCard from '../../components/RequestCard';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const DoctorRequests = () => {
  const { socket, liveRequests } = useSocket();
  const { user } = useAuth();
  const { getCurrentLocation } = useGeolocation();
  const [nearbyRequests, setNearbyRequests] = useState<MedicalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [filterUrgency, setFilterUrgency] = useState<UrgencyLevel | 'ALL'>('ALL');

  const fetchNearby = async () => {
    try {
      let lat, lng;
      try { const pos = await getCurrentLocation(); lat = pos.latitude; lng = pos.longitude; } catch {}
      const url = lat ? `/requests/nearby?latitude=${lat}&longitude=${lng}&radius=25` : '/requests/nearby';
      const res = await api.get(url);
      setNearbyRequests(res.data.requests);
    } catch {
      toast.error('Failed to fetch nearby requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNearby(); }, []);

  const allRequests = [
    ...liveRequests,
    ...nearbyRequests.filter((r) => !liveRequests.find((l) => l.id === r.id)),
  ];

  const filtered = filterUrgency === 'ALL' ? allRequests : allRequests.filter((r) => r.urgencyLevel === filterUrgency);

  const handleAccept = async (requestId: string) => {
    setAcceptingId(requestId);
    try {
      const res = await api.put(`/requests/${requestId}/accept`);
      const updated = res.data.request;

      setNearbyRequests((prev) => prev.filter((r) => r.id !== requestId));

      socket?.emit('request-accepted', {
        requestId,
        patientId: updated.patientId,
        doctorName: user?.name || 'Doctor',
      });

      toast.success('Request accepted! Patient notified.');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to accept';
      toast.error(msg);
    } finally {
      setAcceptingId(null);
    }
  };

  const urgencyFilters: Array<UrgencyLevel | 'ALL'> = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-primary-800 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <div className="w-3 h-3 bg-emergency-400 rounded-full animate-pulse" />
                Live Patient Requests
              </h1>
              <p className="text-blue-200 text-sm mt-1">{filtered.length} requests near you</p>
            </div>
            <button
              onClick={fetchNearby}
              className="flex items-center gap-2 bg-white/10 border border-white/20 text-white font-medium px-4 py-2.5 rounded-xl hover:bg-white/20 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-wrap gap-2 mb-6">
          {urgencyFilters.map((f) => (
            <button
              key={f}
              onClick={() => setFilterUrgency(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterUrgency === f
                  ? f === 'CRITICAL' ? 'bg-red-600 text-white'
                    : f === 'HIGH' ? 'bg-orange-500 text-white'
                    : f === 'MEDIUM' ? 'bg-yellow-500 text-white'
                    : f === 'LOW' ? 'bg-green-600 text-white'
                    : 'bg-primary-700 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-700 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-16">
            <Users className="w-14 h-14 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500 font-medium">No patient requests right now</p>
            <p className="text-slate-400 text-sm mt-1">New emergency requests will appear here in real time</p>
          </div>
        ) : (
          <>
            {liveRequests.length > 0 && (
              <div className="flex items-center gap-2 mb-4 text-sm font-medium text-emergency-600">
                <AlertTriangle className="w-4 h-4" />
                {liveRequests.length} new live request{liveRequests.length > 1 ? 's' : ''}
              </div>
            )}
            <div className="space-y-4">
              {filtered.map((req) => (
                <RequestCard
                  key={req.id}
                  request={req}
                  onAccept={handleAccept}
                  isAccepting={acceptingId === req.id}
                  isDoctor
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DoctorRequests;
