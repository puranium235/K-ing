import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { IcComments, IcLikes } from '../../assets/icons';
import { getPostDetail } from '../../lib/post';
import { getRelativeDate } from '../../util/getRelativeDate';
import BackButton from '../common/button/BackButton';
import Loading from '../Loading/Loading';
import Comment from './Comment';

const FeedDetails = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [postInfo, setPostInfo] = useState(null);
  const [writer, setWriter] = useState(null);
  const [isOriginLan, setIsOriginLan] = useState(true);

  const handleGoBack = () => {
    //이전 경로 구하기
    const from = location.state?.from?.pathname;

    if (from && from.includes('/upload')) {
      navigate('/home');
    } else {
      navigate(-1);
    }
  };

  const getPostInfo = async () => {
    const res = await getPostDetail(postId);
    setPostInfo(res);
    setWriter(res.writer);
  };

  useEffect(() => {
    getPostInfo();
  }, [postId]);

  if (!postInfo) {
    return (
      <LoadingWrapper>
        <Loading />
      </LoadingWrapper>
    );
  }

  return (
    <PostContainer>
      <Header>
        <IconText>
          <BackButton onBack={handleGoBack} />
          <h3>Post</h3>
        </IconText>
      </Header>
      <UserInfo>
        <Profile src={writer.imageUrl} alt="default" />
        <UserName>{writer.nickname}</UserName>
      </UserInfo>

      <Location>{postInfo.place.name}</Location>
      <PostImageWrapper>
        <PostImage src={postInfo.imageUrl} alt="postImage" />
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

      <PostCaption>{postInfo.content}</PostCaption>

      <CommentWrapper>
        Comments
        <Comment />
      </CommentWrapper>
      <FooterWrapper>
        <PostDate>{getRelativeDate(postInfo.createdAt)}</PostDate>·
        <TranslateOption onClick={() => setIsOriginLan((prev) => !prev)}>
          {isOriginLan ? 'See translation' : 'See original'}
        </TranslateOption>
      </FooterWrapper>
    </PostContainer>
  );
};

export default FeedDetails;

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
`;

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
  max-height: 30rem;

  border: 1px solid ${({ theme }) => theme.colors.Gray2};
`;

const PostImage = styled.img`
  width: 100%;
  max-height: 30rem;

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
