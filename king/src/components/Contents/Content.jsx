import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { IcStar, IcStarBlank } from '../../assets/icons';
import { getSearchResult } from '../../lib/search';
import { getContentTypeKor } from '../../util/getContentType';
import BackButton from '../common/BackButton';
import Nav from '../common/Nav';
import SearchBar from '../common/SearchBar';

const Content = () => {
  const { contentType } = useParams();
  // const [contentType, setContentType] = useRecoilState(ContentType);
  const [favorites, setFavorites] = useState({});
  const [results, setResults] = useState();
  const [contentList, setContentList] = useState([]);

  const navigate = useNavigate();

  const getResults = async () => {
    const res = await getSearchResult('', contentType.toUpperCase());
    setResults(res.results);
    console.log(res.results);
  };

  useEffect(() => {
    getResults();
  }, [contentType]);

  useEffect(() => {
    if (results) {
      setContentList(results.filter((item) => item.category === contentType.toUpperCase()));
    }
  }, [results]);

  if (!results) {
    return null;
  }

  const toggleFavorite = (event, id) => {
    event.stopPropagation();
    setFavorites((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleDramaClick = (id) => {
    if (contentType === 'cast') {
      navigate(`/content/cast/${id}`);
    } else {
      navigate(`/content/detail/${id}`);
    }
  };

  return (
    <>
      <StHomeWrapper>
        <IconText>
          <BackButton />
          <h3> {getContentTypeKor(contentType)}</h3>
        </IconText>
        <SearchBar onSearch={() => {}} />
        <GridContainer>
          {contentList.map((content, index) => (
            <Card key={index} onClick={() => handleDramaClick(content.id)}>
              <CardImageContainer>
                <CardImage src={content.imageUrl} alt={content.name} />
              </CardImageContainer>
              {favorites[content.id] ? (
                <IcStar id="favor" onClick={(e) => toggleFavorite(e, content.id)} />
              ) : (
                <IcStarBlank id="favor" onClick={(e) => toggleFavorite(e, content.id)} />
              )}
              <CardTitle>{content.name}</CardTitle>
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
  justify-content: flex-end;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.White};
  position: relative;

  width: 8.5rem;
  min-height: 15rem;

  #favor {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;

    width: 20px;
    height: 20px;
  }
`;

const CardImageContainer = styled.div``;

const CardImage = styled.img`
  width: 8rem;
  border-radius: 8px;
  min-height: 8rem;
`;

const CardTitle = styled.h4`
  margin-top: 5px;
  ${({ theme }) => theme.fonts.Body4};
  color: ${({ theme }) => theme.colors.Gray0};
`;
