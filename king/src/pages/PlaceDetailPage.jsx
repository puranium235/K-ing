import React from "react";
import { useParams } from "react-router-dom";

const PlaceDetailPage = () => {
  const { placeId } = useParams();
  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <p>Place ID: {placeId}</p>
      <header style={{ display: "flex", alignItems: "center", paddingBottom: "10px" }}>
        <button style={{ border: "none", background: "none", fontSize: "16px", cursor: "pointer" }}>
          &lt;
        </button>
        <h1 style={{ margin: "0 auto", fontSize: "18px", fontWeight: "bold" }}>석병1리 방파제</h1>
      </header>

      <img
        src="https://via.placeholder.com/600x300" // Replace with your image URL
        alt="방파제"
        style={{ width: "100%", borderRadius: "10px" }}
      />

      <div style={{ marginTop: "20px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "5px" }}>
          갯마을 차차차 드라마
        </h2>
        <p style={{ fontSize: "14px", color: "#555" }}>신민아가 김선호에게 사랑 고백했던 방파제</p>
      </div>

      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <button
          style={{
            flex: 1,
            padding: "10px 0",
            backgroundColor: "#007BFF",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          길찾기
        </button>
        <button
          style={{
            flex: 1,
            padding: "10px 0",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          공유
        </button>
      </div>

      <div style={{ marginTop: "20px", fontSize: "14px" }}>
        <h3
          style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "10px", color: "#28a745" }}
        >
          연중무휴
        </h3>
        <p>
          <strong>주소:</strong> 경상북도 포항시 남구 구룡포읍 석병리 745-2
        </p>
        <p>
          <strong>운영 시간:</strong> 매일 00시 - 24시
        </p>
        <p>
          <strong>문의:</strong> 054-270-6561
        </p>
        <p>
          <strong>등록일:</strong> 2022-11-18
        </p>
      </div>

      <button
        style={{
          marginTop: "30px",
          padding: "10px",
          backgroundColor: "#00aaff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          width: "100%",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        다른 팬의 인증샷이 궁금하다면?
      </button>
    </div>
  );
};

export default PlaceDetailPage;
