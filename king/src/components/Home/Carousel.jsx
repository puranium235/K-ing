import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import styled from 'styled-components';

const Carousel = ({ carouselList }) => {
  const navigate = useNavigate();

  const handleClickCuration = (curationId) => {
    navigate(`/curation/${curationId}`);
  };

  const settings = {
    dots: false, // 하단 네비게이션 점 제거
    infinite: true, // 무한 반복
    speed: 500, // 전환 속도
    slidesToShow: 1, // 한 번에 보이는 슬라이드 개수
    slidesToScroll: 1, // 한 번에 스크롤되는 슬라이드 개수
    autoplay: true, // 자동 슬라이드
    autoplaySpeed: 5000, // 자동 슬라이드 속도 (5초)
    arrows: false, // 좌우 화살표 제거
    swipe: true, // 터치 스와이프 가능
  };

  return (
    <Container>
      <StyledSlider {...settings}>
        {carouselList.map((item) => (
          <CarouselItem key={item.id} onClick={() => handleClickCuration(item.id)}>
            <img src={item.imageUrl} alt="carousel-img" />
            <p>{item.title}</p>
          </CarouselItem>
        ))}
      </StyledSlider>
    </Container>
  );
};

export default Carousel;

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 2rem;
`;

const StyledSlider = styled(Slider)`
  width: 100%;

  .slick-list {
    overflow: hidden;
  }

  .slick-track {
    display: flex;
    align-items: center;
  }

  .slick-slide {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
  }
`;

const CarouselItem = styled.div`
  position: relative;
  width: 100%;
  height: 100%;

  cursor: pointer;

  img {
    width: 35rem;
    height: 18rem;
    object-fit: contain;
    object-position: center;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    background-color: rgba(0, 0, 0, 0.3);
    z-index: 1;
  }

  p {
    position: absolute;
    bottom: 1rem;
    left: 1rem;

    color: ${({ theme }) => theme.colors.White};
    padding: 0.5rem 1rem;
    ${({ theme }) => theme.fonts.Title6}
    z-index: 2;
  }
`;
