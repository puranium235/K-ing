import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

import OptionIcon from '/src/assets/icons/option.png';

import { IcComments, IcLikes } from '../../assets/icons';
import useModal from '../../hooks/common/useModal';
import { deletePost, getPostDetail } from '../../lib/post';
import { getRelativeDate } from '../../util/getRelativeDate';
import { getUserIdFromToken } from '../../util/getUserIdFromToken';
import BackButton from '../common/button/BackButton';
import OptionModal from '../common/OptionModal';
import Loading from '../Loading/Loading';
import Comment from './Comment';
const FeedDetails = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const update = useModal();

  const userId = getUserIdFromToken();

  const [postInfo, setPostInfo] = useState(null);
  const [writer, setWriter] = useState(null);
  const [isOriginLan, setIsOriginLan] = useState(true);

  const handleGoBack = () => {
    //이전 경로 구하기
    const from = location.state?.from?.pathname;

    if (from && from.includes('/post')) {
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

  const handleUpdate = () => {
    navigate(`/update/post/${postId}`);
  };

  const handleDelete = async () => {
    if (window.confirm('게시글을 삭제하시겠습니까?')) {
      const res = await deletePost(postId);
      console.log(res);
      if (res.success) {
        alert('게시글이 삭제되었습니다.');
        navigate('/home');
      }
    } else {
      update.setShowing(false);
    }
  };

  if (!postInfo) {
    return (
      <LoadingWrapper>
        <Loading />
      </LoadingWrapper>
    );
  }

  return (
    <>
      <PostContainer>
        <Header>
          <IconText>
            <BackButton onBack={handleGoBack} />
            <h3>Post</h3>
          </IconText>
          {userId === String(writer?.userId) && (
            <OptionButton
              onClick={() => {
                update.setShowing(true);
              }}
            >
              <img src={OptionIcon} alt="Option" />
            </OptionButton>
          )}
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

      <OptionModal
        isModalVisible={update.isShowing}
        onClick={() => {
          update.setShowing(false);
        }}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </>
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
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

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

const OptionButton = styled.button`
  display: flex;
  align-items: center;
  position: absolute;
  right: 1.2rem;
  background: none;
  border: none;
  cursor: pointer;

  img {
    height: 1.8rem;
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
  height: 30rem;

  display: flex;

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
