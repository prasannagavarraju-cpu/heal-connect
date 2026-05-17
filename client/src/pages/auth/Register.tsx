import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Heart, Loader2, AlertCircle, User, Stethoscope } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  role: z.enum(['PATIENT', 'DOCTOR', 'NURSE', 'AMBULANCE']),
  specialization: z.string().optional(),
  licenseNumber: z.string().optional(),
  age: z.string().optional(),
  bloodGroup: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const specializations = [
  'General Physician', 'Cardiologist', 'Neurologist', 'Orthopedic',
  'Pediatrician', 'Gynecologist', 'Dermatologist', 'Psychiatrist',
  'Emergency Medicine', 'Geriatrics', 'Physiotherapist', 'Nurse Practitioner',
];

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const Register = () => {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  const defaultRole = (params.get('role') as FormData['role']) || 'PATIENT';

  const { register, handleSubmit, watch, formState: { errors }, trigger } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: defaultRole },
  });

  const role = watch('role');
  const isDoctor = ['DOCTOR', 'NURSE', 'AMBULANCE'].includes(role);

  const nextStep = async () => {
    const valid = await trigger(['name', 'email', 'password', 'phone', 'role']);
    if (valid) setStep(2);
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await authRegister({
        ...data,
        age: data.age ? parseInt(data.age) : undefined,
      });
      toast.success('Account created successfully!');
      navigate(isDoctor ? '/doctor/dashboard' : '/patient/dashboard');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-slate-100 flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-lg animate-slide-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-12 h-12 bg-primary-700 rounded-2xl flex items-center justify-center shadow-lg">
              <Heart className="w-6 h-6 text-white" fill="currentColor" />
            </div>
            <span className="text-2xl font-bold text-slate-900">HealConnect</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="text-slate-500 mt-1">Step {step} of 2</p>
        </div>

        <div className="flex gap-2 mb-6">
          <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-primary-700' : 'bg-slate-200'}`} />
          <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-primary-700' : 'bg-slate-200'}`} />
        </div>

        <div className="card shadow-lg">
          <form onSubmit={handleSubmit(onSubmit)}>
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">I am a...</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['PATIENT', 'DOCTOR', 'NURSE', 'AMBULANCE'] as const).map((r) => (
                      <label
                        key={r}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          role === r ? 'border-primary-600 bg-primary-50' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <input {...register('role')} type="radio" value={r} className="sr-only" />
                        {r === 'PATIENT' ? <User className={`w-5 h-5 ${role === r ? 'text-primary-700' : 'text-slate-400'}`} /> : <Stethoscope className={`w-5 h-5 ${role === r ? 'text-primary-700' : 'text-slate-400'}`} />}
                        <span className={`font-medium text-sm ${role === r ? 'text-primary-700' : 'text-slate-600'}`}>
                          {r === 'AMBULANCE' ? 'Paramedic' : r.charAt(0) + r.slice(1).toLowerCase()}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                  <input {...register('name')} type="text" placeholder="Your full name" className="input-field" />
                  {errors.name && <p className="flex items-center gap-1.5 text-sm text-emergency-600 mt-1.5"><AlertCircle className="w-4 h-4" />{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                  <input {...register('email')} type="email" placeholder="you@example.com" className="input-field" />
                  {errors.email && <p className="flex items-center gap-1.5 text-sm text-emergency-600 mt-1.5"><AlertCircle className="w-4 h-4" />{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number</label>
                  <input {...register('phone')} type="tel" placeholder="+91 98765 43210" className="input-field" />
                  {errors.phone && <p className="flex items-center gap-1.5 text-sm text-emergency-600 mt-1.5"><AlertCircle className="w-4 h-4" />{errors.phone.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input {...register('password')} type={showPass ? 'text' : 'password'} placeholder="Min 8 characters" className="input-field pr-12" />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="flex items-center gap-1.5 text-sm text-emergency-600 mt-1.5"><AlertCircle className="w-4 h-4" />{errors.password.message}</p>}
                </div>

                <button type="button" onClick={nextStep} className="btn-primary w-full">Continue</button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <h3 className="font-semibold text-slate-900">{isDoctor ? 'Professional Details' : 'Health Profile'}</h3>

                {isDoctor ? (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Specialization</label>
                      <select {...register('specialization')} className="input-field">
                        <option value="">Select specialization</option>
                        {specializations.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Medical License Number</label>
                      <input {...register('licenseNumber')} type="text" placeholder="e.g. MCI-12345678" className="input-field" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Age</label>
                        <input {...register('age')} type="number" placeholder="Your age" className="input-field" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Blood Group</label>
                        <select {...register('bloodGroup')} className="input-field">
                          <option value="">Select</option>
                          {bloodGroups.map((b) => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Emergency Contact Name</label>
                      <input {...register('emergencyContact')} type="text" placeholder="Family member's name" className="input-field" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Emergency Contact Phone</label>
                      <input {...register('emergencyPhone')} type="tel" placeholder="+91 98765 43210" className="input-field" />
                    </div>
                  </>
                )}

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="btn-outline flex-1">Back</button>
                  <button type="submit" disabled={isLoading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" />Creating...</> : 'Create Account'}
                  </button>
                </div>
              </div>
            )}
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-700 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
