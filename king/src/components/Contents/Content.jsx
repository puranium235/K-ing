import React, { useEffect, useRef, useState } from 'react';
import { useLayoutEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import styled from 'styled-components';

import { IcStar, IcStarBlank } from '../../assets/icons';
import useGetSearchResult from '../../hooks/search/useGetSearchResult';
import { ScrollPosition, SearchQueryState } from '../../recoil/atom';
import { getContentTypeKor } from '../../util/getContentType';
import BackButton from '../common/BackButton';
import Nav from '../common/Nav';
import SearchBar from '../common/SearchBar';
import Loading from '../Loading/Loading';

const Content = () => {
  const { contentType } = useParams();

  const [initialLoading, setInitialLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useRecoilState(ScrollPosition);
  const [searchQuery, setSearchQuery] = useRecoilState(SearchQueryState);
  const [favorites, setFavorites] = useState({});

  const navigate = useNavigate();

  //마지막 요소 감지
  const lastElementRef = useRef(null);
  const containerRef = useRef(null);

  const { searchResultList, getNextData, isLoading, isError } = useGetSearchResult(
    searchQuery,
    contentType.toUpperCase(),
  );

  useEffect(() => {
    setInitialLoading(true);
  }, []);

  useEffect(() => {
    if (!isLoading && initialLoading) {
      const container = containerRef.current;
      if (container && scrollPosition) {
        container.scrollTop = scrollPosition;
        setInitialLoading(false);
      }
    }
  }, [isLoading]);

  useEffect(() => {
    // 스크롤 위치를 상태로 저장
    const handleScroll = () => {
      if (containerRef.current) {
        setScrollPosition(containerRef.current.scrollTop);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  useEffect(() => {
    if (isLoading || !lastElementRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          getNextData();
        }
      },
      { threshold: 0.5 },
    );

    if (lastElementRef.current) {
      observer.observe(lastElementRef.current);
    }

    return () => {
      if (lastElementRef.current) {
        observer.unobserve(lastElementRef.current);
      }
    };
  }, [isLoading, getNextData]);

  const handleSearch = (searchQuery) => {
    setSearchQuery(searchQuery);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemClick = (id) => {
    if (containerRef.current) {
      // sessionStorage.setItem('scrollPosition', containerRef.current.scrollTop);
      setScrollPosition(containerRef.current.scrollTop);
    }

    if (contentType === 'cast') {
      navigate(`/content/cast/${id}`);
    } else {
      navigate(`/content/detail/${id}`);
    }
  };

  if (isLoading && searchResultList.length === 0) return <Loading />;
  if (isError) return <div>Error loading data.</div>;

  return (
    <>
      <StHomeWrapper>
        <FixedContainer>
          <IconText>
            <BackButton onBack={() => navigate(`/home`)} />
            <p>{getContentTypeKor(contentType)}</p>
          </IconText>
          <SearchBar type={contentType.toUpperCase()} query="" onSearch={handleSearch} />
        </FixedContainer>

        <GridContainer ref={containerRef}>
          {searchResultList.map((content, index) => (
            <Card
              key={index}
              ref={index === searchResultList.length - 1 ? lastElementRef : null}
              onClick={() => handleItemClick(content.id)}
            >
              <CardImageContainer>
                <CardImage src={content.imageUrl || '/default-image.jpg'} alt={content.name} />
              </CardImageContainer>
              <CardTitle>{content.name}</CardTitle>
              {favorites[content.id] ? (
                <IcStar id="favor" onClick={(e) => toggleFavorite(e, content.id)} />
              ) : (
                <IcStarBlank id="favor" onClick={(e) => toggleFavorite(e, content.id)} />
              )}
            </Card>
          ))}
        </GridContainer>
      </StHomeWrapper>

      <Nav />
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

  padding: 0 2rem;
  margin-bottom: 7rem;
`;

const IconText = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 0.7rem;

  p {
    width: 100%;
    padding: 0.5rem 0;
    text-align: left;
    ${({ theme }) => theme.fonts.Title4};
  }
`;

const FixedContainer = styled.div`
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.White};
  padding-top: 2rem;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding: 1rem 0.1rem;
  box-sizing: border-box;

  width: 100%;
  overflow-y: scroll;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Card = styled.div`
  position: relative;
  cursor: pointer;

  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;

  gap: 0.5rem;

  width: 100%;
  height: 15rem;
  background-color: ${({ theme }) => theme.colors.White};

  #favor {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;

    width: 20px;
    height: 20px;
  }
`;
const CardImageContainer = styled.div`
  display: flex;
  justify-content: end;
  width: 100%;
  height: 100%;
  flex: 8;
  overflow: hidden;
`;
const CardImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: ${({ $defaultImage }) => ($defaultImage ? 'contain' : 'cover')};

  overflow: hidden;
`;
const CardTitle = styled.span`
  flex: 1.5;
  ${({ theme }) => theme.fonts.Body6};
  color: ${({ theme }) => theme.colors.Gray0};
`;
