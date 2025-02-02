import { client } from './axios';

// 검색어 및 지역 정보로 장소 검색 (GET 요청)
export const searchMapView = async (query, region) => {
  try {
    const params = region ? { query, region } : { query };
    const { data } = await client.get('/search/map-view', { params });

    // 데이터 유효성 검사
    if (!data || !data.data || !data.data.places) {
      console.warn('Warning: No places data found');
      return [];
    }

    return data.data.places;
  } catch (err) {
    console.error(err);
  }
};
