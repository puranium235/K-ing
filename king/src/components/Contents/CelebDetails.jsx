import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { IcBirth, IcMarker, IcPencil, IcSmallStar, IcStar, IcTv } from '../../assets/icons';
import BackButton from '../common/BackButton';

const CelebDetails = () => {
  const works = [
    { year: 2025, title: '오징어 게임 2', link: 'https://example.com/okja2' },
    { year: 2024, title: '트렁크', link: 'https://example.com/turk' },
    { year: 2024, title: '원더랜드', link: 'https://example.com/wonderland' },
    { year: 2021, title: '고요의 바다', link: 'https://example.com/seaofsilence' },
    { year: 2021, title: '오징어 게임', link: 'https://example.com/squidgame' },
    { year: 2021, title: '서북', link: 'https://example.com/seobok' },
  ];

  const navigate = useNavigate();

  const handleClickPlaceInfo = () => {
    navigate(`/search/keyword`);
  };

  return (
    <CelebPageContainer>
      <IconText>
        <BackButton />
        <h3> 세부정보</h3>
      </IconText>

      <Header>
        <img id="poster" src="/src/assets/dummy/celeb_big.png" alt="Celeb Poster" />
        <TitleSection>
          <h3>공유</h3>
          <IconText>
            <IcBirth />
            <p>1979.07.10</p>
          </IconText>
          <IconText>
            <img src="/src/assets/icons/location.png" alt="marker" />
            <p>부산, 대한민국</p>
          </IconText>
          <IconText>
            <IcTv />
            <p>41작</p>
          </IconText>
        </TitleSection>
        <IcStar id="favor" />
      </Header>

      <Synopsis>
        <IconText>
          <IcSmallStar />
          <p>대표 작품</p>
        </IconText>
        <CastGrid>
          <CastMember>
            <img src="/src/assets/dummy/poster1.png" alt="Cast Member" />
            <p>도깨비</p>
          </CastMember>
          <CastMember>
            <img src="/src/assets/dummy/poster1.png" alt="Cast Member" />
            <p>도가니</p>
          </CastMember>
          <CastMember>
            <img src="/src/assets/dummy/poster1.png" alt="Cast Member" />
            <p>커피프린스 1호점</p>
          </CastMember>
          <CastMember>
            <img src="/src/assets/dummy/poster1.png" alt="Cast Member" />
            <p>부산행</p>
          </CastMember>
        </CastGrid>
      </Synopsis>

      <ListWrapper>
        <IconText>
          <IcPencil />
          <p>작품 활동</p>
        </IconText>
        <ul>
          {works.map((work, index) => (
            <li key={index}>
              {work.year} -{' '}
              <a href={work.link} target="_blank" rel="noopener noreferrer">
                {work.title}
              </a>
            </li>
          ))}
        </ul>
      </ListWrapper>

      <ActionButton onClick={handleClickPlaceInfo}>
        <IcMarker />
        <p>'공유'의 다른 촬영지가 궁금하다면 ?</p>
      </ActionButton>
    </CelebPageContainer>
  );
};

export default CelebDetails;

const CelebPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;

  padding: 20px;
  background-color: #fff;

  h3 {
    width: 100%;
    padding: 1rem 0;
    text-align: left;
    ${({ theme }) => theme.fonts.Title3};
  }
`;

const Header = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: end;
  margin-bottom: 20px;

  #poster {
    width: 60%;
    margin-right: 2rem;
  }

  #favor {
    position: absolute;
    right: 0;
    top: 0;

    width: 30px;
    height: 30px;
  }
`;

const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
  margin-top: 10px;

  h3 {
    ${({ theme }) => theme.fonts.Title3};
  }

  p {
    ${({ theme }) => theme.fonts.Title5};
    color: ${({ theme }) => theme.colors.Gray0};
  }
`;

const Synopsis = styled.div`
  line-height: 1.6;
  margin-bottom: 2rem;

  ${({ theme }) => theme.fonts.Body4};
  color: ${({ theme }) => theme.colors.Gray0};
`;

const IconText = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.7rem;

  margin-bottom: 1rem;

  img {
    width: 20px;
    height: 20px;
  }

  p {
    ${({ theme }) => theme.fonts.Title6};
  }
`;

const CastGrid = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1rem;
  margin-top: 0.5rem;

  width: 100%;
  overflow-x: auto;
  white-space: nowrap;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const CastMember = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  flex: 0 0 104px;
  height: auto;

  img {
    width: 100%;
  }

  p {
    margin-top: 5px;
    ${({ theme }) => theme.fonts.Body2};
  }
`;

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
  margin-bottom: 2rem;

  margin-bottom: 0.5rem;
  ul {
    ${({ theme }) => theme.fonts.Title3}
  }

  a {
    color: ${({ theme }) => theme.colors.Gray0};
  }
`;

const ActionButton = styled.button`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  margin-left: auto;
  margin-right: auto;
  margin-top: 3rem;

  border-radius: 20px;
  padding: 0.8rem 2rem;

  text-align: center;

  background-image: linear-gradient(to right, #0062ff, #71c8ff);
  ${({ theme }) => theme.fonts.Title3};
  color: ${({ theme }) => theme.colors.White};

  p {
    margin-left: 1.5rem;
  }
`;
