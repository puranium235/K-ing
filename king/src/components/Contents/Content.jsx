import React from 'react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { DramaDummyData } from '../../assets/dummy/dummyDataContents';
import { IcStar, IcStarBlank } from '../../assets/icons';
import BackButton from '../common/BackButton';
import Nav from '../common/Nav';
import SearchBar from '../common/SearchBar';

const Content = () => {
  const contents = DramaDummyData;
  const { contentType } = useParams();
  // const [contentType, setContentType] = useRecoilState(ContentType);
  const [favorites, setFavorites] = useState({});
  const contentTypeMapping = {
    drama: '드라마',
    movie: '영화',
    celeb: '연예인',
    show: '예능',
  };

  const navigate = useNavigate();

  const toggleFavorite = (event, id) => {
    event.stopPropagation();
    setFavorites((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleDramaClick = (id) => {
    if (contentType === 'celeb') {
      navigate(`/content/celeb/${id}`);
    } else {
      navigate(`/content/detail/${id}`);
    }
  };

  return (
    <>
      <StHomeWrapper>
        <IconText>
          <BackButton />
          <h3> {contentTypeMapping[contentType]}</h3>
        </IconText>
        <SearchBar onSearch={() => {}} />
        <GridContainer>
          {contents.map((drama) => (
            <Card key={drama.id} onClick={() => handleDramaClick(drama.id)}>
              <CardImageContainer>
                <CardImage src={drama.image} alt={drama.title} />
                {favorites[drama.id] ? (
                  <IcStar id="favor" onClick={(e) => toggleFavorite(e, drama.id)} />
                ) : (
                  <IcStarBlank id="favor" onClick={(e) => toggleFavorite(e, drama.id)} />
                )}
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

  #favor {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;

    width: 20px;
    height: 20px;
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
