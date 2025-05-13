import { useState, useEffect, useRef } from 'react';
import { WebSocketMessage } from '@/types';

export default function useWebSocket(clusterId?: number) {
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'open' | 'closed'>('connecting');
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Create WebSocket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;
    
    socket.onopen = () => {
      setConnectionStatus('open');
      console.log('WebSocket connection established');
      
      // Subscribe to cluster updates if clusterId is provided
      if (clusterId) {
        socket.send(JSON.stringify({
          type: 'subscribe',
          clusterId
        }));
      }
    };
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };
    
    socket.onclose = () => {
      setConnectionStatus('closed');
      console.log('WebSocket connection closed');
    };
    
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    // Clean up WebSocket connection on unmount
    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [clusterId]);
  
  // If clusterId changes, resubscribe
  useEffect(() => {
    const socket = socketRef.current;
    if (socket && socket.readyState === WebSocket.OPEN && clusterId) {
      socket.send(JSON.stringify({
        type: 'subscribe',
        clusterId
      }));
    }
  }, [clusterId]);

  return {
    lastMessage,
    connectionStatus,
    sendMessage: (data: any) => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify(data));
      } else {
        console.error('WebSocket is not connected');
      }
    }
  };
}
