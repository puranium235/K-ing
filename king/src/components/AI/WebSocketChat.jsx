import { Client } from '@stomp/stompjs';
import React, { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';

const WebSocketChat = () => {
  const [stompClient, setStompClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    // SockJS를 사용하여 Spring Boot 웹소켓 서버와 연결
    const socket = new SockJS('http://localhost:8080/chat'); // Spring Boot 엔드포인트
    const client = new Client({
      webSocketFactory: () => socket, // SockJS를 사용하여 WebSocket 연결
      reconnectDelay: 5000, // 재연결 대기 시간 (5초)
      onConnect: () => {
        console.log('Connected to WebSocket Server');

        // 메시지 구독
        client.subscribe('/topic/messages', (msg) => {
          setMessages((prev) => [...prev, msg.body]);
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ', frame.headers['message']);
        console.error('Additional details: ', frame.body);
      },
    });

    client.activate(); // STOMP 클라이언트 활성화
    setStompClient(client);

    return () => {
      if (client) {
        client.deactivate(); // 컴포넌트 언마운트 시 연결 해제
      }
    };
  }, []);

  const sendMessage = () => {
    if (stompClient && input) {
      stompClient.publish({
        destination: '/app/message',
        body: JSON.stringify(input),
      });
      setInput('');
    }
  };

  return (
    <div>
      <h2>WebSocket Chat</h2>
      <div>
        {messages.map((msg, idx) => (
          <p key={idx}>{msg}</p>
        ))}
      </div>
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default WebSocketChat;
