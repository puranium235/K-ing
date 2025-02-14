import React, { useRef, useState } from 'react';
import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import styled from 'styled-components';

import { IcImageUpload, IcImageUploadTrue, IcToggleFalse, IcToggleTrue } from '../../assets/icons';
import useModal from '../../hooks/common/useModal';
import useToggle from '../../hooks/common/useToggle';
import {
  createCuration,
  deleteCurationDraft,
  getCurationDetail,
  getCurationDraft,
  postCurationDraft,
  updateCuration,
} from '../../lib/curation';
import { CurationDraftExist, CurationPlaceUploadList, UseDraft } from '../../recoil/atom';
import { convertHeicToJpeg } from '../../util/convertHeicToJpeg';
import { convertToBlob } from '../../util/convertToBlob';
import BackButton from '../common/button/BackButton';
import Nav from '../common/Nav';
import DraftModal from './Modal/DraftModal';
import UploadingModal from './Modal/UploadingModal';

const CurationUpload = ({ state }) => {
  const { curationId } = useParams();
  const create = useModal();
  const upload = useModal();
  const toggle = useToggle(true);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [placeIds, setPlaceIds] = useState([]);
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isShareEnabled, setIsShareEnabled] = useState(false);
  const [placeList, setPlaceList] = useRecoilState(CurationPlaceUploadList);
  const isDraft = useRecoilValue(CurationDraftExist);
  const useDraft = useRecoilValue(UseDraft);

  useEffect(() => {
    console.log(placeList);

    if (state == 'upload') {
      setPlaceIds(placeList.map((place) => place.id));
    } else if (state == 'update') {
      setPlaceIds(placeList.map((place) => place.placeId));
    }
  }, [placeList]);

  useEffect(() => {
    if (isDraft) {
      create.setShowing(true);
    }
  }, [isDraft]);

  const initData = async () => {
    let res;

    if (curationId) {
      res = await getCurationDetail(curationId);
      setImage(res.imageUrl);
    } else if (isDraft && useDraft) {
      res = await getCurationDraft();
      if (res.imageData) {
        setImage(`data:image/jpeg;base64,${res.imageData}`);
        setImageFile(convertToBlob(res.imageData, 'image/jpeg'));
      }
    } else {
      return;
    }

    setTitle(res.title ? res.title : '');
    setDescription(res.description ? res.description : '');
    if (res.places) {
      setPlaceList(res.places);
    }

    toggle.setToggle(res.public);

    if (isDraft && useDraft) {
      await deleteCurationDraft();
    }
  };

  const saveDraft = async () => {
    if (imageFile || placeIds.length > 0 || title || description) {
      const draftInfo = { public: toggle.toggle };
      if (title) {
        draftInfo.title = title;
      }
      if (description) {
        draftInfo.description = description;
      }
      if (placeIds.length > 0) {
        draftInfo.placeIds = placeIds;
      }
      console.log(imageFile);
      const res = await postCurationDraft(draftInfo, imageFile);
      if (res.success) {
        alert('임시저장이 완료되었습니다.');
        navigate(`/home`);
      }
    }
  };

  const shareCuration = async () => {
    if (isShareEnabled) {
      const curationInfo = {
        title,
        description,
        placeIds,
        public: toggle.toggle,
      };

      upload.setShowing(true);
      const res = await createCuration(curationInfo, imageFile);
      upload.setShowing(false);

      if (res.data) {
        setPlaceList([]);
        navigate(`/curation/${res.data.curationListId}`, {
          state: { from: { pathname: 'upload' } },
        });
      }
    }
  };

  const handleUpdateCuration = async () => {
    if (isShareEnabled) {
      console.log(placeIds);
      const curationInfo = {
        title,
        description,
        placeIds,
        public: toggle.toggle,
      };

      upload.setShowing(true);
      const res = await updateCuration(curationId, curationInfo, imageFile);
      upload.setShowing(false);

      if (res.success) {
        navigate(`/curation/${curationId}`, { state: { from: { pathname: 'update' } } });
      }
    }
  };

  useEffect(() => {
    initData();
  }, [useDraft, curationId]);

  useEffect(() => {
    setIsShareEnabled(!!image && placeIds.length > 0 && !!title && !!description);
  }, [image, placeIds, title, description]);

  const handleTitleChange = (event) => {
    const inputValue = event.target.value;

    if (inputValue.length <= 50) {
      setTitle(inputValue);
    }
  };

  const handleDescChange = (event) => {
    const inputValue = event.target.value;

    if (inputValue.length <= 1000) {
      setDescription(inputValue);
    }
  };

  const handleToggle = () => {
    toggle.handleToggle();
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    if (
      !file.name.toLowerCase().endsWith('.jpg') &&
      !file.name.toLowerCase().endsWith('.png') &&
      !file.name.toLowerCase().endsWith('.heic') &&
      !file.name.toLowerCase().endsWith('.gif')
    ) {
      alert('지원하지 않는 이미지 형식입니다.');
      event.target.type = '';
      event.target.type = 'file';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      //5MB
      alert('업로드 가능한 최대 용량은 5MB입니다. ');
      event.target.type = '';
      event.target.type = 'file';
      return;
    }

    if (file.name.endsWith('.heic') || file.name.endsWith('.heif')) {
      //heic 이미지 처리
      const newFile = convertHeicToJpeg(file);
      if (newFile) {
        setImageFile(newFile);
        setImage(URL.createObjectURL(newFile));
      }
    } else {
      setImageFile(file);
      setImage(URL.createObjectURL(file));
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCurationClick = (id) => {
    navigate(`/place/${id}`);
  };

  return (
    <>
      <StUploadWrapper>
        <IconText>
          <BackButton />
          <p>큐레이션 생성</p>
          {state === 'upload' ? (
            <ButtonWrapper>
              <TemporaryButton onClick={saveDraft}>임시 저장</TemporaryButton>
              <SaveButton disabled={!isShareEnabled} onClick={shareCuration}>
                발헹
              </SaveButton>
            </ButtonWrapper>
          ) : (
            <ButtonWrapper>
              <TemporaryButton onClick={() => navigate(-1)}>취소</TemporaryButton>
              <SaveButton disabled={!isShareEnabled} onClick={handleUpdateCuration}>
                저장
              </SaveButton>
            </ButtonWrapper>
          )}
        </IconText>
        <ImageUploadWrapper
          onClick={triggerFileInput}
          $isImage={image ? true : false}
          style={{ backgroundImage: `url(${image})` }}
        >
          <input
            type="file"
            accept="image/png, image/jpeg, image/heic"
            onChange={handleImageChange}
            style={{ display: 'none' }}
            ref={fileInputRef}
          />
          {image ? <IcImageUploadTrue /> : <IcImageUpload />}
          {image ? <h3>사진 재업로드하기</h3> : <h3>사진 업로드하기</h3>}
          <p>PNG, JPG 형식만 지원됩니다.</p>
        </ImageUploadWrapper>
        <TitleInput
          placeholder="제목을 입력하세요."
          value={title}
          onChange={handleTitleChange}
          maxLength={150}
        ></TitleInput>
        {title.length} / 50
        <DescInput
          placeholder="큐레이션을 간단하게 설명해주세요.(1000자 이내)"
          value={description}
          onChange={handleDescChange}
          maxLength={1000}
        ></DescInput>
        {description.length} / 1000
        <PublicToggleWrapper>
          <h3>공개</h3>
          {toggle.toggle ? (
            <IcToggleTrue onClick={handleToggle} />
          ) : (
            <IcToggleFalse onClick={handleToggle} />
          )}
        </PublicToggleWrapper>
      </StUploadWrapper>

      <PlaceWrapper>
        <AddButton
          onClick={() => {
            navigate(`/upload/curation/place`);
          }}
        >
          + 장소 추가하기
        </AddButton>
        <PlaceList>
          {placeList.map((place) => (
            <CardContainer key={place.id} onClick={() => handleCurationClick(place.id)}>
              <ImageContainer>
                {place.imageUrl && <Image src={place.imageUrl} alt={place.name} />}
              </ImageContainer>

              <TextContainer>{place.name && <Title>{place.name}</Title>}</TextContainer>
            </CardContainer>
          ))}
        </PlaceList>
      </PlaceWrapper>

      <Nav />

      <StUploadModalWrapper $showing={create.isShowing}>
        <DraftModal isShowing={create.isShowing} handleCancel={create.toggle} />
      </StUploadModalWrapper>
      <StUploadModalWrapper $showing={upload.isShowing}>
        <UploadingModal isShowing={upload.isShowing} />
      </StUploadModalWrapper>
    </>
  );
};

export default CurationUpload;

const PlaceList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.2rem;
  padding: 0 0.5rem;
  margin-bottom: 10rem;
`;

const StUploadWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;

  padding-top: 2rem;

  gap: 1rem;
`;

const IconText = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 0.7rem;

  width: 100%;
  box-sizing: border-box;
  padding: 0 1rem;

  p {
    width: 100%;
    padding: 0.5rem 0;
    text-align: left;
    ${({ theme }) => theme.fonts.Title4};
  }
`;

const ImageUploadWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  gap: 1rem;

  width: 100%;
  height: 20rem;
  position: relative;

  background-color: ${({ theme }) => theme.colors.Gray5};
  background-image: ${({ $imageUrl }) => ($imageUrl ? `url(${$imageUrl})` : 'none')};
  background-size: cover;
  background-position: center;
  border-radius: 0 0 1rem 1rem;

  cursor: pointer;

  ${({ $isImage }) =>
    $isImage &&
    `
    &:after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.4);
      border-radius: 0 0 1rem 1rem;
      z-index: 2;
    }
  `}

  svg {
    z-index: 3;
  }

  h3 {
    z-index: 1;

    color: ${({ theme, $isImage }) => ($isImage ? theme.colors.White : theme.colors.Gray0)};
    ${({ theme }) => theme.fonts.Title4};
    z-index: 3;
  }

  p {
    z-index: 1;
    color: ${({ theme, $isImage }) => ($isImage ? theme.colors.White : '#464656')};
    ${({ theme }) => theme.fonts.Body4};
    z-index: 3;
  }
`;

