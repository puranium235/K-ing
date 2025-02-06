import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import ChatBotIcon from '../../assets/icons/chat-ai.png';
import SendIcon from '../../assets/icons/chat-send.png';
import KingIcon from '../../assets/icons/king_character.png';
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
        let detectedBotType = ''; // 챗봇 유형을 저장할 변수

        data.forEach((msg) => {
          if (msg.type === 'option') {
            detectedBotType = msg.content; // '데이터 기반 장소 검색 T봇' 또는 '맞춤 큐레이션 추천 F봇' 저장
          }

          if (msg.role === 'assistant') {
            newMessages = [...newMessages, ...splitIntoSentences(msg.content, 'assistant')];
          } else {
            newMessages.push({ text: msg.content, sender: msg.role });
          }
        });

        if (detectedBotType) {
          setCurrentApi(detectedBotType === chatT ? '/chatbot/chatT' : '/chatbot/chatF');
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

  const handleOptionClick = async (option) => {
    const optionMessage = { text: option, sender: 'option', type: 'option' };
    setMessages((prev) => [...prev, optionMessage]);
    await saveChatHistory('option', option, 'option');

    let aiMessage;
    if (option === chatT) {
      setCurrentApi(`/chatbot/chatT`);
      aiMessage = {
        text: `안녕하세요! 저는 K-Guide, 한국 콘텐츠 속 촬영지를 정확하게 찾아드리는 챗봇입니다.`,
        sender: 'assistant',
        type: 'message',
      };
    } else if (option === chatF) {
      setCurrentApi(`/chatbot/chatF`);
      aiMessage = {
        text: `안녕하세요! 저는 K-Mood, 감성을 담은 맞춤 큐레이션을 추천하는 챗봇입니다. 💫🎭`,
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
        <img src={KingIcon} />
        안녕하세요, 김싸피님
        <br />
        궁금한 것을 물어보세요!
      </IntroMessageContainer>

      <MessagesContainer ref={messagesContainerRef}>
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
  position: relative;
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
  width: 90%;
  height: 100%;
  padding: 1rem;
  padding-bottom: 9rem;
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
  width: 39rem;
  padding: 1.2rem;
  box-sizing: border-box;
  background-color: #ffffff;
  border-top: 1px solid #ddd;
  padding-bottom: 2rem;

  position: fixed;
  bottom: 0;
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
