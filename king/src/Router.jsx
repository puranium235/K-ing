import { Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { RecoilRoot } from 'recoil';

import ScrollToTop from './components/common/ScrollToTop';
import ArchivePage from './pages/ArchivePage';
import CelebDetailPage from './pages/CelebDetailPage';
import ChatbotPage from './pages/ChatbotPage';
import ContentDetailPage from './pages/ContentDetailPage';
import ContentPage from './pages/ContentPage';
import CurationDetailPage from './pages/CurationDetailPage';
import CurationMapPage from './pages/CurationMapPage';
import CurationPage from './pages/CurationPage';
import ErrorPage from './pages/ErrorPage';
import FavoritesDetailPage from './pages/FavoritesDetailPage';
import FeedPage from './pages/FeedPage';
import HomePage from './pages/HomePage';
import LandingPage from './pages/LandingPage';
import MapPage from './pages/MapPage';
import MyPage from './pages/MyPage';
import PlaceDetailPage from './pages/PlaceDetailPage';
import ReviewFeedPage from './pages/ReviewFeedPage';
import SearchFilterPage from './pages/SearchFilterPage';
import SearchKeywordpage from './pages/SearchKeywordPage';
import SearchResultPage from './pages/SearchResultPage';
import UploadPage from './pages/UploadPage';

const Router = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <RecoilRoot>
        <Suspense>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/chatbot" element={<ChatbotPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/archive" element={<ArchivePage />} />
            <Route path="/favorites/works" element={<FavoritesDetailPage type="works" />} />
            <Route path="/favorites/people" element={<FavoritesDetailPage type="people" />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/curation" element={<CurationPage />} />
            <Route path="/curation/:curationId" element={<CurationDetailPage />} />
            <Route path="/curation/map/:curationId" element={<CurationMapPage />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/content/:contentType" element={<ContentPage />} />
            <Route path="/content/celeb/:celebId" element={<CelebDetailPage />} />
            <Route path="/content/:contentType/:contentId" element={<ContentDetailPage />} />
            {/* 카테고리 설정시 */}
            <Route path="/search/keyword" element={<SearchKeywordpage />} />
            <Route path="/search/keyword/filter" element={<SearchFilterPage />} />
            {/* 통합검색시 */}
            <Route path="/search/result" element={<SearchResultPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/place/:placeId" element={<PlaceDetailPage />} />
            <Route path="/reviewfeed/:placeId" element={<ReviewFeedPage />} />
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </Suspense>
      </RecoilRoot>
    </BrowserRouter>
  );
};

export default Router;
