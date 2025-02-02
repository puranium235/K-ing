import { atom } from 'recoil';

const FilterOption = atom({
  key: 'filterOption',
  default: {
    categories: {
      RESTAURANT: false,
      CAFE: true,
      PLAYGROUND: true,
      STORE: false,
      STAY: false,
    },
    province: '',
    district: '',
  },
});

const ContentType = atom({
  key: 'contentType',
  default: '',
});

const SearchQueryState = atom({
  key: 'searchQueryState',
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

export { ContentType, CurationPlaceList, FilterOption, SearchQueryState, SearchRegionState };
