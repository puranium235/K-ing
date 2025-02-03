import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import styled from 'styled-components';

import { IcCeleb, IcDrama, IcMovie, IcShow } from '../../assets/icons';
import { getCurationDetail, getCurationList } from '../../lib/curation';
import { SearchCategoryState, SearchQueryState } from '../../recoil/atom';
import Nav from '../common/Nav';
import SearchBar from '../common/SearchBar';
import TopNav from '../common/TopNav';
import Carousel from './Carousel';
import GenreButton from './GenreButton';
import PlaceCard from './PlaceCard';
import Rank from './Rank';

const Home = () => {
  const [carouselList, setCarouselList] = useState([]);
  const [topCurations, setTopCurations] = useState([]);
  const [placeList, setPlaceList] = useState([]);

  const setSearchQuery = useSetRecoilState(SearchQueryState);
  const setSearchCategory = useSetRecoilState(SearchCategoryState);
  const navigate = useNavigate();

  const genreIcons = [
    { icon: IcDrama, label: '드라마', contentType: 'drama' },
    { icon: IcMovie, label: '영화', contentType: 'movie' },
    { icon: IcShow, label: '예능', contentType: 'show' },
    { icon: IcCeleb, label: '연예인', contentType: 'cast' },
  ];

  const getResults = async () => {
    const res = await getCurationList('', '');
    setCarouselList(res.items);
  };

  useEffect(() => {
    getResults();
  }, []);

  const handleSearch = (query, category) => {
    setSearchQuery(query);
    setSearchCategory(category);

    navigate('/search/result');
  };

  const handleCurDetails = (id) => {
    navigate(`/curation/${id}`);
  };

  const getCurationPlace = async () => {
    const res = await getCurationDetail(topCurations[0].id);
    setPlaceList(res.places);
  };

  useEffect(() => {
    if (carouselList) {
      setTopCurations(carouselList.slice(0, Math.min(3, carouselList.length)));
    }
    if (topCurations.length > 0) {
      getCurationPlace();
    }
  }, [carouselList]);

  if (!carouselList) {
    return null;
  }

  return (
    <>
      <StHomeWrapper>
        <TopNav />
        <Carousel carouselList={topCurations} />
        <GenreWrapper>
          {genreIcons.map((item) => (
            <GenreButton key={item.label} buttonInfo={item} />
          ))}
        </GenreWrapper>
        <SearchBar query="" onSearch={handleSearch} />
        <Rank />
        <CurationWrapper>
          {topCurations.length > 0 && (
            <>
              <CurationHeader>
                <h3>{topCurations[0].title}</h3>
                <span
                  onClick={() => {
                    handleCurDetails(topCurations[0].id);
                  }}
                >
                  {' '}
                  전체보기 {'>'}
                </span>
              </CurationHeader>
              <CardContainer>
                {placeList.map((card, index) => (
                  <PlaceCard key={index} place={card} />
                ))}
              </CardContainer>
            </>
          )}
        </CurationWrapper>
      </StHomeWrapper>
      <Nav />
    </>
  );
};

export default Home;

const StHomeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 2rem;
  margin-bottom: 7rem;
`;

const GenreWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: auto;
  width: 100%;
`;

const CurationWrapper = styled.div`
  width: 100%;
`;

const CurationHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  & > h3 {
    text-align: left;
    ${({ theme }) => theme.fonts.Title4};
    margin: 1rem 0;
  }
  span {
    ${({ theme }) => theme.fonts.Body4};
  }
`;

const CardContainer = styled.div`
  display: flex;
  width: 100%;
  flex-wrap: nowrap;
  overflow-x: scroll;
  gap: 1rem;
  padding: 0.5rem 0;

  & > * {
    flex: 0 0 50%;
  }
  &::-webkit-scrollbar {
    display: none;
  }
`;
