import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import SendIcon from '../../assets/icons/chat-send.png';
import KingIcon from '../../assets/icons/king_character.png';
import RefreshIcon from '../../assets/icons/refresh.png';
import { deleteChatHistory, getChatHistory, saveChatHistory } from '../../lib/chatbot';
import {
  closeWebSocket,
  connectWebSocket,
  isWebSocketConnected,
  sendMessageViaWebSocket,
} from '../../lib/websocket';
import { splitIntoSentences } from '../../util/chatbot';
import BackButton from '../common/button/BackButton';
import ButtonMessageBubbleComponent from './ButtonMessageBubbleComponent';
import TypingIndicator from './TypingIndicator';
import useStreamingMessages from './useStreamingMessages';

const AIChatView = () => {
  const { messages, isTyping, updateMessages, setMessages, setIsTyping } = useStreamingMessages();
  const [newMessage, setNewMessage] = useState('');
  const [isBotSelected, setIsBotSelected] = useState(false);
  const [currentApi, setCurrentApi] = useState('');
  const [isComposing, setIsComposing] = useState(false); //맥북 한글입력 중복 방지,,

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL;

  const chatT = '데이터 기반 장소 검색 T봇';
  const chatF = '맞춤 큐레이션 추천 F봇';

  const saveInitialMessage = async () => {
    const initialMessage = {
      text: '어떤 MBTI의 챗봇을 원하시나요?',
      sender: 'assistant',
      type: 'message',
    };
    setMessages([initialMessage]);
    await saveChatHistory('assistant', initialMessage.text, 'message');
  };

  const handleRefresh = async () => {
    await deleteChatHistory();

    updateMessages('[RESET]');
    setNewMessage('');
    setCurrentApi('');
    setIsBotSelected(false);

    await saveInitialMessage();
  };

  // ✅ WebSocket 연결
  useEffect(() => {
    if (!isBotSelected || !currentApi) return;

    console.log('🔹 WebSocket 연결 시도:', currentApi);
    connectWebSocket(currentApi, updateMessages);

    return () => {
      closeWebSocket(); // ✅ 컴포넌트 언마운트 시 WebSocket 닫기
    };
  }, [isBotSelected, currentApi, updateMessages]);

  const sendMessage = async () => {
    if (newMessage.trim() === '') {
      console.error('⚠️ 메시지가 비어 있음.');
      return;
    }

    if (!isWebSocketConnected()) {
      console.error('⚠️ WebSocket이 닫혀 있음.');
      return;
    }

    const userMessage = { text: newMessage, sender: 'user', type: 'message' };
    setMessages((prev) => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    sendMessageViaWebSocket(newMessage);
  };

  useEffect(() => {
    const fetchChatHistory = async () => {
      const data = await getChatHistory();

      if (data.length > 0) {
        let newMessages = [];
        let detectedBotType = '';

        data.forEach((msg) => {
          if (msg.type === 'option') {
            detectedBotType = msg.content;
          }

          if (msg.role === 'assistant') {
            newMessages = [...newMessages, ...splitIntoSentences(msg.content, 'assistant')];
          } else {
            newMessages.push({ text: msg.content, sender: msg.role });
          }
        });

        if (detectedBotType) {
          setCurrentApi(
            detectedBotType === chatT ? `${WS_BASE_URL}/ws/chatT` : `${WS_BASE_URL}/ws/chatF`,
          );
          setIsBotSelected(true);
        }

        setMessages(newMessages);
      } else {
        saveInitialMessage();
        setIsBotSelected(false);
      }
    };

    fetchChatHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ✅ 챗봇 선택
  const handleOptionClick = async (option) => {
    const optionMessage = { text: option, sender: 'option', type: 'option' };
    setMessages((prev) => [...prev, optionMessage]);
    await saveChatHistory('option', option, 'option');

    let aiMessage;
    if (option === chatT) {
      setCurrentApi(`${WS_BASE_URL}/ws/chatT`);
      aiMessage = `안녕하세요! 저는 K-Guide, 한국 콘텐츠 속 촬영지를 정확하게 찾아드리는 챗봇입니다.`;
    } else if (option === chatF) {
      setCurrentApi(`${WS_BASE_URL}/ws/chatF`);
      aiMessage = `안녕하세요! 저는 K-Mood, 감성을 담은 맞춤 큐레이션을 추천하는 챗봇입니다. 💫🎭`;
    }
    setIsBotSelected(true);

    updateMessages(aiMessage);
    updateMessages('[END]');
    await saveChatHistory('assistant', aiMessage, 'message');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && isBotSelected) {
      if (isComposing) {
        return; // ✅ IME 입력 중에는 Enter 키 무시
      }

      e.preventDefault();
      sendMessage(); // ✅ IME 입력이 완료된 후 정상적으로 실행
    }
  };

  return (
    <ChatContainer>
      <Header>
        <BackButton />
        K-ing 챗봇
        <RefreshButton onClick={handleRefresh}>
          <img src={RefreshIcon} alt="Refresh" />
        </RefreshButton>
      </Header>

      <MessagesContainer>
        <IntroMessageContainer>
          <img src={KingIcon} />
          안녕하세요, 김싸피님
          <br />
          궁금한 것을 물어보세요!
        </IntroMessageContainer>

        {messages.map((message, index) => (
          <Message key={index} $sender={message.sender}>
            {message.sender === 'option' ? (
              <OptionMessageBubble ref={index === messages.length - 1 ? messagesEndRef : null}>
                {message.text}
              </OptionMessageBubble>
            ) : message.sender === 'assistant' ? (
              <ChatBotContainer>
                <MessageBubble
                  $sender={message.sender}
                  ref={index === messages.length - 1 ? messagesEndRef : null}
                >
                  {message.text}
                </MessageBubble>
                {index === 0 && (
                  <ButtonContainer>
                    <OptionButton onClick={() => handleOptionClick(chatT)} disabled={isBotSelected}>
                      {chatT}
                    </OptionButton>
                    <OptionButton onClick={() => handleOptionClick(chatF)} disabled={isBotSelected}>
                      {chatF}
                    </OptionButton>
                  </ButtonContainer>
                )}
              </ChatBotContainer>
            ) : message.sender === 'recommend' ? (
              <ButtonMessageBubbleComponent message={message} />
            ) : (
              <MessageBubble
                $sender={message.sender}
                ref={index === messages.length - 1 ? messagesEndRef : null}
              >
                {message.text}
              </MessageBubble>
            )}
          </Message>
        ))}
        {isTyping && <TypingIndicator />}
      </MessagesContainer>

      <InputContainer>
        <Input
          type="text"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          inputMode="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          onKeyDown={handleKeyDown}
          placeholder={isBotSelected ? '메시지를 입력하세요...' : '챗봇을 선택하세요!'}
          disabled={!isBotSelected}
        />
        <SendButton onClick={isBotSelected ? sendMessage : null} disabled={!isBotSelected}>
          <img src={SendIcon} />
        </SendButton>
      </InputContainer>
    </ChatContainer>
  );
};

const ChatContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 100%;
`;

const Header = styled.div`
  position: sticky;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.4rem 2rem;
  width: 100%;
  box-sizing: border-box;
  ${({ theme }) => theme.fonts.Title4};
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;

  img {
    width: 1.6rem;
    height: 1.6rem;
  }
`;

const IntroMessageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.2rem;
  padding: 0.8rem 0 1.2rem 0;
  width: 100%;
  ${({ theme }) => theme.fonts.Body2};

  img {
    width: 3.6rem;
    height: 3.6rem;
  }
`;

const MessagesContainer = styled.div`
  width: 100%;
  height: 100%;
  padding: 1rem 2rem;
  box-sizing: border-box;
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Message = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${({ $sender }) =>
    $sender === 'user' || $sender === 'option' ? 'flex-end' : 'flex-start'};
  margin-bottom: 1rem;
`;

const MessageBubble = styled.div`
  display: inline-block;
  max-width: 90%;
  padding: 0.8rem 1.2rem;
  border-radius: 10px;
  background-color: ${({ $sender }) => ($sender === 'user' ? '#D9EAFF' : '#DFD9FF')};
  color: ${({ theme }) => theme.fonts.Body4};
  ${({ theme }) => theme.fonts.Body4};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.07);
  word-wrap: break-word; // 단어가 길 경우 줄 바꿈
  white-space: pre-wrap; // 줄 바꿈 및 공백 유지
  width: fit-content; // 내용 길이에 따라 너비 조절
`;

const OptionMessageBubble = styled.div`
  padding: 0.2rem 0.5rem;
  background-color: #95b4dd;
  color: white;
  border: none;
  border-radius: 8px;
  white-space: nowrap;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  ${({ theme }) => theme.fonts.Body5};
`;

const OptionButton = styled.button`
  padding: 0.2rem 0.5rem;
  background-color: #a6acd7;
  color: white;
  border: none;
  border-radius: 8px;
  white-space: nowrap;
  cursor: pointer;
  ${({ theme }) => theme.fonts.Body5};
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #898eb0;
  }
`;

const ChatBotContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  max-width: 80%;
  border-radius: 16px;
  white-space: pre-wrap;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 0.7rem;
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 1.2rem;
  box-sizing: border-box;
  background-color: #ffffff;
  border-top: 1px solid #ddd;
  padding-bottom: 2rem;

  /* position: fixed;
  bottom: 0; */
`;

const Input = styled.input`
  flex: 1;
  padding: 1rem;
  font-size: 1.4rem;
  border: 1px solid #ccc;
  border-radius: 2rem;
  outline: none;
  margin-right: 1rem;
`;

const SendButton = styled.button`
  padding: 1rem 1.4rem;
  background-color: ${({ theme }) => theme.colors.MainBlue};
  color: white;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;

  &:hover {
    background-color: #005bb5;
  }

  img {
    width: 1.8rem;
    height: 1.8rem;
  }
`;

export default AIChatView;
