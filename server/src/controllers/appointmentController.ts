import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';

const prisma = new PrismaClient();

export const createAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { doctorId, scheduledAt, type, symptoms, notes } = req.body;

    const appointment = await prisma.appointment.create({
      data: {
        patientId: req.user!.id,
        doctorId,
        scheduledAt: new Date(scheduledAt),
        type: type || 'HOME_VISIT',
        symptoms,
        notes,
        status: 'SCHEDULED',
      },
      include: {
        doctor: { select: { id: true, name: true, phone: true, doctorProfile: true } },
        patient: { select: { id: true, name: true, phone: true } },
      },
    });

    await prisma.notification.createMany({
      data: [
        {
          userId: req.user!.id,
          title: 'Appointment Booked',
          message: `Your appointment with Dr. ${appointment.doctor.name} has been scheduled.`,
          type: 'APPOINTMENT',
        },
        {
          userId: doctorId,
          title: 'New Appointment',
          message: `New appointment scheduled with ${appointment.patient.name}.`,
          type: 'APPOINTMENT',
        },
      ],
    });

    res.status(201).json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create appointment' });
  }
};

export const getMyAppointments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const isDoctor = ['DOCTOR', 'NURSE', 'AMBULANCE'].includes(req.user!.role);

    const appointments = await prisma.appointment.findMany({
      where: isDoctor ? { doctorId: req.user!.id } : { patientId: req.user!.id },
      include: {
        doctor: { select: { id: true, name: true, phone: true, avatar: true, doctorProfile: true } },
        patient: { select: { id: true, name: true, phone: true, avatar: true, patientProfile: true } },
      },
      orderBy: { scheduledAt: 'desc' },
    });

    res.json({ success: true, appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch appointments' });
  }
};

export const updateAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params['id'] as string;
    const { status, notes } = req.body;

    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status, notes },
    });

    res.json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update appointment' });
  }
};
