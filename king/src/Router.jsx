import { Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { RecoilRoot } from 'recoil';

import ScrollToTop from './components/common/ScrollToTop';
import ArchivePage from './pages/ArchivePage';
import ChatbotPage from './pages/ChatbotPage';
import CurationDetailPage from './pages/CurationDetailPage';
import CurationMapPage from './pages/CurationMapPage';
import CurationPage from './pages/CurationPage';
import DramaDetailPage from './pages/DramaDetailPage';
import DramaPage from './pages/DramaPage';
import ErrorPage from './pages/ErrorPage';
import FavoritesDetailPage from './pages/FavoritesDetailPage';
import FeedPage from './pages/FeedPage';
import HomePage from './pages/HomePage';
import LandingPage from './pages/LandingPage';
import MapPage from './pages/MapPage';
import MyPage from './pages/MyPage';
import PlaceDetailPage from './pages/PlaceDetailPage';
import ReviewFeedPage from './pages/ReviewFeedPage';
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
            <Route path="/curation/map" element={<CurationMapPage />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/drama" element={<DramaPage />} />
            <Route path="/drama/:dramaId" element={<DramaDetailPage />} />
            <Route path="/archive" element={<ArchivePage />} />
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
