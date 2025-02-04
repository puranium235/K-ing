import styled from 'styled-components';

function PostsGrid({ posts = [], isMyPage }) {
  return (
    <GridContainer>
      {posts.length === 0 ? (
        <p>포스트가 없습니다.</p>
      ) : (
        posts
          .filter((post) => isMyPage || !post.private)
          .map((post) => (
            <PostItem key={post.id}>
              <PostImage src={post.image} alt={post.title} />
              {post.private && isMyPage && <LockIcon>🔒</LockIcon>}
            </PostItem>
          ))
      )}
    </GridContainer>
  );
}

export default PostsGrid;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5px;
  margin-top: 15px;
`;

const PostItem = styled.div`
  position: relative;
`;

const PostImage = styled.img`
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
`;

const LockIcon = styled.span`
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  font-size: 14px;
  padding: 3px;
  border-radius: 50%;
`;
