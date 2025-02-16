import { atom } from 'recoil';

//스크롤 위치 유지
const ScrollPosition = atom({
  key: 'scrollPosition',
  default: 0,
});

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

const CurationId = atom({
  key: 'curationId',
  default: 1,
});

const CurationPlaceUploadList = atom({
  key: 'CurationPlaceUploadList',
  default: [],
});

export const isReturningFromPlaceUpload = atom({
  key: 'isReturningFromPlaceUpload',
  default: false,
});

const DraftExist = atom({
  key: 'draftExist',
  default: false,
});

const UseDraft = atom({
  key: 'useDraft',
  default: false,
});

const CurationDraftExist = atom({
  key: 'CurationDraftExist',
  default: false,
});

const ProfileState = atom({
  key: 'profileState',
  default: {
    imageUrl: '',
    nickname: '',
    description: '',
  },
});

const ActiveUserTabState = atom({
  key: 'activeUserTabState',
  default: 'posts', // 기본값은 'posts'
});

const ActiveArchiveTabState = atom({
  key: 'activeArchiveTabState',
  default: 'Curations',
});

export {
  ActiveArchiveTabState,
  ActiveUserTabState,
  ContentId,
  ContentType,
  CurationDraftExist,
  CurationId,
  CurationPlaceList,
  CurationPlaceUploadList,
  DraftExist,
  FilterOption,
  ProfileState,
  ScrollPosition,
  SearchCategoryState,
  SearchPrevQuery,
  SearchQueryState,
  SearchRegionState,
  SearchRelatedType,
  UseDraft,
};
