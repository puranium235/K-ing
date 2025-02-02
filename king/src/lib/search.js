import { client } from './axios';

//검색어 자동완성
export const getAutoKeyword = async (query, category) => {
  try {
    const params = category ? { query, category } : { query };
    const { data } = await client.get('/search/autocomplete', { params });
    return data.data;
  } catch (err) {
    console.error(err);
  }
};

//통합 검색
export const getSearchResult = async (searchOptions) => {
  try {
    // 미사용 파라미터 제거
    const params = Object.fromEntries(
      Object.entries(searchOptions).filter(([_, value]) => value !== undefined && value !== ''),
    );

    const { data } = await client.get('/search/search', { params });
    return data.data;
  } catch (err) {
    console.error(err);
  }
};
