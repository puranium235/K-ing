import { useCallback, useState } from 'react';

import { splitIntoSentences } from '../../util/chatbot';

const useStreamingMessages = () => {
  const [messages, setMessages] = useState([]); // 메시지 상태
  const [isTyping, setIsTyping] = useState(false); // 타이핑 상태

  /**
   * 📩 서버로부터 받은 메시지를 업데이트하는 함수
   * @param {string} receivedText - 서버에서 받은 텍스트 (한 글자씩 또는 문장 단위)
   */
  const updateMessages = useCallback((receivedText) => {
    if (receivedText === '[RESET]') {
      setMessages([]);
      setIsTyping(false);
      return;
    }

    setMessages((prevMessages) => {
      const lastMessage = prevMessages.length > 0 ? prevMessages[prevMessages.length - 1] : null;
      const accumulatedText =
        lastMessage && lastMessage.sender === 'assistant' && !lastMessage.isCompleted
          ? lastMessage.text + receivedText
          : receivedText;

      if (receivedText === '[END]') {
        // ✅ 마지막 메시지를 완료 상태로 업데이트
        return prevMessages.map((msg, index) =>
          index === prevMessages.length - 1 ? { ...msg, isCompleted: true } : msg,
        );
      }

      // ✅ 새로운 문장을 문장 단위로 나누기
      const newMessages = splitIntoSentences(accumulatedText, 'assistant');

      if (lastMessage && lastMessage.sender === 'assistant' && !lastMessage.isCompleted) {
        // ✅ 기존 메시지 업데이트 (이미 존재하는 메시지는 유지)
        return [...prevMessages.slice(0, -1), ...newMessages];
      }

      // ✅ 새로운 메시지 추가
      return [...prevMessages, ...newMessages];
    });

    setIsTyping(receivedText !== '[END]'); // [END]가 오면 타이핑 중지
  }, []);

  return { messages, isTyping, updateMessages, setMessages };
};

export default useStreamingMessages;
