import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types';
import { prisma } from '../lib/prisma';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone, role, specialization, licenseNumber, age, bloodGroup, emergencyContact, emergencyPhone } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ success: false, message: 'Email already registered' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role: role || 'PATIENT',
      },
    });

    if (role === 'DOCTOR' || role === 'NURSE' || role === 'AMBULANCE') {
      await prisma.doctorProfile.create({
        data: {
          userId: user.id,
          specialization: specialization || 'General',
          licenseNumber: licenseNumber || `LIC-${Date.now()}`,
        },
      });
    } else {
      await prisma.patientProfile.create({
        data: {
          userId: user.id,
          age: age ? parseInt(age) : undefined,
          bloodGroup,
          emergencyContact,
          emergencyPhone,
        },
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET!
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone },
    });
  } catch (error) {
    console.error('[Register]', error);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { doctorProfile: true, patientProfile: true },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET!
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        doctorProfile: user.doctorProfile,
        patientProfile: user.patientProfile,
      },
    });
  } catch (error) {
    console.error('[Login]', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        createdAt: true,
        doctorProfile: true,
        patientProfile: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
};
