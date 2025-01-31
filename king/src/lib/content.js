import { client } from './axios';

//GET 요청 예시
export const getContents = async (contentId) => {
  try {
    const { data } = await client.get(`/content/${contentId}`);
    return data;
  } catch (err) {
    console.error(err);
  }
};

//POST 요청 예시
export const postComment = async (title, img) => {
  try {
    const { data } = await client.post(`/createComment`, {
      title,
      img,
    });
    return data;
  } catch (err) {
    console.error(err);
  }
};
