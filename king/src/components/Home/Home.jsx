import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import curationImg from '../../assets/dummy/curation.png';
import { IcCeleb, IcDrama, IcMovie, IcShow } from '../../assets/icons';
import Nav from '../common/Nav';
import SearchBar from '../common/SearchBar';
import TopNav from '../common/TopNav';
import Carousel from './Carousel';
import PlaceCard from './PlaceCard';

const Home = () => {
  const [activeButton, setActiveButton] = useState('');
  const navigate = useNavigate();

  const carouselList = [
    {
      image: '/src/assets/dummy/curation.png',
      text: '해인아..! 눈물의 여왕 31곳.zip',
    },
    {
      image: '/src/assets/dummy/curation.png',
      text: '해인22',
    },
    {
      image: '/src/assets/dummy/curation.png',
      text: '해인33',
    },
  ];

  const cardsData = [
    {
      image: '/src/assets/dummy/place1.png',
      title: '내음새 마을관광',
      description: '자연 속 용문리 마을관광',
    },
    {
      image: '/src/assets/dummy/place2.png',
      title: '사유원',
      description: '피크닉의 쉬는터',
    },
  ];

  return (
    <>
      <StHomeWrapper>
        <TopNav />
        <Carousel carouselList={carouselList} />
        <CurationPreview>
          <p>"해인아..!" 눈물의 여왕 31곳.zip</p>
        </CurationPreview>
        <GenreWrapper>
          <IconWrapper>
            <Icons onClick={() => navigate('/drama')}>
              <IcDrama />
            </Icons>
            <p>드라마</p>
          </IconWrapper>
          <IconWrapper>
            <Icons>
              <IcMovie />
            </Icons>
            <p>영화</p>
          </IconWrapper>
          <IconWrapper>
            <Icons>
              <IcShow />
            </Icons>
            <p>예능</p>
          </IconWrapper>
          <IconWrapper>
            <Icons>
              <IcCeleb />
            </Icons>
            <p>연예인</p>
          </IconWrapper>
        </GenreWrapper>
        <SearchBar />
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

const CurationPreview = styled.div`
  position: relative;
  align-items: center;

  height: 186px;
  width: 100%;

  border-radius: 20px;
  padding: 1rem 0;
  margin: 1rem 0;

  background-image: url(${curationImg});
  background-size: cover;
  background-position: center;

  color: white;
  ${({ theme }) => theme.fonts.Title4};

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    background-color: rgba(0, 0, 0, 0.3); // 검정색 반투명 레이어
    border-radius: 20px;
  }

  p {
    position: absolute;
    bottom: 2rem;
    left: 2rem;
    ${({ theme }) => theme.fonts.Title6}
  }
`;

const GenreWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;

  & > div {
    width: 60px;
  }
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
  height: 60px;
  width: 60px;
  display: flex;
  align-items: center;
  justify-content: center;

  margin: 1rem 0;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.colors.Beige};
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
  display: flex;
  justify-content: space-between;
  gap: 1rem;
`;
