import { Response } from 'express';
import { AuthRequest, EmergencyRequestPayload } from '../types';
import { prisma } from '../lib/prisma';

const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const createRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { description, symptoms, latitude, longitude, address, urgencyLevel }: EmergencyRequestPayload = req.body;

    const request = await prisma.medicalRequest.create({
      data: {
        patientId: req.user!.id,
        description,
        symptoms,
        latitude,
        longitude,
        address,
        urgencyLevel: urgencyLevel || 'MEDIUM',
        status: 'PENDING',
      },
      include: {
        patient: {
          select: { id: true, name: true, phone: true, patientProfile: true },
        },
      },
    });

    await prisma.notification.create({
      data: {
        userId: req.user!.id,
        title: 'Request Submitted',
        message: 'Your medical request has been submitted. Nearby doctors are being notified.',
        type: 'REQUEST',
      },
    });

    res.status(201).json({ success: true, request });
  } catch (error) {
    console.error('[CreateRequest]', error);
    res.status(500).json({ success: false, message: 'Failed to create request' });
  }
};

export const getNearbyRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const latitude = req.query.latitude as string | undefined;
    const longitude = req.query.longitude as string | undefined;
    const radius = (req.query.radius as string | undefined) ?? '20';

    const requests = await prisma.medicalRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        patient: {
          select: { id: true, name: true, phone: true, avatar: true, patientProfile: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const lat = latitude ? parseFloat(latitude) : NaN;
    const lon = longitude ? parseFloat(longitude) : NaN;
    const rad = parseFloat(radius);

    const nearby = lat && lon
      ? requests.filter((r) => haversineDistance(lat, lon, r.latitude, r.longitude) <= rad)
      : requests;

    res.json({ success: true, requests: nearby });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch requests' });
  }
};

export const acceptRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params['id'] as string;

    const existing = await prisma.medicalRequest.findUnique({ where: { id } });
    if (!existing || existing.status !== 'PENDING') {
      res.status(400).json({ success: false, message: 'Request not available' });
      return;
    }

    const request = await prisma.medicalRequest.update({
      where: { id },
      data: { doctorId: req.user!.id, status: 'ACCEPTED' },
      include: {
        patient: { select: { id: true, name: true, phone: true } },
        doctor: { select: { id: true, name: true, phone: true, doctorProfile: true } },
      },
    });

    await prisma.notification.create({
      data: {
        userId: request.patientId,
        title: 'Request Accepted',
        message: `Dr. ${req.user!.name} has accepted your request and is on the way.`,
        type: 'REQUEST_ACCEPTED',
      },
    });

    res.json({ success: true, request });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to accept request' });
  }
};

export const updateRequestStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params['id'] as string;
    const { status, notes } = req.body;

    const request = await prisma.medicalRequest.update({
      where: { id },
      data: { status, notes },
      include: {
        patient: { select: { id: true, name: true } },
      },
    });

    res.json({ success: true, request });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update request' });
  }
};

export const getMyRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const isDoctor = ['DOCTOR', 'NURSE', 'AMBULANCE'].includes(req.user!.role);

    const requests = await prisma.medicalRequest.findMany({
      where: isDoctor ? { doctorId: req.user!.id } : { patientId: req.user!.id },
      include: {
        patient: { select: { id: true, name: true, phone: true, avatar: true } },
        doctor: { select: { id: true, name: true, phone: true, doctorProfile: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch requests' });
  }
};