const TitleInput = styled.textarea`
  width: 95%;
  height: 5rem;

  box-sizing: border-box;
  padding: 1.5rem;

  color: #626273;
  ${({ theme }) => theme.fonts.Body3};

  border: 1px solid ${({ theme }) => theme.colors.Gray2};
  border-radius: 1.5rem;
`;

const DescInput = styled.textarea`
  width: 95%;
  height: 15rem;

  box-sizing: border-box;
  padding: 1.5rem;

  color: #626273;
  ${({ theme }) => theme.fonts.Body3};

  border: 1px solid ${({ theme }) => theme.colors.Gray2};
  border-radius: 2rem;
`;

const PublicToggleWrapper = styled.div`
  width: 100%;

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  padding: 0 2rem;
  box-sizing: border-box;

  h3 {
    color: ${({ theme }) => theme.colors.Gray0};
    ${({ theme }) => theme.fonts.Title6};
  }
`;

const ButtonWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  justify-content: center;
  align-items: center;

  gap: 1rem;
  width: 100%;
`;

const TemporaryButton = styled.button`
  width: 100%;
  border: 1px solid ${({ theme }) => theme.colors.Gray1};
  border-radius: 1rem;

  padding: 0.5rem;

  color: ${({ theme }) => theme.colors.Gray1};
  ${({ theme }) => theme.fonts.Body4};
