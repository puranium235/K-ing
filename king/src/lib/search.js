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
export const getSearchResult = async (
  query,
  category,
  size,
  sortBy,
  sortOrder,
  placeType,
  region,
  cursor,
) => {
  try {
    const params = { query };

    if (category !== '') params.category = category;
    if (size !== '') params.size = size;
    if (sortBy !== '') params.sortBy = sortBy;
    if (sortOrder !== '') params.sortOrder = sortOrder;
    if (placeType !== '') params.placeType = placeType;
    if (region !== '') params.region = region;
    if (cursor !== '') params.cursor = cursor;

    const { data } = await client.get('/search/search', { params });
    return data.data;
  } catch (err) {
    console.error(err);
  }
};
