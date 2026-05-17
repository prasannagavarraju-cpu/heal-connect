import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import type { MedicalRequest } from '../types';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  liveRequests: MedicalRequest[];
  clearLiveRequests: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { token, isAuthenticated, user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [liveRequests, setLiveRequests] = useState<MedicalRequest[]>([]);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      navigator.geolocation?.getCurrentPosition((pos) => {
        socket.emit('join', {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      }, () => {
        socket.emit('join', {});
      });
    });

    socket.on('disconnect', () => setIsConnected(false));

    if (user?.role && ['DOCTOR', 'NURSE', 'AMBULANCE'].includes(user.role)) {
      socket.on('emergency-request', (data: MedicalRequest) => {
        setLiveRequests((prev) => [data, ...prev.slice(0, 49)]);
      });
    }

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [isAuthenticated, token, user?.role]);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        liveRequests,
        clearLiveRequests: () => setLiveRequests([]),
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
};
