import type { UrgencyLevel, RequestStatus, AppointmentStatus } from '../types';

export const urgencyConfig: Record<UrgencyLevel, { label: string; color: string; bg: string; border: string }> = {
  CRITICAL: { label: 'Critical', color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-300' },
  HIGH: { label: 'High', color: 'text-orange-700', bg: 'bg-orange-100', border: 'border-orange-300' },
  MEDIUM: { label: 'Medium', color: 'text-yellow-700', bg: 'bg-yellow-100', border: 'border-yellow-300' },
  LOW: { label: 'Low', color: 'text-green-700', bg: 'bg-green-100', border: 'border-green-300' },
};

export const requestStatusConfig: Record<RequestStatus, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Pending', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  ACCEPTED: { label: 'Accepted', color: 'text-blue-700', bg: 'bg-blue-100' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-indigo-700', bg: 'bg-indigo-100' },
  COMPLETED: { label: 'Completed', color: 'text-green-700', bg: 'bg-green-100' },
  CANCELLED: { label: 'Cancelled', color: 'text-slate-600', bg: 'bg-slate-100' },
};

export const appointmentStatusConfig: Record<AppointmentStatus, { label: string; color: string; bg: string }> = {
  SCHEDULED: { label: 'Scheduled', color: 'text-blue-700', bg: 'bg-blue-100' },
  CONFIRMED: { label: 'Confirmed', color: 'text-indigo-700', bg: 'bg-indigo-100' },
  COMPLETED: { label: 'Completed', color: 'text-green-700', bg: 'bg-green-100' },
  CANCELLED: { label: 'Cancelled', color: 'text-slate-600', bg: 'bg-slate-100' },
  NO_SHOW: { label: 'No Show', color: 'text-red-700', bg: 'bg-red-100' },
};

export const roleLabel: Record<string, string> = {
  PATIENT: 'Patient',
  DOCTOR: 'Doctor',
  NURSE: 'Nurse',
  AMBULANCE: 'Ambulance',
  ADMIN: 'Admin',
};

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const timeAgo = (date: string): string => {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
