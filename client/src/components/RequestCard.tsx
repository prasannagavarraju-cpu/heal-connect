import { MapPin, Clock, Phone, User, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import type { MedicalRequest } from '../types';
import { urgencyConfig, requestStatusConfig, timeAgo, getInitials } from '../lib/utils';

interface RequestCardProps {
  request: MedicalRequest;
  onAccept?: (id: string) => void;
  onComplete?: (id: string) => void;
  isAccepting?: boolean;
  showActions?: boolean;
  isDoctor?: boolean;
}

const RequestCard = ({
  request,
  onAccept,
  onComplete,
  isAccepting,
  showActions = true,
  isDoctor = false,
}: RequestCardProps) => {
  const urgency = urgencyConfig[request.urgencyLevel];
  const statusCfg = requestStatusConfig[request.status];

  return (
    <div
      className={`card hover:shadow-md transition-all duration-200 border-l-4 animate-slide-up ${
        request.urgencyLevel === 'CRITICAL'
          ? 'border-l-red-500'
          : request.urgencyLevel === 'HIGH'
          ? 'border-l-orange-500'
          : request.urgencyLevel === 'MEDIUM'
          ? 'border-l-yellow-500'
          : 'border-l-green-500'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
            {getInitials(request.patient?.name || 'P')}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{request.patient?.name || 'Patient'}</p>
            {request.patient?.phone && (
              <a
                href={`tel:${request.patient.phone}`}
                className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 mt-0.5"
              >
                <Phone className="w-3.5 h-3.5" />
                {request.patient.phone}
              </a>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <span className={`badge ${urgency.bg} ${urgency.color}`}>
            <AlertCircle className="w-3.5 h-3.5" />
            {urgency.label}
          </span>
          <span className={`badge ${statusCfg.bg} ${statusCfg.color}`}>
            {statusCfg.label}
          </span>
        </div>
      </div>

      <p className="text-slate-700 text-sm leading-relaxed mb-3 line-clamp-2">{request.description}</p>

      {request.symptoms && (
        <p className="text-slate-500 text-sm mb-3">
          <span className="font-medium text-slate-600">Symptoms:</span> {request.symptoms}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-4">
        {request.address && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {request.address}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {timeAgo(request.createdAt)}
        </span>
      </div>

      {isDoctor && request.doctor && request.status !== 'PENDING' && (
        <div className="flex items-center gap-2 text-sm text-slate-600 mb-3 bg-slate-50 rounded-lg p-2.5">
          <User className="w-4 h-4 text-primary-600" />
          <span>Assigned to: <span className="font-medium text-primary-700">{request.doctor.name}</span></span>
        </div>
      )}

      {showActions && (
        <div className="flex gap-2 pt-1">
          {request.status === 'PENDING' && onAccept && (
            <button
              onClick={() => onAccept(request.id)}
              disabled={isAccepting}
              className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-2 min-h-0"
            >
              {isAccepting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Accepting...</>
              ) : (
                <><CheckCircle className="w-4 h-4" /> Accept Request</>
              )}
            </button>
          )}
          {request.status === 'ACCEPTED' && onComplete && (
            <button
              onClick={() => onComplete(request.id)}
              className="bg-medical-600 hover:bg-medical-700 text-white font-semibold flex-1 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Mark Complete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default RequestCard;
