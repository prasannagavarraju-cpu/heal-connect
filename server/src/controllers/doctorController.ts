import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';

const prisma = new PrismaClient();

const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const getNearbyDoctors = async (req: Request, res: Response): Promise<void> => {
  try {
    const latitude = req.query.latitude as string | undefined;
    const longitude = req.query.longitude as string | undefined;
    const radius = (req.query.radius as string | undefined) ?? '20';
    const specialization = req.query.specialization as string | undefined;

    const doctors = await prisma.user.findMany({
      where: {
        role: { in: ['DOCTOR', 'NURSE', 'AMBULANCE'] },
        doctorProfile: {
          isAvailable: true,
          ...(specialization ? { specialization } : {}),
        },
      },
      select: {
        id: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
        doctorProfile: true,
      },
    });

    const lat = latitude ? parseFloat(latitude) : NaN;
    const lon = longitude ? parseFloat(longitude) : NaN;
    const rad = parseFloat(radius);

    const nearby = lat && lon
      ? doctors.filter((d) => {
          if (!d.doctorProfile?.latitude || !d.doctorProfile?.longitude) return false;
          return haversineDistance(lat, lon, d.doctorProfile.latitude, d.doctorProfile.longitude) <= rad;
        })
      : doctors;

    res.json({ success: true, doctors: nearby });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch doctors' });
  }
};

export const updateAvailability = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { isAvailable, latitude, longitude } = req.body;

    const profile = await prisma.doctorProfile.update({
      where: { userId: req.user!.id },
      data: {
        isAvailable,
        ...(latitude !== undefined ? { latitude } : {}),
        ...(longitude !== undefined ? { longitude } : {}),
      },
    });

    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update availability' });
  }
};

export const getDoctorProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params['id'] as string;

    const doctor = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
        createdAt: true,
        doctorProfile: true,
      },
    });

    if (!doctor) {
      res.status(404).json({ success: false, message: 'Doctor not found' });
      return;
    }

    res.json({ success: true, doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch doctor profile' });
  }
};
