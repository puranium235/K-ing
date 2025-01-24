import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { curationsDummyData } from '../../assets/dummy/dummyDataArchive';
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
  const navigate = useNavigate();

  const genreIcons = [
    { icon: IcDrama, label: '드라마', link: '/drama' },
    { icon: IcMovie, label: '영화', link: '/movies' },
    { icon: IcShow, label: '예능', link: '/shows' },
    { icon: IcCeleb, label: '연예인', link: '/celebs' },
  ];

  const handleSearch = () => {
    // // 검색 유형이 선택되고 키워드도 있는 경우
    // if (type && keyword) {
    //   navigate(`/search/results?type=${type}&keyword=${keyword}`);
    // }
    // // 검색 유형이 선택되지 않고 키워드만 있는 경우
    // else if (keyword) {
    //   navigate(`/search/keyword?keyword=${keyword}`);
    // }
  };

  const carouselList = curationsDummyData;

  const cardsData = placeDummyData;

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
            <p>1. 눈물의 여왕</p>
            <p>2. 부산</p>
            <p>3. BTS</p>
            <p>4. 놀라운 토요일</p>
          </div>
        </TrendingKeyword>
        <CurationWrapper>
          <h3>
            연말결산 : 올해의 드라마 🌟
            <span> 전체보기 {'>'}</span>
          </h3>
          <CardContainer>
            {cardsData.map((card, index) => (
              <PlaceCard
                key={index}
                image={card.image}
                title={card.title}
                description={card.description}
              />
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

const IconWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;

  & > p {
    ${({ theme }) => theme.fonts.Title7}
  }
`;

const Icons = styled.button`
  width: 80%;
  aspect-ratio: 1/1;

  display: flex;
  align-items: center;
  justify-content: center;

  margin: 1rem 0;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.colors.Beige};

  svg {
    width: 70%;
    height: 70%;
  }
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
  & > h3 {
    text-align: left;
    ${({ theme }) => theme.fonts.Title4};
    margin: 1rem 0;

    span {
      ${({ theme }) => theme.fonts.Body4};
    }
  }
`;

const CardContainer = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
`;