`;

const SaveButton = styled.button`
  border-radius: 1rem;
  padding: 0.5rem;

  height: 100%;
  width: 100%;

  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};

  ${({ theme }) => theme.fonts.Body4};
  background-color: ${({ theme, disabled }) =>
    disabled ? theme.colors.Gray5 : theme.colors.MainBlue};
  color: ${({ theme, disabled }) => (disabled ? theme.colors.Gray2 : theme.colors.White)};
`;

const StUploadModalWrapper = styled.div`
  display: ${({ $showing }) => ($showing ? 'block' : 'none')};
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;

  justify-content: center;
  align-items: center;

  width: 100vw;
  height: 100vh;

  background-color: rgba(0, 0, 0, 0.5);
`;

const PlaceWrapper = styled.div`
  margin: 1rem;
  padding: 1rem;
`;

const AddButton = styled.button`
  width: 40%;
  border-radius: 3rem;

  padding: 0.5rem 2rem;

  background-color: ${({ theme }) => theme.colors.Gray0};
  color: ${({ theme }) => theme.colors.White};
  ${({ theme }) => theme.fonts.Body4};
`;

const CardContainer = styled.div`
  background-color: #fff;
  display: flex;
  flex-direction: column;

  width: 100%;
  overflow: hidden;

  cursor: pointer;
`;

const ImageContainer = styled.div`
  width: 100%;
  height: 22rem;
  overflow: hidden;
  border-radius: 10px;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const TextContainer = styled.div`
  box-sizing: border-box;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  text-align: left;

  width: 100%;
`;

const Title = styled.h3`
  width: 100%;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  ${({ theme }) => theme.fonts.Title6};
  color: ${({ theme }) => theme.colors.Gray0};
`;
