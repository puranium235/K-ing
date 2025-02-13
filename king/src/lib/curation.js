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

//큐레이션 리스트 조회
export const getCurationList = async (query, cursor) => {
  try {
    const { data } = await client.get(
      `/curation-lists/search?query=${query || ''}&cursor=${cursor || ''}`,
    );
    // const { data } = await client.get(`/curation?size=10`);
    return data.data;
  } catch (err) {
    console.error(err);
  }
};

export const deleteCuration = async (curationId) => {
  try {
    const { data } = await client.delete(`/curation/${curationId}`);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
