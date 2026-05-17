import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
  name: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
}

export interface EmergencyRequestPayload {
  description: string;
  symptoms?: string;
  latitude: number;
  longitude: number;
  address?: string;
  urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface SocketUser {
  userId: string;
  role: string;
  latitude?: number;
  longitude?: number;
}
