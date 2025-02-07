import React, { useRef, useState } from 'react';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import { IcImageUpload, IcImageUploadTrue, IcToggleFalse, IcToggleTrue } from '../../assets/icons';
import useToggle from '../../hooks/common/useToggle';
import { getPostDraft } from '../../lib/post';
import { DraftExist } from '../../recoil/atom';
import BackButton from '../common/button/BackButton';
import Nav from '../common/Nav';
import SearchBar from '../common/SearchBar';

const PostUpload = () => {
  const toggle = useToggle(false);
  const fileInputRef = useRef(null);

  const [place, setPlace] = useState('');
  const [placeId, setPlaceId] = useState(1);
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [isShareEnabled, setIsShareEnabled] = useState(false);

  const isDraft = useRecoilValue(DraftExist);

  const initData = async () => {
    if (isDraft) {
      const res = await getPostDraft();

      const { content, place, imageUrl } = res.data;
      setCaption(content);
      setPlaceId(place.placeId);
      setImage(imageUrl);
    }
  };

  const saveDraft = () => {
    const postData = {
      content: caption,
      placeId,
      imageUrl: image,
    };

    console.log(image);
    //post 요청
  };

  const sharePost = () => {
    if (image && placeId && caption) {
      const formData = new FormData();
      formData.append('imageUrl', image);
      formData.append('content', caption);
      formData.append('placeId', placeId);

      console.log(formData);
      //post 요청
    }
  };

  useEffect(() => {
    initData();
  }, [isDraft]);

  useEffect(() => {
    setIsShareEnabled(!!image && !!placeId && !!caption);
  }, [image, placeId, caption]);

  const handlePlaceChange = (item) => {
    setPlaceId(item.originalId);
    setPlace(item.name);
  };

  const handleCaptionChange = (event) => {
    setCaption(event.target.value);
  };

  const handleToggle = () => {
    toggle.handleToggle();
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <>
      <StHomeWrapper>
        <IconText>
          <BackButton />
          <p>새 인증샷</p>
        </IconText>

        <ImageUploadWrapper
          $isImage={image ? true : false}
          style={{ backgroundImage: `url(${image})` }}
        >
          <input
            type="file"
            accept="image/png, image/jpeg"
            onChange={handleImageChange}
            style={{ display: 'none' }}
            ref={fileInputRef}
          />
          {image ? (
            <IcImageUploadTrue onClick={triggerFileInput} />
          ) : (
            <IcImageUpload onClick={triggerFileInput} />
          )}
          {image ? <h3>사진 재업로드하기</h3> : <h3>사진 업로드하기</h3>}
          <p>PNG, JPG 형식만 지원됩니다.</p>
        </ImageUploadWrapper>

        <SearchPlaceWrapper>
          <SearchBar type={'PLACE'} query={place} onSet={handlePlaceChange} />
          <p>{place}</p>
        </SearchPlaceWrapper>

        <CaptionInput
          placeholder="문구 추가.."
          value={caption}
          onChange={handleCaptionChange}
        ></CaptionInput>

        <PublicToggleWrapper>
          <h3>공개 / 비공개</h3>
          {toggle.toggle ? (
            <IcToggleTrue onClick={handleToggle} />
          ) : (
            <IcToggleFalse onClick={handleToggle} />
          )}
        </PublicToggleWrapper>

        <ButtonWrapper>
          <TemporaryButton onClick={saveDraft}>임시 저장</TemporaryButton>
          <SaveButton disabled={!isShareEnabled} onClick={sharePost}>
            공유
          </SaveButton>
        </ButtonWrapper>
      </StHomeWrapper>

      <Nav />
    </>
  );
};

export default PostUpload;

const StHomeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
  text-align: center;

  padding: 2rem;
  margin-bottom: 7rem;

  gap: 1rem;
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

const ImageUploadWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  gap: 1rem;
  margin-top: 1rem;

  width: 100%;
  height: 20rem;
  position: relative;

  background-color: ${({ theme }) => theme.colors.Gray5};
  background-size: cover;
  background-position: center;
  border-radius: 1rem;

  cursor: pointer;

  ${({ isImage }) =>
    isImage &&
    `
    &:after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.9);
      border-radius: 1rem;
    }
  `}
  h3 {
    z-index: 1;

    color: ${({ theme, $isImage }) => ($isImage ? theme.colors.White : theme.colors.Gray0)};
    ${({ theme }) => theme.fonts.Title4};
  }

  p {
    z-index: 1;
    color: ${({ theme, $isImage }) => ($isImage ? theme.colors.White : '#464656')};
    ${({ theme }) => theme.fonts.Body4};
  }
`;

const CaptionInput = styled.textarea`
  width: 98%;
  height: 10rem;
  padding: 1rem;

  box-sizing: border-box;

  color: #626273;
  ${({ theme }) => theme.fonts.Body3};

  border: 1px solid ${({ theme }) => theme.colors.Gray2};
  border-radius: 1rem;
`;

const SearchPlaceWrapper = styled.div`
  width: 100%;
`;

const PublicToggleWrapper = styled.div`
  width: 100%;

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  margin-top: 1rem;

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
  margin-top: 2rem;

  gap: 2rem;
  width: 100%;
`;

const TemporaryButton = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.Gray1};
  border-radius: 1rem;

  width: 100%;
  padding: 1rem 2rem;

  color: ${({ theme }) => theme.colors.Gray1};
  ${({ theme }) => theme.fonts.Body2};
`;

const SaveButton = styled.button`
  background-color: ${({ theme, disabled }) =>
    disabled ? theme.colors.Gray5 : theme.colors.MainBlue};
  color: ${({ theme, disabled }) => (disabled ? theme.colors.Gray2 : theme.colors.White)};
  border-radius: 1rem;
  padding: 1rem 2rem;
  width: 100%;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};

  &:hover {
    background-color: ${({ theme, disabled }) =>
      disabled ? theme.colors.Gray5 : theme.colors.LightBlue};
  }
`;
