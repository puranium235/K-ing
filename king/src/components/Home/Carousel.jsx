import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

const Carousel = ({ carouselList }) => {
  const [currIndex, setCurrIndex] = useState(1);
  const [currList, setCurrList] = useState([]);
  const carouselRef = useRef(null);

  useEffect(() => {
    if (carouselList.length) {
      const startData = carouselList[carouselList.length - 1];
      const endData = carouselList[0];
      const list = [startData, ...carouselList, endData];
      setCurrList(list);
    }
  }, [carouselList]);

  useEffect(() => {
    const handleTransitionEnd = () => {
      if (currIndex === 0) {
        carouselRef.current.style.transition = 'none';
        setCurrIndex(carouselList.length);
        carouselRef.current.style.transform = `translateX(-${carouselList.length * 100}%)`;
      } else if (currIndex === carouselList.length + 1) {
        carouselRef.current.style.transition = 'none';
        setCurrIndex(1);
        carouselRef.current.style.transform = `translateX(-100%)`;
      }
    };

    if (carouselRef.current) {
      carouselRef.current.style.transition = 'transform 0.5s ease-in-out';
      carouselRef.current.style.transform = `translateX(-${currIndex * 100}%)`;
      carouselRef.current.addEventListener('transitionend', handleTransitionEnd);
    }

    return () => {
      if (carouselRef.current) {
        carouselRef.current.removeEventListener('transitionend', handleTransitionEnd);
      }
    };
  }, [currIndex, carouselList.length]);

  const handleSwipe = (direction) => {
    setCurrIndex((prev) => prev + direction);
  };

  const handleTouchEvents = (startX) => {
    const move = (e) => {
      const touchMoveX = e.touches[0].clientX;
      const moveX = startX - touchMoveX;
      const movePercent = (moveX / window.innerWidth) * 100;
      carouselRef.current.style.transform = `translateX(calc(-${currIndex * 100}% - ${movePercent}%))`;
    };

    const end = (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const threshold = window.innerWidth / 4;
      if (startX - touchEndX > threshold) {
        handleSwipe(1);
      } else if (touchEndX - startX > threshold) {
        handleSwipe(-1);
      }
      document.removeEventListener('touchmove', move);
      document.removeEventListener('touchend', end);
    };

    document.addEventListener('touchmove', move);
    document.addEventListener('touchend', end);
  };

  const handleTouchStart = (e) => {
    const startX = e.touches[0].clientX;
    handleTouchEvents(startX);
  };

  return (
    <Container>
      <CarouselWrapper onTouchStart={handleTouchStart}>
        <CarouselList ref={carouselRef}>
          {currList.map((item, idx) => (
            <CarouselItem key={`${item.image}-${idx}`}>
              <img src={item.image} alt="carousel-img" />
              <p>{item.text}</p>
            </CarouselItem>
          ))}
        </CarouselList>
      </CarouselWrapper>
    </Container>
  );
};

export default Carousel;

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const CarouselWrapper = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden;
`;

const CarouselList = styled.ul`
  display: flex;
  width: 100%;
`;

const CarouselItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex: none;
  width: 100%;
  height: 186px;
  overflow: hidden;
  border-radius: 20px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
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
    bottom: 10px;
    left: 10px;
    color: white;
    padding: 5px 10px;
    border-radius: 5px;
    ${({ theme }) => theme.fonts.Title6}
    z-index: 2;
  }
`;
