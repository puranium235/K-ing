import { atom } from 'recoil';

const FilterOption = atom({
  key: 'filterOption',
  default: {
    categories: {
      restaurant: false,
      cafe: false,
      sight: false,
    },
    province: '',
    district: '',
  },
});

const ContentType = atom({
  key: 'contentType',
  default: '',
});

export { ContentType, FilterOption };
