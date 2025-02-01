import { atom } from 'recoil';

const FilterOption = atom({
  key: 'filterOption',
  default: {
    categories: {
      restaurant: false,
      cafe: false,
      playground: false,
      store: false,
      stay: false,
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
  default: '카페',
});

const searchRegionState = atom({
  key: 'searchRegionState',
  default: '',
});

export { ContentType, FilterOption, searchQueryState, searchRegionState };
