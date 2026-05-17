import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, AlertTriangle } from 'lucide-react';

interface EmergencyButtonProps {
  size?: 'sm' | 'lg';
  className?: string;
}

const EmergencyButton = ({ size = 'lg', className = '' }: EmergencyButtonProps) => {
  const navigate = useNavigate();
  const [pressing, setPressing] = useState(false);

  const handlePress = () => {
    setPressing(true);
    setTimeout(() => {
      setPressing(false);
      navigate('/patient/emergency');
    }, 200);
  };

  if (size === 'sm') {
    return (
      <button
        onClick={handlePress}
        className={`btn-emergency flex items-center justify-center gap-2.5 ${className}`}
      >
        <AlertTriangle className="w-5 h-5" />
        Emergency
      </button>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <button
        onClick={handlePress}
        className={`relative w-36 h-36 rounded-full bg-emergency-600 text-white shadow-2xl
          flex flex-col items-center justify-center gap-2 transition-all duration-200
          hover:bg-emergency-700 active:scale-95 focus:outline-none
          focus:ring-4 focus:ring-emergency-400 focus:ring-offset-4
          ${pressing ? 'scale-95 shadow-lg' : 'hover:scale-105 shadow-2xl'}
        `}
      >
        <span className="absolute inset-0 rounded-full bg-emergency-500 animate-ping opacity-25" />
        <Phone className="w-10 h-10" fill="currentColor" />
        <span className="text-base font-bold tracking-wider">SOS</span>
      </button>
      <p className="text-sm font-medium text-slate-600 text-center">
        Tap for emergency<br />medical assistance
      </p>
    </div>
  );
};

export default EmergencyButton;
