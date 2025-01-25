import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import styled from 'styled-components';

import { DramaDummyData } from '../../assets/dummy/dummyDataContents';
import { IcStar } from '../../assets/icons';
import { ContentType } from '../../recoil/atom';
import BackButton from '../common/BackButton';
import Nav from '../common/Nav';
import SearchBar from '../common/SearchBar';

const Content = () => {
  const dramas = DramaDummyData;
  const [contentType, setContentType] = useRecoilState(ContentType);

  const navigate = useNavigate();

  const handleDramaClick = (id) => {
    navigate(`/content/${contentType}/${id}`);
  };

  return (
    <>
      <StHomeWrapper>
        <IconText>
          <BackButton />
          <h3> {contentType}</h3>
        </IconText>
        <SearchBar />
        <GridContainer>
          {dramas.map((drama) => (
            <Card key={drama.id} onClick={() => handleDramaClick(drama.id)}>
              <CardImageContainer>
                <CardImage src={drama.image} alt={drama.title} />
                <IcStar className="favor" />
              </CardImageContainer>
              <CardTitle>{drama.title}</CardTitle>
            </Card>
          ))}
        </GridContainer>
        <Nav />
      </StHomeWrapper>
    </>
  );
};

export default Content;

const StHomeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
  text-align: center;

  padding: 2rem;
  margin-bottom: 7rem;
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

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding: 10px;
`;

const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.White};
  position: relative;
`;

const CardImageContainer = styled.div`
  width: 100%;
  position: relative;

  .favor {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;

    width: 10px;
    height: 10px;
  }
`;

const CardImage = styled.img`
  width: 100%;
  height: auto;
  border-radius: 8px;
`;

const CardTitle = styled.h4`
  margin-top: 5px;
  ${({ theme }) => theme.fonts.Body4};
  color: ${({ theme }) => theme.colors.Gray0};
`;
