function CurationsGrid({ curations = [], isMyPage }) {
  return (
    <div className="curations-grid">
      {curations.length === 0 ? (
        <p>큐레이션이 없습니다.</p> // ✅ 큐레이션이 없을 때 메시지 표시
      ) : (
        curations
          .filter((curation) => isMyPage || !curation.private) // 🔥 비공개 필터링
          .map((curation) => (
            <div key={curation.id} className="curation-item">
              <img src={curation.image} alt={curation.title} />
              <p>{curation.title}</p>
              {curation.private && isMyPage && <span className="lock-icon">🔒</span>}
            </div>
          ))
      )}
    </div>
  );
}

export default CurationsGrid;
