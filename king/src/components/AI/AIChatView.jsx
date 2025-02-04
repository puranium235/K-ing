import axios from 'axios';
import React, { useRef, useState } from 'react';
import styled from 'styled-components';

import ChatBotIcon from '../../assets/icons/chat-ai.png';
import SendIcon from '../../assets/icons/chat-send.png';
import RefreshIcon from '../../assets/icons/refresh.png';
import BackButton from '../common/BackButton';

const AIChatView = () => {
  const initialMessages = [
    {
      text: '어떤 MBTI의 챗봇을 원하시나요?',
      sender: 'ai',
    },
  ];
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentApi, setCurrentApi] = useState('');

  const chatT = '회차정보 기반 장소 검색 T봇';
  const chatF = '맞춤 큐레이션 추천 F봇';

  const handleRefresh = () => {
    setMessages(initialMessages);
    setNewMessage('');
    setCurrentApi('');
  };

  const handleOptionClick = (option) => {
    const optionMessage = { text: option, sender: 'option' };
    setMessages((prev) => [...prev, optionMessage]);

    if (option === chatT) {
      setCurrentApi('http://localhost:8080/api/ai/tbot');
      const aiMessage = {
        text: 'T 챗봇은 회차정보 기반 장소를 검색하는 데 특화되어 있습니다.',
        sender: 'ai',
      };
      setMessages((prev) => [...prev, aiMessage]);
    } else if (option === chatF) {
      setCurrentApi('http://localhost:8080/api/ai/fbot');
      const aiMessage = {
        text: 'F 챗봇은 맞춤 큐레이션 추천에 특화되어 있습니다.',
        sender: 'ai',
      };
      setMessages((prev) => [...prev, aiMessage]);
    }
  };

  const sendMessage = async () => {
    if (newMessage.trim() === '') return;

    const userMessage = { text: newMessage, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    try {
      const response = await axios.post(currentApi, { userMessage: newMessage });
      const aiResponse = { text: response.data.message, sender: 'ai' };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      setMessages((prev) => [...prev, { text: 'AI 응답을 불러오지 못했습니다.', sender: 'ai' }]);
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
      <MessagesContainer>
        {messages.map((message, index) => (
          <Message key={index} $sender={message.sender}>
            {message.sender === 'option' ? (
              <OptionMessageBubble>{message.text}</OptionMessageBubble>
            ) : message.sender === 'ai' ? (
              <ChatBotContainer>
                <MessageBubble $sender={message.sender}>{message.text}</MessageBubble>
                {index === 0 && (
                  <ButtonContainer>
                    <OptionButton onClick={() => handleOptionClick(chatT)}>{chatT}</OptionButton>
                    <OptionButton onClick={() => handleOptionClick(chatF)}>{chatF}</OptionButton>
                  </ButtonContainer>
                )}
              </ChatBotContainer>
            ) : (
              <MessageBubble $sender={message.sender}>{message.text}</MessageBubble>
            )}
          </Message>
        ))}
        {isTyping && <TypingIndicator>AI가 생각 중...</TypingIndicator>}
      </MessagesContainer>
      <InputContainer>
        <Input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="메시지를 입력하세요..."
        />
        <SendButton onClick={sendMessage}>
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
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  width: 95%;
  ${({ theme }) => theme.fonts.Title4};
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;

  img {
    width: 16px;
    height: 16px;
  }
`;

const IntroMessageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding: 16px;
  width: 100%;
  ${({ theme }) => theme.fonts.Body2};

  img {
    width: 35px;
    height: 35px;
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  width: 90%;
  height: 100%;
  padding: 10px;
  position: relative;
`;

const Message = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${({ $sender }) =>
    $sender === 'user' || $sender === 'option' ? 'flex-end' : 'flex-start'};
  margin-bottom: 10px;
`;

const MessageBubble = styled.div`
  max-width: 70%;
  padding: 8px 12px;
  border-radius: 5px;
  background-color: ${({ $sender }) => ($sender === 'user' ? '#D9EAFF' : '#DFD9FF')};
  color: ${({ theme }) => theme.fonts.Body4};
  ${({ theme }) => theme.fonts.Body4};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.07);
  white-space: pre-wrap;
`;

const OptionMessageBubble = styled.div`
  padding: 2px 5px;
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
  padding: 2px 5px;
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
  gap: 10px;
  max-width: 80%;
  border-radius: 16px;
  white-space: pre-wrap;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 7px;
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 90%;
  padding: 12px;
  background-color: #ffffff;
  border-top: 1px solid #ddd;

  position: fixed;
  bottom: 0;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 20px;
  outline: none;
  margin-right: 10px;
`;

const SendButton = styled.button`
  padding: 10px 14px;
  font-size: 14px;
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
    width: 18px;
    height: 18px;
  }
`;

const TypingIndicator = styled.div`
  font-size: 12px;
  color: #aaa;
  margin-top: 8px;
`;

export default AIChatView;
