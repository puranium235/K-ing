# 리뷰 TODO — 추후 개선 작업

## 1. Bean Validation 도입 (수동 검증 → 어노테이션 기반)

### 현재 상태

서비스 레이어에서 수동 `if` 검증 + `ValidationUtil` 유틸 호출:

```java
// CurationService.postCuration(), putCuration()
if (!ValidationUtil.checkNotNullAndLengthLimit(requestDTO.getTitle(), 50)
        || !ValidationUtil.checkNotNullAndLengthLimit(requestDTO.getDescription(), 1000)
        || requestDTO.getPlaceIds() == null || requestDTO.getPlaceIds().isEmpty()) {
    throw new CustomException(CurationErrorCode.INVALID_VALUE);
}
```

CurationDraftService, PostService 등에서도 유사한 수동 검증 패턴이 반복.

### 개선 방향

**JSR 380 Bean Validation** (`@Valid` + 어노테이션)으로 전환:

```java
// DTO에 어노테이션
@NotBlank @Size(max = 50) String title;
@NotBlank @Size(max = 1000) String description;
@NotEmpty List<Long> placeIds;

// Controller에 @Valid
@PostMapping(...)
public ResponseEntity<...> postCurations(
        @Valid @RequestPart("curation") CurationRequestDTO requestDTO, ...)
```

### 필요 작업

1. `spring-boot-starter-validation` 의존성 확인 (Spring Boot 3.x에 포함 여부)
2. `GlobalExceptionHandler`에 `MethodArgumentNotValidException` 핸들러 추가 — 현재 `ApiResponse` 형식과 통일
3. 대상 DTO 목록:
   - `CurationRequestDTO` — title(50자), description(1000자), placeIds(비어있지 않음)
   - `PostUploadRequestDto` — content 등
   - `CommentUploadRequestDto` — content(빈값 체크)
   - `SignUpRequestDTO` — nickname, language
   - `PatchUserRequestDTO` — nickname(선택), language(선택), description(150자)
4. 임시저장 DTO(`PostDraftRequestDto`, `CurationRequestDTO` 재사용)는 필드가 nullable이므로 별도 검증 그룹(`@Validated(Draft.class)`) 또는 별도 DTO 필요
5. Service에서 수동 검증 코드 제거, `ValidationUtil` 사용처 정리

### 주의사항

- 프로젝트 전체 DTO에 일관성 있게 적용해야 함 (일부만 적용하면 혼란)
- 에러 응답 형식이 `CustomException` 기반 `ApiResponse`와 동일해야 프론트 호환성 유지

## 2. Place imageUrl 마이그레이션 (이슈 2 후속)

`review-curation-flow.md` 이슈 2 참고. 배치 마이그레이션 + 데이터 유입 시점 변환 필요.

## 3. `curation_list_item` 테이블 unique constraint 추가

### 현재 상태

`curation_list_item` 테이블에 `(curation_list_id, place_id)` 복합 unique constraint가 없음. 동일 큐레이션에 같은 장소가 중복 저장되는 것을 어플리케이션 레벨(`HashSet` 검사)에서만 막고 있음.

### 개선 방향

`CurationListItem` 엔티티에 `@Table` unique constraint 추가:

```java
@Entity
@Table(name = "curation_list_item", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"curation_list_id", "place_id"})
})
public class CurationListItem { ... }
```

- 어플리케이션 검증이 놓치는 경우(버그, 직접 DB 조작 등)에도 DB가 최종 방어선 역할
- 기존 데이터에 중복이 없는지 확인 후 적용 필요
- `DataIntegrityViolationException` 핸들링 추가 고려

## 4. 프로덕션 로깅 전략 정리

### 현재 상태

- `CurationService.getCurations()`에서 매 조회마다 `log.info("{}, {}", curationList, userBookmark)` — 디버그 목적 로그가 info 레벨로 출력 (삭제 완료)
- 프로젝트 전반에서 로깅 레벨/용도 기준이 통일되어 있지 않음

### 개선 방향

1. **로깅 레벨 기준 통일**
   - `ERROR` — 예외 발생, 복구 불가능한 상황
   - `WARN` — 복구 가능하지만 주의가 필요한 상황 (예: 캐시 미스, 외부 API 지연)
   - `INFO` — 비즈니스 이벤트 (예: 유저 가입, 큐레이션 생성/삭제, 결제 등)
   - `DEBUG` — 개발/디버깅 용도 (요청 파라미터, 쿼리 결과 등)
2. **프로덕션 환경에서 `DEBUG` 레벨 비활성화** — `application.yml`에서 패키지별 로깅 레벨 설정
3. **`toString()` 미정의 엔티티 로깅 시 주의** — 객체 해시값만 출력되어 무의미, 필요 시 ID만 로깅
4. **반복 호출 경로(목록 조회 등)에서의 info 로그 지양** — 로그 볼륨 폭증 방지
