import { Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { RecoilRoot } from "recoil";

import ArchivePage from "./pages/ArchivePage";
import ErrorPage from "./pages/ErrorPage";
import HomePage from "./pages/HomePage";
import MapPage from "./pages/MapPage";
import PlaceDetailPage from "./pages/PlaceDetailPage";

const Router = () => {
  return (
    <BrowserRouter>
      <RecoilRoot>
        <Suspense>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="*" element={<ErrorPage />} />
            <Route path="/archive" element={<ArchivePage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/place/:placeId" element={<PlaceDetailPage />} />
          </Routes>
        </Suspense>
      </RecoilRoot>
    </BrowserRouter>
  );
};

export default Router;
