import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import styled from 'styled-components';

import {
  IcBirth,
  IcMarker,
  IcMarker2,
  IcPencil,
  IcSmallStar,
  IcStar,
  IcStarBlank,
  IcTv,
} from '../../assets/icons';
import { getCelebDetails } from '../../lib/content';
import { SearchQueryState, SearchRelatedType } from '../../recoil/atom';
import BackButton from '../common/BackButton';

const CelebDetails = () => {
  const { celebId } = useParams();
  const [celebInfo, setcelebInfo] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);

  const navigate = useNavigate();
  const setSearchQuery = useSetRecoilState(SearchQueryState);
  const setRelatedType = useSetRecoilState(SearchRelatedType);

  const handleClickPlaceInfo = () => {
    setSearchQuery(celebInfo.name);
    setRelatedType('cast');

    navigate(`/search/keyword`);
  };

  const getDetails = async () => {
    const res = await getCelebDetails(celebId);
    setcelebInfo(res);
    setIsFavorited(res.favorite);
  };

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
  };

  const handleClickContent = (contentId) => {
    navigate(`/content/detail/${contentId}`);
  };

  useEffect(() => {
    getDetails();
  }, [celebId]);

  if (!celebInfo) {
    return null;
  }

  return (
    <>
      <CelebPageContainer>
        <IconText>
          <BackButton />
          <h3> 세부정보</h3>
        </IconText>

        <Header>
          <img
            id="poster"
            src={celebInfo.imageUrl ? celebInfo.imageUrl : '/src/assets/dummy/celeb_big.png'}
            alt="Celeb Poster"
          />
          <TitleSection>
            <h3>{celebInfo.name}</h3>
            <IconText>
              <IcBirth />
              <p>{celebInfo.birthDate}</p>
            </IconText>
            <IconText>
              <IcMarker2 />
              <p>{celebInfo.birthPlace}</p>
            </IconText>
            <IconText>
              <IcTv />
              <p>{celebInfo.participatingWorks}</p>
            </IconText>
          </TitleSection>
          {isFavorited ? (
            <IcStar id="favor" onClick={toggleFavorite} />
          ) : (
            <IcStarBlank id="favor" onClick={toggleFavorite} />
          )}
        </Header>

        <Synopsis>
          <IconText>
            <IcSmallStar />
            <p>대표 작품</p>
          </IconText>
          <WorkGrid>
            {celebInfo.relatedContents.map((work) => (
              <Work key={work.contentId}>
                <img src={work.imageUrl} alt="work Poster" />
                <p>{work.title}</p>
              </Work>
            ))}
          </WorkGrid>
        </Synopsis>

        <ListWrapper>
          <IconText>
            <IcPencil />
            <p>작품 활동</p>
          </IconText>
          <WorkWrapper>
            {celebInfo.works.map((work) => (
              <div key={work.contentId}>
                <li>
                  {work.year}
                  <p
                    onClick={() => {
                      handleClickContent(work.contentId);
                    }}
                  >
                    {work.title}
                  </p>
                </li>
                <hr />
              </div>
            ))}
          </WorkWrapper>
        </ListWrapper>
      </CelebPageContainer>
      <ActionButton onClick={handleClickPlaceInfo}>
        <IcMarker />
        <p>'{celebInfo.name}'의 촬영지 알아보기</p>
      </ActionButton>
    </>
  );
};

export default CelebDetails;

const CelebPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  min-height: 80%;

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

  min-height: 30vh;

  #poster {
    width: 50%;
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
    ${({ theme }) => theme.fonts.Title4};
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

  svg {
    width: 20px;
    height: 20px;
  }

  p {
    ${({ theme }) => theme.fonts.Title6};
  }
`;

const WorkGrid = styled.div`
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

const Work = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  flex: 0 0 104px;
  height: auto;

  width: 10rem;

  img {
    width: 100%;
  }

  p {
    margin-top: 5px;
    ${({ theme }) => theme.fonts.Body2};

    width: 100%;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
  margin-bottom: 2rem;

  margin-bottom: 0.5rem;
`;

const WorkWrapper = styled.ul`
  li {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;

    margin-left: 3rem;

    ${({ theme }) => theme.fonts.Body2};
    color: #868181;
  }

  p {
    margin-left: 5rem;
    ${({ theme }) => theme.fonts.Title6};
    color: ${({ theme }) => theme.colors.Gray1};
    text-decoration: underline;
  }

  hr {
    margin: 1rem 2rem;
    width: 300px;
    height: 1px;
    border: 0;
    background: ${({ theme }) => theme.colors.Gray3};
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
  ${({ theme }) => theme.fonts.Head2};
  color: ${({ theme }) => theme.colors.White};

  p {
    margin-left: 1.5rem;
  }
`;
