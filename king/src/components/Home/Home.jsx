import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import styled from 'styled-components';

import { IcCeleb, IcDrama, IcMovie, IcShow } from '../../assets/icons';
import { getCurationDetail, getCurationList } from '../../lib/curation';
import { getKeywordRanking } from '../../lib/search';
import { SearchCategoryState, SearchQueryState } from '../../recoil/atom';
import Nav from '../common/Nav';
import SearchBar from '../common/SearchBar';
import TopNav from '../common/TopNav';
import Carousel from './Carousel';
import GenreButton from './GenreButton';
import PlaceCard from './PlaceCard';

const Home = () => {
  const [activeButton, setActiveButton] = useState('실시간');
  const [period, setPeriod] = useState('realtime');
  const [currentRankSet, setCurrentRankSet] = useState(0);
  const [rankingsData, setRankingsData] = useState([]);
  const [carouselList, setCarouselList] = useState([]);
  const [topCurations, setTopCurations] = useState([]);
  const [placeList, setPlaceList] = useState([]);
  const [displayedRankings, setDisplayedRankings] = useState([]);

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

  const periodOptions = [
    { label: '실시간', value: 'realtime' },
    { label: '일별', value: 'daily' },
    { label: '주간별', value: 'weekly' },
  ];

  //날짜 포맷
  const today = new Date();
  const formattedToday = `${today.getFullYear()}
  -${(today.getMonth() + 1).toString().padStart(2, '0')}
  -${today.getDate().toString().padStart(2, '0')}`;

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + (6 - today.getDay()));

  const formatDate = (date) =>
    `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date
      .getDate()
      .toString()
      .padStart(2, '0')}`;

  const formattedStartOfWeek = formatDate(startOfWeek);
  const formattedEndOfWeek = formatDate(endOfWeek);

  const getFilterText = () => {
    switch (period) {
      case 'realtime':
        return '🔥지금 인기있는🔥';
      case 'daily':
        return formattedToday;
      case 'weekly':
        return `${formattedStartOfWeek} ~ ${formattedEndOfWeek}`;
      default:
        return '';
    }
  };

  const getRanking = async () => {
    const res = await getKeywordRanking(period);
    setRankingsData(res);
  };

  useEffect(() => {
    getResults();
  }, []);

  useEffect(() => {
    if (carouselList) {
      setTopCurations(carouselList.slice(0, Math.min(3, carouselList.length)));
      console.log(topCurations);
    }
    if (topCurations.length > 0) {
      getCurationPlace();
    }
  }, [carouselList]);

  const getCurationPlace = async () => {
    const res = await getCurationDetail(topCurations[0].id);
    setPlaceList(res.places);
  };

  useEffect(() => {
    getRanking();
  }, [period]);

  useEffect(() => {
    if (rankingsData) {
      setDisplayedRankings(rankingsData.slice(currentRankSet * 4, currentRankSet * 4 + 4));
    }
  }, [rankingsData, currentRankSet]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentRankSet((prev) => (prev === 0 ? 1 : 0));
    }, 3000);

    return () => clearInterval(intervalId);
  }, []);

  const handleSearch = (query, category) => {
    setSearchQuery(query);
    setSearchCategory(category);

    navigate('/search/result');
  };

  const handleClickTrend = (keyword) => {
    navigate(`/search/keyword?query=${keyword}`);
  };

  const handleCurDetails = () => {
    navigate(`/curation/1`);
  };

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
        <TrendingKeyword>
          <h3>
            트렌딩 검색어 <span>TOP 8</span>
          </h3>
          <div className="filter">
            <p>{getFilterText()}</p>
            <FilterControls>
              {periodOptions.map(({ label, value }) => (
                <StyledButton
                  key={label}
                  $active={activeButton === label}
                  onClick={() => {
                    setActiveButton(label);
                    setPeriod(value);
                  }}
                >
                  {label}
                </StyledButton>
              ))}
            </FilterControls>
          </div>
          <div className="rankings">
            {displayedRankings.map((rank, index) => (
              <p key={index} onClick={() => handleClickTrend(rank.keyword)}>
                {index + 1 + currentRankSet * 4}. {rank.keyword}
              </p>
            ))}
          </div>
        </TrendingKeyword>
        <CurationWrapper>
          {topCurations.length > 0 && (
            <>
              <CurationHeader>
                <h3>{topCurations[0].title}</h3>
                <span onClick={handleCurDetails}> 전체보기 {'>'}</span>
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

const TrendingKeyword = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 1rem;
  border-radius: 10px;
  background-color: #f2faff;

  h3 {
    text-align: left;
    ${({ theme }) => theme.fonts.Title6};
    margin: 1rem 1rem 0.5rem 1rem;
    padding: 0 0.5rem;

    & > span {
      ${({ theme }) => theme.fonts.Title6};
      color: ${({ theme }) => theme.colors.MainBlue};
    }
  }

  .filter {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 1.5rem;
    p {
      margin: 0;
      ${({ theme }) => theme.fonts.Body6};
    }
  }

  .rankings {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin: 1rem;
    text-align: left;
    p {
      ${({ theme }) => theme.fonts.Body4};
      padding: 5px;
    }
  }
`;

const FilterControls = styled.div`
  display: flex;
`;

const StyledButton = styled.button`
  padding: 5px 10px;
  border-radius: 70px;
  background-color: ${({ $active }) => ($active ? '#D0E3FF' : '')};
  color: ${({ theme }) => theme.colors.Navy};
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
