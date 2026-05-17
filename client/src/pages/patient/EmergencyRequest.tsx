import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Loader2, AlertTriangle, CheckCircle, Phone } from 'lucide-react';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useSocket } from '../../context/SocketContext';
import api from '../../lib/api';
import { toast } from 'sonner';

const schema = z.object({
  description: z.string().min(10, 'Please describe your situation in at least 10 characters'),
  symptoms: z.string().optional(),
  urgencyLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  address: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const urgencyOptions = [
  { value: 'LOW', label: 'Routine', desc: 'Not urgent, general consultation needed', color: 'border-green-300 bg-green-50 text-green-700' },
  { value: 'MEDIUM', label: 'Moderate', desc: 'Needs attention soon', color: 'border-yellow-300 bg-yellow-50 text-yellow-700' },
  { value: 'HIGH', label: 'Urgent', desc: 'Requires prompt medical attention', color: 'border-orange-300 bg-orange-50 text-orange-700' },
  { value: 'CRITICAL', label: 'Emergency', desc: 'Life-threatening, need help immediately', color: 'border-red-300 bg-red-50 text-red-700' },
];

const EmergencyRequest = () => {
  const navigate = useNavigate();
  const { latitude, longitude, isLoading: geoLoading, error: geoError, getCurrentLocation } = useGeolocation();
  const { socket } = useSocket();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [requestId, setRequestId] = useState('');

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { urgencyLevel: 'MEDIUM' },
  });

  const urgency = watch('urgencyLevel');
  const isCritical = urgency === 'CRITICAL';

  const handleGetLocation = async () => {
    try {
      await getCurrentLocation();
      toast.success('Location captured successfully');
    } catch {
      toast.error('Could not get your location. Please check browser permissions.');
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!latitude || !longitude) {
      toast.error('Please share your location first');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/requests', {
        ...data,
        latitude,
        longitude,
      });

      const req = res.data.request;
      setRequestId(req.id);

      socket?.emit('new-emergency-request', {
        id: req.id,
        description: data.description,
        symptoms: data.symptoms,
        urgencyLevel: data.urgencyLevel,
        latitude,
        longitude,
        address: data.address,
      });

      setSubmitted(true);
      toast.success('Emergency request sent! Nearby doctors are being notified.');
    } catch {
      toast.error('Failed to send request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center animate-slide-up">
          <div className="w-24 h-24 bg-medical-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-medical-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">Request Sent!</h1>
          <p className="text-slate-600 mb-2">
            Nearby doctors have been notified. Someone will accept and be on the way shortly.
          </p>
          <p className="text-sm text-slate-400 mb-8">Request ID: <span className="font-mono font-medium">{requestId.slice(0, 8)}...</span></p>

          <div className="card mb-6 text-left">
            <h3 className="font-semibold text-slate-900 mb-3">What happens next?</h3>
            <ol className="space-y-2.5 text-sm text-slate-600">
              {[
                'A nearby doctor reviews your request',
                'They accept and their location is shared with you',
                'You receive real-time updates on their arrival',
                'Doctor arrives and provides medical assistance',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="flex gap-3">
            <a href="tel:112" className="btn-emergency flex-1 flex items-center justify-center gap-2">
              <Phone className="w-5 h-5" /> Call 112
            </a>
            <button onClick={() => navigate('/patient/dashboard')} className="btn-outline flex-1">
              Track Status
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className={`${isCritical ? 'bg-emergency-600' : 'bg-primary-800'} text-white py-8 transition-colors duration-300`}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-6 h-6" />
            <h1 className="text-2xl font-bold">
              {isCritical ? 'Emergency SOS' : 'Request Medical Help'}
            </h1>
          </div>
          <p className="text-blue-100 text-sm">
            {isCritical
              ? 'Help is on the way. Fill out the form and we\'ll alert nearby emergency staff immediately.'
              : 'Describe your situation and we\'ll connect you with a nearby doctor.'}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="card">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">1</span>
              Select Urgency Level
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {urgencyOptions.map(({ value, label, desc, color }) => (
                <label
                  key={value}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    urgency === value ? color : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <input {...register('urgencyLevel')} type="radio" value={value} className="sr-only" />
                  <div className="font-bold text-sm">{label}</div>
                  <div className="text-xs mt-0.5 opacity-80">{desc}</div>
                </label>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">2</span>
              Share Your Location
            </h3>
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={geoLoading}
              className={`w-full py-4 rounded-xl border-2 border-dashed font-medium transition-all flex items-center justify-center gap-3 text-base ${
                latitude
                  ? 'border-green-400 bg-green-50 text-green-700'
                  : 'border-primary-300 bg-primary-50 text-primary-700 hover:border-primary-400'
              }`}
            >
              {geoLoading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Getting location...</>
              ) : latitude ? (
                <><CheckCircle className="w-5 h-5" /> Location Captured</>
              ) : (
                <><MapPin className="w-5 h-5" /> Tap to Share My Location</>
              )}
            </button>
            {latitude && (
              <p className="text-xs text-slate-400 mt-2 text-center">
                {latitude.toFixed(5)}, {longitude?.toFixed(5)}
              </p>
            )}
            {geoError && <p className="text-sm text-emergency-600 mt-2">{geoError}</p>}
            <div className="mt-3">
              <input
                {...register('address')}
                type="text"
                placeholder="Nearby landmark or address (optional)"
                className="input-field"
              />
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">3</span>
              Describe Your Situation
            </h3>
            <textarea
              {...register('description')}
              rows={4}
              placeholder="E.g. I am having severe chest pain since 30 minutes. I am 72 years old and alone at home..."
              className="input-field resize-none"
            />
            {errors.description && (
              <p className="text-sm text-emergency-600 mt-1.5">{errors.description.message}</p>
            )}
            <div className="mt-4">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Symptoms (optional)</label>
              <input
                {...register('symptoms')}
                type="text"
                placeholder="e.g. Chest pain, breathlessness, dizziness"
                className="input-field"
              />
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={isSubmitting || !latitude}
              className={`w-full flex items-center justify-center gap-3 font-bold text-lg py-5 rounded-2xl transition-all shadow-xl
                ${isCritical
                  ? 'bg-emergency-600 hover:bg-emergency-700 text-white focus:ring-emergency-400'
                  : 'btn-primary'
                } disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {isSubmitting ? (
                <><Loader2 className="w-6 h-6 animate-spin" />Sending Request...</>
              ) : (
                <><AlertTriangle className="w-6 h-6" />{isCritical ? 'Send Emergency SOS' : 'Request Medical Help'}</>
              )}
            </button>

            <div className="text-center text-sm text-slate-500">— or call directly —</div>

            <a
              href="tel:112"
              className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white font-bold text-lg py-4 rounded-2xl hover:bg-slate-800 transition-colors"
            >
              <Phone className="w-5 h-5" fill="currentColor" />
              Call Emergency: 112
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmergencyRequest;
