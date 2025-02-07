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
