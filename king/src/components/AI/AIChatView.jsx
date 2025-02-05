import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import ChatBotIcon from '../../assets/icons/chat-ai.png';
import SendIcon from '../../assets/icons/chat-send.png';
import RefreshIcon from '../../assets/icons/refresh.png';
import { deleteChatHistory, getChatHistory, getResponse, saveChatHistory } from '../../lib/chatbot';
import { splitIntoSentences } from '../../util/chatbot';
import BackButton from '../common/BackButton';
import TypingIndicator from './TypingIndicator';

const AIChatView = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isBotSelected, setIsBotSelected] = useState(false);
  const [currentApi, setCurrentApi] = useState('');
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const chatT = '회차정보 기반 장소 검색 T봇';
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

    setMessages([]);
    setNewMessage('');
    setCurrentApi('');
    setIsBotSelected(false);

    saveInitialMessage();
  };

  useEffect(() => {
    const fetchChatHistory = async () => {
      const data = await getChatHistory();

      if (data.length > 0) {
        let newMessages = [];

        data.forEach((msg) => {
          if (msg.role === 'assistant') {
            newMessages = [...newMessages, ...splitIntoSentences(msg.content, 'assistant')];
          } else {
            newMessages.push({ text: msg.content, sender: msg.role });
          }
        });

        setMessages(newMessages);
      } else {
        saveInitialMessage();
      }
    };

    fetchChatHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleOptionClick = async (option) => {
    const optionMessage = { text: option, sender: 'option', type: 'option' };
    setMessages((prev) => [...prev, optionMessage]);
    await saveChatHistory('option', option, 'option');

    let aiMessage;
    if (option === chatT) {
      setCurrentApi(`/chatbot/chatT`);
      aiMessage = {
        text: 'T 챗봇은 회차정보 기반 장소를 검색하는 데 특화되어 있습니다.',
        sender: 'assistant',
        type: 'message',
      };
    } else if (option === chatF) {
      setCurrentApi(`/chatbot/chatF`);
      aiMessage = {
        text: 'F 챗봇은 맞춤 큐레이션 추천에 특화되어 있습니다.',
        sender: 'assistant',
        type: 'message',
      };
    }
    setMessages((prev) => [...prev, aiMessage]);
    await saveChatHistory('assistant', aiMessage.text, 'message');
    setIsBotSelected(true);
  };

  const sendMessage = async () => {
    if (newMessage.trim() === '') return;

    const userMessage = { text: newMessage, sender: 'user', type: 'message' };
    setMessages((prev) => [...prev, userMessage]);

    setNewMessage('');
    setIsTyping(true);

    try {
      const responseMessage = await getResponse(currentApi, userMessage.text);
      const assistantMessages = splitIntoSentences(responseMessage, 'assistant');

      for (const msg of assistantMessages) {
        setMessages((prev) => [...prev, msg]);
        await new Promise((resolve) => setTimeout(resolve, 500)); // 메시지 간 0.5초 간격
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { text: responseMessage, sender: 'assistant', type: 'message' },
      ]);
      console.error('Error fetching AI response:', error);
    } finally {
      setIsTyping(false);
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

      <IntroMessageContainer>
        <img src={ChatBotIcon} />
        안녕하세요, 김싸피님
        <br />
        궁금한 것을 물어보세요!
      </IntroMessageContainer>

      <MessagesContainer ref={messagesContainerRef}>
        {messages.map((message, index) => (
          <Message key={index} $sender={message.sender}>
            {message.sender === 'option' ? (
              <OptionMessageBubble>{message.text}</OptionMessageBubble>
            ) : message.sender === 'assistant' ? (
              <ChatBotContainer>
                <MessageBubble $sender={message.sender}>{message.text}</MessageBubble>
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
            ) : (
              <MessageBubble $sender={message.sender}>{message.text}</MessageBubble>
            )}
          </Message>
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </MessagesContainer>

      <InputContainer>
        <Input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && isBotSelected && sendMessage()}
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
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.4rem 2rem;
  width: 95%;
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
  padding: 1.6rem;
  width: 100%;
  ${({ theme }) => theme.fonts.Body2};

  img {
    width: 3.5rem;
    height: 3.5rem;
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  width: 90%;
  height: 100%;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
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
  min-width: 10%;
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
  width: 90%;
  padding: 1.2rem;
  background-color: #ffffff;
  border-top: 1px solid #ddd;
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
  font-size: 1.4rem;
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
