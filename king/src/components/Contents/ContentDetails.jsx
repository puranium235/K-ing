import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { IcMan, IcMarker, IcMarker2, IcPencil, IcStar, IcTv } from '../../assets/icons';
import { getContentDetails } from '../../lib/content';
import { convertLowerCase } from '../../util/changeStrFormat';
import { getContentTypeKor } from '../../util/getContentType';
import BackButton from '../common/BackButton';

const ContentDetails = () => {
  const navigate = useNavigate();

  const handleClickPlaceInfo = () => {
    navigate(`/search/keyword`);
  };

  const handleClickCast = (celebId) => {
    navigate(`/content/celeb/${celebId}`);
  };

  const { contentId } = useParams();
  const [contentInfo, setContentInfo] = useState(null);
  const [typeKor, setTypeKor] = useState('');

  const getDetails = async () => {
    const res = await getContentDetails(contentId);
    setContentInfo(res);

    if (contentInfo) {
      const { title, type, broadcast, description, imageUrl, relatedCasts, favorite } = contentInfo;
      setTypeKor(getContentTypeKor(convertLowerCase(type)));
    }
  };

  useEffect(() => {
    getDetails();
  }, [contentInfo]);

  if (!contentInfo) {
    return null;
  }

  return (
    <>
      <DramaPageContainer>
        <IconText>
          <BackButton />
          <h3> 세부정보</h3>
        </IconText>

        <Header>
          <img
            id="poster"
            src={contentInfo.imageUrl ? contentInfo.imageUrl : '/src/assets/dummy/poster1.png'}
            alt="Poster"
          />
          <TitleSection>
            <h3>{contentInfo.title}</h3>
            <IconText>
              <IcTv />
              <p>{typeKor}</p>
            </IconText>
            <IconText>
              <IcMarker2 />
              <p>{contentInfo.broadcast}</p>
            </IconText>
          </TitleSection>
          <IcStar id="favor" />
        </Header>

        <Synopsis>
          <IconText>
            <IcPencil />
            <p>소개</p>
          </IconText>
          {contentInfo.description}
        </Synopsis>

        <IconText>
          <IcMan />
          <p>등장인물</p>
        </IconText>
        <CastGrid>
          {contentInfo.relatedCasts.map((cast) => (
            <CastMember
              key={cast.castId}
              onClick={() => {
                handleClickCast(cast.castId);
              }}
            >
              <img src={cast.imageUrl} alt="Cast" />
              <p>{cast.name}</p>
            </CastMember>
          ))}
        </CastGrid>
      </DramaPageContainer>
      <ActionButton onClick={handleClickPlaceInfo}>
        <IcMarker />
        <p>촬영지 알아보기</p>
      </ActionButton>
    </>
  );
};

export default ContentDetails;

const DramaPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  padding: 20px;
  background-color: #fff;

  min-height: 80%;

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
    ${({ theme }) => theme.fonts.Title5};
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
