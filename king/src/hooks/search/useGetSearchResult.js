import useSWRInfinite from 'swr/infinite';

import { mainGetFetcher } from '@/apis/axios';

const useGetSearchResult = (keyword, memberId, searchType) => {
  const getKey = (pageIndex, previousPageData) => {
    if (previousPageData && !previousPageData.data.rooms.length) return null;

    return searchType === 'hashtag'
      ? `/room/search/hashtag?hashtag=${keyword}&memberId=${memberId}&page=${pageIndex}`
      : `/room/search?search=${keyword}&memberId=${memberId}&page=${pageIndex}`;
  };

  const { data, error, size, setSize, isLoading } = useSWRInfinite(getKey, mainGetFetcher);

  const results = data ? [].concat(...data.map((res) => res.data.results)) : [];
  const getNextData = () => setSize(size + 1);

  return {
    searchResultList: results,
    getNextData,
    isLoading,
    isError: error,
  };
};

export default useGetSearchResult;
