import React, { useState } from 'react';
import styled from 'styled-components';

import { IcComments, IcLikes } from '../../assets/icons';
import BackButton from '../common/BackButton';
import Comment from './Comment';

const FeedDetails = () => {
  const [isOriginLan, setIsOriginLan] = useState(true);

  return (
    <PostContainer>
      <Header>
        <IconText>
          <BackButton />
          <h3>Post</h3>
        </IconText>
      </Header>
      <UserInfo>
        <Profile src="/src/assets/icons/king_logo.png" alt="default" />
        <UserName>babo_is_back</UserName>
      </UserInfo>

      <Location>석병 1리 방파제</Location>
      <PostImageWrapper>
        <PostImage src="/src/assets/icons/king_logo.png" alt="beach" />
      </PostImageWrapper>

      <PostCount>
        <LikeCount>
          <IcLikes />
          74
        </LikeCount>
        <CommentCount>
          <IcComments />5
        </CommentCount>
      </PostCount>

      <PostCaption>BTS 뮤비 촬영지 드디어 왔다.!!! 생각보다 별거없네ㅠㅜ ㅋㅋㅋㅋ</PostCaption>

      <CommentWrapper>
        Comments
        <Comment />
      </CommentWrapper>
      <FooterWrapper>
        <PostDate>March 7, 2025</PostDate>.
        <TranslateOption
          onClick={(prev) => {
            !prev;
          }}
        >
          {isOriginLan ? 'See translation' : 'See original'}
        </TranslateOption>
      </FooterWrapper>
    </PostContainer>
  );
};

export default FeedDetails;

const PostContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;

  padding: 0 2rem;

  gap: 1rem;
`;

const Header = styled.div`
  margin-top: 2rem;

  width: 100%;
`;

const IconText = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 0.7rem;

  h3 {
    width: 100%;
    padding: 0.5rem 0;
    text-align: left;
    ${({ theme }) => theme.fonts.Title3};
  }
`;

const UserInfo = styled.div`
  width: 100%;

  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Profile = styled.img`
  width: 3rem;
  height: 100%;
`;

const UserName = styled.span`
  width: 100%;

  ${({ theme }) => theme.fonts.Title5};
  color: ${({ theme }) => theme.colors.Gray0};
`;

const Location = styled.span`
  width: 100%;

  margin-left: 4rem;

  ${({ theme }) => theme.fonts.Body3};
  color: ${({ theme }) => theme.colors.Gray0};
`;

const PostImageWrapper = styled.div`
  width: 100%;
  height: 100%;
  max-height: 30rem;

  border: 1px solid ${({ theme }) => theme.colors.Gray1};
`;

const PostImage = styled.img`
  width: 100%;

  object-fit: contain;
`;

const PostCount = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  gap: 1rem;
`;
const LikeCount = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  gap: 0.5rem;

  ${({ theme }) => theme.fonts.Title5};
  color: ${({ theme }) => theme.colors.Gray1};
`;
const CommentCount = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  gap: 0.5rem;

  ${({ theme }) => theme.fonts.Title5};
  color: ${({ theme }) => theme.colors.Gray1};
`;

const PostCaption = styled.div`
  ${({ theme }) => theme.fonts.Body3};
  color: ${({ theme }) => theme.colors.Gray1};
`;

const CommentWrapper = styled.div`
  width: 100%;

  ${({ theme }) => theme.fonts.Title5};
  color: ${({ theme }) => theme.colors.Gray1};
`;

const FooterWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  gap: 0.5rem;

  ${({ theme }) => theme.fonts.Body4};
  color: ${({ theme }) => theme.colors.Gray1};
`;

const PostDate = styled.div``;

const TranslateOption = styled.div``;
