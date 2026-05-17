import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { JwtPayload, SocketUser } from '../types';

const connectedUsers = new Map<string, SocketUser & { socketId: string }>();

export const setupSocketHandlers = (io: Server): void => {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      (socket as Socket & { user: JwtPayload }).user = decoded;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = (socket as Socket & { user: JwtPayload }).user;
    console.log(`[Socket] Connected: ${user.name} (${user.role})`);

    socket.on('join', (data: { latitude?: number; longitude?: number }) => {
      connectedUsers.set(user.id, {
        userId: user.id,
        role: user.role,
        latitude: data.latitude,
        longitude: data.longitude,
        socketId: socket.id,
      });

      if (['DOCTOR', 'NURSE', 'AMBULANCE'].includes(user.role)) {
        socket.join('medical-staff');
      } else {
        socket.join(`patient-${user.id}`);
      }
    });

    socket.on('update-location', (data: { latitude: number; longitude: number }) => {
      const existing = connectedUsers.get(user.id);
      if (existing) {
        connectedUsers.set(user.id, { ...existing, ...data });
      }
    });

    socket.on('new-emergency-request', (requestData) => {
      io.to('medical-staff').emit('emergency-request', {
        ...requestData,
        patient: { id: user.id, name: user.name },
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('request-accepted', (data: { requestId: string; patientId: string; doctorName: string }) => {
      io.to(`patient-${data.patientId}`).emit('your-request-accepted', {
        requestId: data.requestId,
        doctorName: data.doctorName,
        message: `Dr. ${data.doctorName} has accepted your request and is on the way.`,
      });
    });

    socket.on('request-status-update', (data: { requestId: string; patientId: string; status: string }) => {
      io.to(`patient-${data.patientId}`).emit('request-updated', data);
    });

    socket.on('send-message', (data: { to: string; message: string; requestId?: string }) => {
      const targetUser = connectedUsers.get(data.to);
      if (targetUser) {
        io.to(targetUser.socketId).emit('receive-message', {
          from: user.id,
          fromName: user.name,
          message: data.message,
          requestId: data.requestId,
          timestamp: new Date().toISOString(),
        });
      }
    });

    socket.on('disconnect', () => {
      connectedUsers.delete(user.id);
      console.log(`[Socket] Disconnected: ${user.name}`);
    });
  });
};
