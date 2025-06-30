import React, { useRef, useState } from 'react';
import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import {
  IcImageUpload,
  IcImageUploadTrue,
  IcMarker2,
  IcToggleFalse,
  IcToggleTrue,
} from '../../assets/icons';
import useModal from '../../hooks/common/useModal';
import useToggle from '../../hooks/common/useToggle';
import {
  createPost,
  deletePostDraft,
  getPostDetail,
  getPostDraft,
  postDraft,
  updatePost,
} from '../../lib/post';
import { DraftExist, UseDraft } from '../../recoil/atom';
import { convertHeicToJpeg } from '../../util/convertHeicToJpeg';
import { convertToBlob } from '../../util/convertToBlob';
import { getLanguage, getTranslations } from '../../util/languageUtils';
import BackButton from '../common/button/BackButton';
import Nav from '../common/Nav';
import SearchBar from '../common/SearchBar';
import DraftModal from './Modal/DraftModal';
import UploadingModal from './Modal/UploadingModal';

const PostUpload = ({ state }) => {
  const { postId } = useParams();
  const create = useModal();
  const upload = useModal();
  const toggle = useToggle(true);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [place, setPlace] = useState('');
  const [placeId, setPlaceId] = useState(0);
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [isShareEnabled, setIsShareEnabled] = useState(false);

  const isDraft = useRecoilValue(DraftExist);
  const useDraft = useRecoilValue(UseDraft);

  const [language, setLanguage] = useState(getLanguage());
  const { post: postTranslations } = getTranslations(language);

  // 언어 변경 시 상태 업데이트
  useEffect(() => {
    const handleLanguageChange = () => setLanguage(getLanguage());
    window.addEventListener('languageChange', handleLanguageChange);
    return () => window.removeEventListener('languageChange', handleLanguageChange);
  }, []);

  useEffect(() => {
    if (isDraft) {
      create.setShowing(true);
    }
  }, [isDraft]);

  const initData = async () => {
    let res;

    if (postId) {
      //업데이트
      res = await getPostDetail(postId, true);
      setImage(res.imageUrl);
    } else if (isDraft && useDraft) {
      //임시저장 불러오기
      res = await getPostDraft();
      if (res.imageData) {
        setImage(`data:image/jpeg;base64,${res.imageData}`);
        const blob = convertToBlob(res.imageData);
        setImageFile(blob);
      }
    } else {
      return;
    }

    setCaption(res.content ? res.content : '');
    if (res.place) {
      setPlaceId(res.place.placeId);
      setPlace(res.place.name);
    }

    toggle.setToggle(res.public);

    if (isDraft && useDraft) {
      await deletePostDraft();
    }
  };

  const saveDraft = async () => {
    if (imageFile || placeId || caption) {
      const draftInfo = { public: toggle.toggle };
      if (caption) {
        draftInfo.content = caption;
      }
      if (placeId !== 0) {
        draftInfo.placeId = placeId;
      }

      const res = await postDraft(draftInfo, imageFile);
      if (res.success) {
        alert(postTranslations.alertDraftSaved);
        navigate(`/home`);
      }
    }
  };

  const sharePost = async () => {
    if (isShareEnabled) {
      const postInfo = {
        content: caption,
        placeId,
        public: toggle.toggle,
      };

      upload.setShowing(true);
      const res = await createPost(postInfo, imageFile);
      upload.setShowing(false);

      if (res.data) {
        navigate(`/feed/${res.data}`, { state: { from: { pathname: location.pathname } } });
      }
    }
  };

  const handleUpdatePost = async () => {
    if (isShareEnabled) {
      const postInfo = {
        content: caption,
        placeId,
        public: toggle.toggle,
      };

      upload.setShowing(true);
      const res = await updatePost(postId, postInfo, imageFile);
      upload.setShowing(false);

      if (res.success) {
        navigate(`/feed/${postId}`, { state: { from: { pathname: location.pathname } } });
      }
    }
  };

  useEffect(() => {
    initData();
  }, [useDraft, postId]);

  useEffect(() => {
    setIsShareEnabled(!!image && !!placeId && !!caption);
  }, [image, placeId, caption]);

  const handlePlaceChange = (item) => {
    setPlaceId(item.originalId);
    setPlace(item.name);
  };

  const handleCaptionChange = (event) => {
    if (event.target.value.length <= 1000) {
      setCaption(event.target.value);
    } else {
      alert('글자수는 최대 1000자까지 입력 가능합니다.');
    }
  };

  const handleToggle = () => {
    toggle.handleToggle();
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    // if (
    //   !file.name.toLowerCase().endsWith('.jpg') &&
    //   !file.name.toLowerCase().endsWith('.png') &&
    //   !file.name.toLowerCase().endsWith('.heic') &&
    //   !file.name.toLowerCase().endsWith('.gif')
    // ) {
    //   alert('지원하지 않는 이미지 형식입니다.');
    //   event.target.type = '';
    //   event.target.type = 'file';
    //   return;
    // }

    if (file.size > 5 * 1024 * 1024) {
      //5MB
      alert(postTranslations.alertMaxSizeExceeded);
      event.target.type = '';
      event.target.type = 'file';
      return;
    }

    if (file.name.endsWith('.heic') || file.name.endsWith('.heif')) {
      //heic 이미지 처리
      const newFile = await convertHeicToJpeg(file);
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

  return (
    <>
      <StUploadWrapper>
        <IconText>
          <BackButton />
          <p>{postTranslations.title}</p>
        </IconText>

        <ImageUploadWrapper
          onClick={triggerFileInput}
          $isImage={image ? true : false}
          style={{ backgroundImage: `url(${image})` }}
        >
          <input
            type="file"
            accept="image/png, image/jpeg, image/heic, image/gif"
            onChange={handleImageChange}
            style={{ display: 'none' }}
            ref={fileInputRef}
          />
          {image ? <IcImageUploadTrue /> : <IcImageUpload />}
          {image ? (
            <h3>{postTranslations.reuploadPhoto}</h3>
          ) : (
            <h3>{postTranslations.uploadPhoto}</h3>
          )}
          <p>{postTranslations.photoDesc}</p>
        </ImageUploadWrapper>

        <SearchPlaceWrapper>
          <SearchBar type={'PLACE'} query={place} onSet={handlePlaceChange} />
          <div id="place">
            {place && <IcMarker2 />}
            <p>{place}</p>
          </div>
        </SearchPlaceWrapper>

        <CaptionInput
          placeholder={postTranslations.titlePlaceholder}
          value={caption}
          onChange={handleCaptionChange}
        ></CaptionInput>

        <PublicToggleWrapper>
          <h3>{postTranslations.public}</h3>
          {toggle.toggle ? (
            <IcToggleTrue onClick={handleToggle} />
          ) : (
            <IcToggleFalse onClick={handleToggle} />
          )}
        </PublicToggleWrapper>
        {state === 'upload' ? (
          <ButtonWrapper>
            <TemporaryButton onClick={saveDraft}>{postTranslations.draft}</TemporaryButton>
            <SaveButton disabled={!isShareEnabled} onClick={sharePost}>
              {postTranslations.upload}
            </SaveButton>
          </ButtonWrapper>
        ) : (
          <ButtonWrapper>
            <TemporaryButton onClick={() => navigate(-1)}>
              {postTranslations.cancel}
            </TemporaryButton>
            <SaveButton disabled={!isShareEnabled} onClick={handleUpdatePost}>
              {postTranslations.save}
            </SaveButton>
          </ButtonWrapper>
        )}
      </StUploadWrapper>

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

export default PostUpload;

const StUploadWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
  text-align: center;

  padding: 2rem;
  padding-bottom: 7rem;

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
  background-image: ${({ $imageUrl }) => ($imageUrl ? `url(${$imageUrl})` : 'none')};
  background-size: cover;
  background-position: center;
  border-radius: 1rem;

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
      border-radius: 1rem;
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

  #place {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;

    svg {
      width: 2rem;
      height: 2rem;

      margin-left: 1rem;
    }

    p {
      ${({ theme }) => theme.fonts.Body3};
      color: ${({ theme }) => theme.colors.Gray1};
    }
  }
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

  padding: 1rem 2rem;

  color: ${({ theme }) => theme.colors.Gray1};
  ${({ theme }) => theme.fonts.Body2};
`;

const SaveButton = styled.button`
  border-radius: 1rem;
  padding: 1rem 2rem;

  height: 100%;

  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};

  ${({ theme }) => theme.fonts.Body2};
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
