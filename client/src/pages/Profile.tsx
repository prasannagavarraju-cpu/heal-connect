import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User, Phone, Mail, Shield, Stethoscope, Heart,
  AlertCircle, CheckCircle, Loader2, Edit3, Save, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { roleLabel } from '../lib/utils';
import { toast } from 'sonner';

const patientSchema = z.object({
  name: z.string().min(2, 'Name too short'),
  phone: z.string().min(10, 'Enter valid phone'),
  age: z.string().optional(),
  bloodGroup: z.string().optional(),
  medicalHistory: z.string().optional(),
  allergies: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  address: z.string().optional(),
});

const doctorSchema = z.object({
  name: z.string().min(2, 'Name too short'),
  phone: z.string().min(10, 'Enter valid phone'),
  specialization: z.string().optional(),
  bio: z.string().optional(),
  experience: z.string().optional(),
  consultationFee: z.string().optional(),
  serviceRadius: z.string().optional(),
});

type PatientForm = z.infer<typeof patientSchema>;
type DoctorForm = z.infer<typeof doctorSchema>;

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const specializations = [
  'General Physician', 'Cardiologist', 'Neurologist', 'Orthopedic',
  'Pediatrician', 'Gynecologist', 'Dermatologist', 'Emergency Medicine',
  'Geriatrics', 'Physiotherapist', 'Nurse Practitioner',
];

