import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { IcComments, IcLikes } from '../../assets/icons';

const PostItem = ({ post }) => {
  const navigate = useNavigate();

  const handleFeedClick = (id) => {
    navigate(`/feed/${id}`);
  };

  return (
    <St.Item onClick={() => handleFeedClick(post.id)}>
      <St.Image src={post.image} alt={post.title} />
      <St.Info>
        <St.Action>
          <IconText>
            <IcLikes />
            <p>{post.likes}</p>
          </IconText>
          <IconText>
            <IcComments />
            <p>{post.comments}</p>
          </IconText>
        </St.Action>
        <St.Title>{post.title}</St.Title>
        <St.Author>@{post.author}</St.Author>
        <St.Date>{post.date}</St.Date>
      </St.Info>
    </St.Item>
  );
};

export default PostItem;

const St = {
  Item: styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  `,
  Image: styled.img`
    width: 100%;
    height: 168px;
    border-radius: 10px;
  `,
  Info: styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    text-align: left;

    padding: 0.5rem;
    color: ${({ theme }) => theme.colors.Gray0};
  `,
  Action: styled.div`
    display: flex;
    width: 100%;
    gap: 1rem;
    color: ${({ theme }) => theme.colors.Gray1};
  `,
  Author: styled.p`
    ${({ theme }) => theme.fonts.Title7};
    color: #464656;
  `,
  Title: styled.h3`
    margin: 4px 0 0;
    padding-right: 0.5rem;
    ${({ theme }) => theme.fonts.Title6};
    font-size: 13px;
  `,
  Date: styled.p`
    ${({ theme }) => theme.fonts.Body6};
    color: #464656;
  `,
};

const IconText = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.3rem;

  img {
    width: 20px;
    height: 20px;
  }

  p {
    ${({ theme }) => theme.fonts.Title6};
  }
`;
