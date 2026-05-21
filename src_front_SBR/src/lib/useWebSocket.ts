import { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export function useWebSocket(topic: string = '/topic/tareas') {
  const [messages, setMessages] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Definimos el cliente STOMP
    const client = new Client({
      // Usamos SockJS como fallback si el entorno no soporta WebSockets puros
      webSocketFactory: () => {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        return new SockJS(`${baseUrl}/ws`);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      setIsConnected(true);
      console.log('Conectado al WebSocket!');
      
      // Nos suscribimos al tópico
      client.subscribe(topic, (message) => {
        if (message.body) {
          console.log('Mensaje recibido: ', message.body);
          setMessages((prev) => [...prev, message.body]);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error('Error STOMP: ', frame.headers['message']);
      console.error('Detalles: ', frame.body);
    };

    // Iniciamos la conexión
    client.activate();

    // Limpieza al desmontar el componente
    return () => {
      client.deactivate();
    };
  }, [topic]);

  return { messages, isConnected };
}
