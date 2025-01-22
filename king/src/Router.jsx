import { Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { RecoilRoot } from "recoil";

import ArchivePage from "./pages/ArchivePage";
import ChatbotPage from "./pages/ChatbotPage";
import CurationPage from "./pages/CurationPage";
import DramaDetailPage from "./pages/DramaDetailPage";
import DramaPage from "./pages/DramaPage";
import ErrorPage from "./pages/ErrorPage";
import FeedPage from "./pages/FeedPage";
import HomePage from "./pages/HomePage";
import LandingPage from "./pages/LandingPage";
import MyPage from "./pages/MyPage";
import UploadPage from "./pages/UploadPage";
import MapPage from "./pages/MapPage";
import PlaceDetailPage from "./pages/PlaceDetailPage";

const Router = () => {
  return (
    <BrowserRouter>
      <RecoilRoot>
        <Suspense>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/chatbot" element={<ChatbotPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/archive" element={<ArchivePage />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/curation" element={<CurationPage />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/drama" element={<DramaPage />} />
            <Route path="/drama/details" element={<DramaDetailPage />} />
            <Route path="/archive" element={<ArchivePage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/place/:placeId" element={<PlaceDetailPage />} />
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </Suspense>
      </RecoilRoot>
    </BrowserRouter>
  );
};

export default Router;
