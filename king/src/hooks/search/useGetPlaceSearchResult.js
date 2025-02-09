import { useEffect } from 'react';
import useSWRInfinite from 'swr/infinite';

import { mainGetFetcher } from '../../lib/axios';

const useGetPlaceSearchResult = ({
  query,
  category,
  region,
  sortBy,
  placeTypeList,
  relatedType,
}) => {
  const getKey = (pageIndex, previousPageData) => {
    if (previousPageData && !previousPageData.data.nextCursor) return null; // 마지막 페이지

    const baseParams = `query=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`;
    const regionParam = region ? `&region=${encodeURIComponent(region)}` : '';
    const sortByParam = sortBy ? `&sortBy=${encodeURIComponent(sortBy)}` : '';
    const placeTypeListParam = placeTypeList
      ? `&placeTypeList=${encodeURIComponent(placeTypeList.join(','))}`
      : '';
    const relatedTypeParam = relatedType ? `&relatedType=${encodeURIComponent(relatedType)}` : '';

    return pageIndex === 0
      ? `/search/search?${baseParams}&size=15${regionParam}${sortByParam}${placeTypeListParam}${relatedTypeParam}`
      : `/search/search?${baseParams}&size=15&cursor=${previousPageData.data.nextCursor}${regionParam}${sortByParam}${placeTypeListParam}${relatedTypeParam}`;
  };

  const { data, error, size, setSize, isValidating, mutate } = useSWRInfinite(
    getKey,
    mainGetFetcher,
  );

  useEffect(() => {
    mutate();
    setSize(1);
  }, [query, region, sortBy, mutate, setSize]);

  const results = data ? [].concat(...data.map((res) => res.data.results)) : [];
  const isEmpty = data?.[0]?.data?.results?.length === 0;
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.data?.results?.length < 15);
  const hasMore = !isEmpty && !isReachingEnd;

  return {
    placeList: results,
    getNextData: () => {
      if (!isValidating) {
        setSize(size + 1);
      }
    },
    isLoading: isValidating,
    isError: error,
    hasMore,
  };
};

export default useGetPlaceSearchResult;
