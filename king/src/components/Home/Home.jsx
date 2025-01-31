import { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { CurationsDummyData } from '../../assets/dummy/dummyDataArchive';
import { placeDummyData } from '../../assets/dummy/dummyDataPlace';
import { IcCeleb, IcDrama, IcMovie, IcShow } from '../../assets/icons';
import Nav from '../common/Nav';
import SearchBar from '../common/SearchBar';
import TopNav from '../common/TopNav';
import Carousel from './Carousel';
import GenreButton from './GenreButton';
import PlaceCard from './PlaceCard';

const Home = () => {
  const [activeButton, setActiveButton] = useState('실시간');
  const [currentRankSet, setCurrentRankSet] = useState(0);

  const navigate = useNavigate();

  const genreIcons = [
    { icon: IcDrama, label: '드라마', contentType: 'drama' },
    { icon: IcMovie, label: '영화', contentType: 'movie' },
    { icon: IcShow, label: '예능', contentType: 'show' },
    { icon: IcCeleb, label: '연예인', contentType: 'celeb' },
  ];

  const carouselList = CurationsDummyData;

  const cardsData = placeDummyData;

  const rankingsData = [
    '눈물의 여왕',
    '부산',
    'BTS',
    '놀라운 토요일',
    '변우석',
    '제주도',
    '로제',
    '나의 완벽한 비서',
  ];

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentRankSet((prev) => (prev === 0 ? 1 : 0)); // 0이면 1로, 1이면 0으로 토글
    }, 3000);

    return () => clearInterval(intervalId); // 컴포넌트 언마운트 시 인터벌 정리
  }, []);

  const displayedRankings = rankingsData.slice(currentRankSet * 4, currentRankSet * 4 + 4);

  const handleClickSearch = (id) => {
    navigate(`/place/${id}`);
  };

  const handleSearch = () => {
    // // 검색 유형이 선택되고 키워드도 있는 경우
    // if (type && keyword) {
    //   navigate(/search/results?type=${type}&keyword=${keyword});
    // }
    // // 검색 유형이 선택되지 않고 키워드만 있는 경우
    // else if (keyword) {
    //   navigate(/search/keyword?keyword=${keyword});
    // }
  };

  const handleClickTrend = (keyword) => {
    // navigate(`/seach/keyword?keyword=${keyword}`);
    navigate(`/search/keyword`);
  };

  const handleCurDetails = () => {
    navigate(`/curation/1`);
  };

  return (
    <>
      <StHomeWrapper>
        <TopNav />
        <Carousel carouselList={carouselList} />
        <GenreWrapper>
          {genreIcons.map((item) => (
            <GenreButton key={item.label} buttonInfo={item} />
          ))}
        </GenreWrapper>
        <SearchBar onClick={handleSearch} />
        <TrendingKeyword>
          <h3>
            트렌딩 검색어 <span>TOP 8</span>
          </h3>
          <div className="filter">
            <p>25.01.01 ~ 25.01.08</p>
            <FilterControls>
              {['실시간', '일별', '주간별'].map((type) => (
                <StyledButton
                  key={type}
                  $active={activeButton === type}
                  onClick={() => setActiveButton(type)}
                >
                  {type}
                </StyledButton>
              ))}
            </FilterControls>
          </div>
          <div className="rankings">
            {displayedRankings.map((rank, index) => (
              <p
                key={index}
                onClick={() => {
                  handleClickTrend(rank);
                }}
              >
                {index + 1 + currentRankSet * 4}. {rank}
              </p>
            ))}
          </div>
        </TrendingKeyword>
        <CurationWrapper>
          <CurationHeader>
            <h3>연말결산 : 올해의 드라마 🌟</h3>
            <span onClick={handleCurDetails}> 전체보기 {'>'}</span>
          </CurationHeader>
          <CardContainer>
            {cardsData.map((card) => (
              <PlaceCard key={card.id} place={card} />
            ))}
          </CardContainer>
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
  width: 100%;
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
    flex: 0 0 50%; // 최대 50% 차지
  }

  &::-webkit-scrollbar {
    display: none;
  }
`;
