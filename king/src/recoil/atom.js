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

const searchQueryState = atom({
  key: 'searchQueryState',
  default: '',
});

const searchRegionState = atom({
  key: 'searchRegionState',
  default: '',
});

const curationPlaceList = atom({
  key: 'placeListState',
  default: [],
});

export { ContentType, curationPlaceList, FilterOption, searchQueryState, searchRegionState };
