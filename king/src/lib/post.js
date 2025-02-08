import { client } from './axios';

// 게시글 임시저장 조회
export const getPostDraft = async () => {
  try {
    const { data } = await client.get(`/post/draft`);
    return data.data;
  } catch (err) {
    console.error(err);
  }
};

// 게시글 임시저장
export const postDraft = async (image, content, placeId, isPublic) => {
  const draftInfo = {
    content,
    placeId,
    isPublic,
  };

  const requestBody = new FormData();
  const jsonDraftData = JSON.stringify(draftInfo);
  const draft = new Blob([jsonDraftData], { type: 'application/json' });
  requestBody.append('draft', draft);
  requestBody.append('imageFile', image);

  try {
    const { data } = await client.post(`/post/draft`, requestBody, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  } catch (err) {
    console.error(err);
  }
};
