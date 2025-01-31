import { client } from './axios';

// 특정 큐레이션 상세 정보 가져오기 (GET 요청)
export const getCurationDetail = async (curationId) => {
  try {
    const { data } = await client.get(`/curation/${curationId}`);
    return data.data;
  } catch (err) {
    console.error(err);
  }
};
