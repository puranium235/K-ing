import { atom } from 'recoil';

const FilterOption = atom({
  key: 'filterOption',
  default: {
    categories: {
      RESTAURANT: false,
      CAFE: false,
      PLAYGROUND: false,
      STORE: false,
      STAY: false,
    },
    province: '',
    district: '',
  },
});

const ContentId = atom({
  key: 'contentId',
  default: 1,
});

const ContentType = atom({
  key: 'contentType',
  default: '',
});

const SearchQueryState = atom({
  key: 'searchQueryState',
  default: '',
});

const SearchRelatedType = atom({
  key: 'searchRelatedType',
  default: '',
});

const SearchPrevQuery = atom({
  key: 'searchPrevQuery',
  default: '',
});

const SearchCategoryState = atom({
  key: 'searchCategoryState',
  default: '',
});

const SearchRegionState = atom({
  key: 'searchRegionState',
  default: '',
});

const CurationPlaceList = atom({
  key: 'placeListState',
  default: [],
});

export {
  ContentId,
  ContentType,
  CurationPlaceList,
  FilterOption,
  SearchCategoryState,
  SearchPrevQuery,
  SearchQueryState,
  SearchRegionState,
  SearchRelatedType,
};