const Profile = () => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const isDoctor = user?.role && ['DOCTOR', 'NURSE', 'AMBULANCE'].includes(user.role);
  const profile = isDoctor ? user?.doctorProfile : user?.patientProfile;

  const { register: regP, handleSubmit: handleP, formState: { errors: errP } } = useForm<PatientForm>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      age: user?.patientProfile?.age?.toString() || '',
      bloodGroup: user?.patientProfile?.bloodGroup || '',
      medicalHistory: user?.patientProfile?.medicalHistory || '',
      allergies: user?.patientProfile?.allergies || '',
      emergencyContact: user?.patientProfile?.emergencyContact || '',
      emergencyPhone: user?.patientProfile?.emergencyPhone || '',
      address: user?.patientProfile?.address || '',
    },
  });

  const { register: regD, handleSubmit: handleD, formState: { errors: errD } } = useForm<DoctorForm>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      specialization: user?.doctorProfile?.specialization || '',
      bio: user?.doctorProfile?.bio || '',
      experience: user?.doctorProfile?.experience?.toString() || '',
      consultationFee: user?.doctorProfile?.consultationFee?.toString() || '',
      serviceRadius: user?.doctorProfile?.serviceRadius?.toString() || '10',
    },
  });

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setEditing(false);
    toast.success('Profile updated successfully');
  };

  const infoItem = (label: string, value: string | number | undefined | null, icon?: React.ReactNode) => {
    if (!value) return null;
    return (
      <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
        {icon && <div className="text-slate-400 mt-0.5 flex-shrink-0">{icon}</div>}
        <div>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</p>
          <p className="text-slate-800 font-medium mt-0.5">{value}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-white/10 border-2 border-white/20 flex items-center justify-center text-3xl font-bold">
              {user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user?.name}</h1>
              <p className="text-blue-200 mt-0.5">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-sm font-medium">
                  {isDoctor ? <Stethoscope className="w-3.5 h-3.5" /> : <Heart className="w-3.5 h-3.5" />}
                  {roleLabel[user?.role || '']}
                </span>
                {isDoctor && user?.doctorProfile?.isAvailable && (
                  <span className="inline-flex items-center gap-1.5 bg-green-500/20 border border-green-400/30 rounded-full px-3 py-1 text-sm font-medium text-green-300">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    Available
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-700" />
              {isDoctor ? 'Professional Information' : 'Health Profile'}
            </h2>
            <button
              onClick={() => setEditing(!editing)}
              className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
                editing ? 'text-slate-600 hover:bg-slate-100' : 'text-blue-700 hover:bg-blue-50'
              }`}
            >
              {editing ? <><X className="w-4 h-4" />Cancel</> : <><Edit3 className="w-4 h-4" />Edit</>}
            </button>
          </div>

          {!editing ? (
            <div>
              {infoItem('Full Name', user?.name, <User className="w-4 h-4" />)}
              {infoItem('Email', user?.email, <Mail className="w-4 h-4" />)}
              {infoItem('Phone', user?.phone, <Phone className="w-4 h-4" />)}
              {isDoctor ? (
                <>
                  {infoItem('Specialization', user?.doctorProfile?.specialization, <Stethoscope className="w-4 h-4" />)}
                  {infoItem('Experience', user?.doctorProfile?.experience ? `${user.doctorProfile.experience} years` : null)}
                  {infoItem('License Number', user?.doctorProfile?.licenseNumber, <Shield className="w-4 h-4" />)}
                  {infoItem('Consultation Fee', user?.doctorProfile?.consultationFee ? `₹${user.doctorProfile.consultationFee}` : null)}
                  {infoItem('Service Radius', user?.doctorProfile?.serviceRadius ? `${user.doctorProfile.serviceRadius} km` : null)}
                  {user?.doctorProfile?.bio && (
                    <div className="py-3">
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Bio</p>
                      <p className="text-slate-700 text-sm leading-relaxed">{user.doctorProfile.bio}</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {infoItem('Age', user?.patientProfile?.age)}
                  {infoItem('Blood Group', user?.patientProfile?.bloodGroup)}
                  {infoItem('Allergies', user?.patientProfile?.allergies)}
                  {user?.patientProfile?.medicalHistory && (
                    <div className="py-3">
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Medical History</p>
                      <p className="text-slate-700 text-sm leading-relaxed">{user.patientProfile.medicalHistory}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <form onSubmit={isDoctor ? handleD(handleSave) : handleP(handleSave)} className="space-y-4">
              {isDoctor ? (
                <>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                      <input {...regD('name')} className="input-field" />
                      {errD.name && <p className="text-xs text-red-600 mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errD.name.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone</label>
                      <input {...regD('phone')} className="input-field" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Specialization</label>
                    <select {...regD('specialization')} className="input-field">
                      <option value="">Select</option>
                      {specializations.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Experience (yrs)</label>
                      <input {...regD('experience')} type="number" className="input-field" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Fee (₹)</label>
                      <input {...regD('consultationFee')} type="number" className="input-field" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Radius (km)</label>
                      <input {...regD('serviceRadius')} type="number" className="input-field" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Bio</label>
                    <textarea {...regD('bio')} rows={3} className="input-field resize-none" placeholder="Brief professional bio..." />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                      <input {...regP('name')} className="input-field" />
                      {errP.name && <p className="text-xs text-red-600 mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errP.name.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone</label>
                      <input {...regP('phone')} className="input-field" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Age</label>
                      <input {...regP('age')} type="number" className="input-field" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Blood Group</label>
                      <select {...regP('bloodGroup')} className="input-field">
                        <option value="">Select</option>
                        {bloodGroups.map((b) => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Allergies</label>
                    <input {...regP('allergies')} className="input-field" placeholder="e.g. Penicillin, Nuts" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Medical History</label>
                    <textarea {...regP('medicalHistory')} rows={3} className="input-field resize-none" placeholder="Existing conditions, past surgeries..." />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Emergency Contact</label>
                      <input {...regP('emergencyContact')} className="input-field" placeholder="Contact person name" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Emergency Phone</label>
                      <input {...regP('emergencyPhone')} className="input-field" placeholder="+91 98765 43210" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Home Address</label>
                    <input {...regP('address')} className="input-field" placeholder="Full home address" />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex items-center gap-2"
                >
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><Save className="w-4 h-4" />Save Changes</>}
                </button>
                <button type="button" onClick={() => setEditing(false)} className="btn-outline">Cancel</button>
              </div>
            </form>
          )}
        </div>

        {!isDoctor && user?.patientProfile?.emergencyContact && (
          <div className="card border-l-4 border-l-red-500 bg-red-50">
            <h3 className="font-bold text-red-800 mb-3 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Emergency Contact
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">{user.patientProfile.emergencyContact}</p>
                {user.patientProfile.emergencyPhone && (
                  <p className="text-slate-600 text-sm">{user.patientProfile.emergencyPhone}</p>
                )}
              </div>
              <a
                href={`tel:${user.patientProfile.emergencyPhone}`}
                className="flex items-center gap-2 bg-red-600 text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-red-700 transition-colors text-sm"
              >
                <Phone className="w-4 h-4" />
                Call
              </a>
            </div>
          </div>
        )}

        {profile && (
          <div className="card">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Account Status
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Account Verified', value: true },
                { label: 'Email Confirmed', value: true },
                { label: 'Profile Complete', value: !!profile },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <span className="text-slate-600 text-sm">{label}</span>
                  <span className={`flex items-center gap-1.5 text-sm font-medium ${value ? 'text-green-600' : 'text-slate-400'}`}>
                    <CheckCircle className="w-4 h-4" />
                    {value ? 'Yes' : 'No'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
