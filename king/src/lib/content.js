import { client } from './axios';

//컨텐츠 세부정보 조회
export const getContentDetails = async (contentId) => {
  try {
    const { data } = await client.get(`/content/${contentId}`);
    return data.data;
  } catch (err) {
    console.error(err);
  }
};
