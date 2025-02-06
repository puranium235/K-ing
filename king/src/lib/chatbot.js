import { client } from './axios';

export const getChatHistory = async () => {
  try {
    const response = await client.get('/chatbot/');
    return response.data;
  } catch (err) {
    console.error('대화 기록을 불러오지 못했습니다:', err);
    return [];
  }
};

export const saveChatHistory = async (role, content, type) => {
  try {
    await client.post('/chatbot/save', {
      role,
      content,
      type,
    });
  } catch (error) {
    console.error('Error saving chat history:', error);
  }
};

export const deleteChatHistory = async () => {
  try {
    await client.delete('/chatbot/');
  } catch (error) {
    console.error('Error deleting chat history:', error);
  }
};

export const getResponse = async (currentApi, userMessage) => {
  try {
    const response = await client.post(currentApi, { userMessage });
    return response.data.message;
  } catch (error) {
    console.error('Error fetching AI response:', error);
    return 'AI 응답을 불러오지 못했습니다.';
  }
};

export const fetchStreamResponse = async (currentApi, userMessage, updateMessageBubble) => {
  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('accessToken');
  console.log('🔍 Access Token:', token);

  const response = await fetch(`${baseURL}${currentApi}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userMessage }),
    credentials: 'include', // ✅ 쿠키/세션을 포함하여 요청
  });

  if (!response.ok || !response.body) {
    throw new Error(`Failed to fetch STREAMING response (${response.status})`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let accumulatedResponse = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true }).trim();

    // ✅ "[END]" 메시지가 오면 스트리밍 종료
    if (chunk === '[END]') {
      console.log('✅ 스트리밍 종료 감지');
      break;
    }

    accumulatedResponse += chunk; // 🔹 전체 메시지를 누적하여 저장
    updateMessageBubble(accumulatedResponse); // 🔹 메시지 버블 업데이트 (실시간 표시)
  }

  return accumulatedResponse; // 🔹 최종 전체 응답 반환
};
