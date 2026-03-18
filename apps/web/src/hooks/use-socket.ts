'use client';

import { type MutableRefObject, useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';

import { getAccessToken } from '@/lib/api-client';
import { toast } from '@/hooks/use-toast';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:4000';

export function useSocket(): MutableRefObject<Socket | null> {
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    const socket = io(`${SOCKET_URL}/notifications`, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 3000,
      reconnectionAttempts: 10,
    });

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('notification', (data: { title: string; message: string }) => {
      toast({ title: data.title, description: data.message });
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    socket.on('unread-count-update', () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [queryClient]);

  return socketRef;
}
