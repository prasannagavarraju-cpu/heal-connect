export type Role = 'PATIENT' | 'DOCTOR' | 'NURSE' | 'AMBULANCE' | 'ADMIN';
export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AppointmentType = 'HOME_VISIT' | 'VIDEO_CALL' | 'CLINIC';
export type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  avatar?: string;
  createdAt?: string;
  doctorProfile?: DoctorProfile;
  patientProfile?: PatientProfile;
}

export interface DoctorProfile {
  id: string;
  userId: string;
  specialization: string;
  licenseNumber: string;
  experience: number;
  bio?: string;
  isAvailable: boolean;
  latitude?: number;
  longitude?: number;
  serviceRadius: number;
  rating: number;
  totalReviews: number;
  consultationFee: number;
}

export interface PatientProfile {
  id: string;
  userId: string;
  age?: number;
  bloodGroup?: string;
  medicalHistory?: string;
  allergies?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  address?: string;
}

export interface MedicalRequest {
  id: string;
  patientId: string;
  doctorId?: string;
  description: string;
  symptoms?: string;
  latitude: number;
  longitude: number;
  address?: string;
  urgencyLevel: UrgencyLevel;
  status: RequestStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  patient?: Partial<User>;
  doctor?: Partial<User>;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  scheduledAt: string;
  type: AppointmentType;
  status: AppointmentStatus;
  symptoms?: string;
  notes?: string;
  createdAt: string;
  patient?: Partial<User>;
  doctor?: Partial<User>;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
