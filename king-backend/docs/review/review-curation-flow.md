# 플로우 3: 큐레이션 — 로직 복기 & 피드백

## 전체 흐름

```
[임시저장 (Redis)]
  POST   /curation/draft     → saveDraft()   — Redis JSON + binary 저장
  GET    /curation/draft     → getDraft()    — Redis 조회 + Place 엔티티 매핑
  DELETE /curation/draft     → deleteDraft() — Redis 삭제

[큐레이션 CRUD (MySQL)]
  POST   /curation           → postCuration()     — 생성 + S3 업로드
  PUT    /curation/{id}      → putCuration()      — 전체 교체 (아이템 삭제→재생성)
  DELETE /curation/{id}      → deleteCuration()   — 북마크+아이템+큐레이션 삭제
  GET    /curation/{id}      → getCurationDetail() — 상세 조회 + 번역
  GET    /curation            → getCurations()     — 목록 조회 (커서 페이징)

[북마크]
  POST   /bookmark           → postBookmark()   — 북마크 등록
  DELETE /bookmark           → deleteBookmark() — 북마크 해제
```

---

## 발견된 이슈 & 피드백

### 1. ~~SecurityContext 보일러플레이트 반복 (8곳)~~ (수정 완료)

#### 이전 상태

플로우 2에서 `SecurityUtil`을 만들었지만, 큐레이션 도메인에는 아직 적용되지 않음:

```java
// CurationService — 5곳 (getCurationDetail, getCurations, postCuration, putCuration, deleteCuration)
Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
OAuth2UserDTO authUser = (OAuth2UserDTO) authentication.getPrincipal();
Long userId = Long.parseLong(authUser.getName());

// BookmarkService — 2곳 (postBookmark, deleteBookmark)
Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
OAuth2UserDTO authUser = (OAuth2UserDTO) authentication.getPrincipal();
Long userId = Long.parseLong(authUser.getName());

// CurationDraftService — 자체 private 헬퍼까지 만들어서 사용
private Long getCurrentUserId() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    OAuth2UserDTO user = (OAuth2UserDTO) authentication.getPrincipal();
    return Long.parseLong(user.getName());
}
```

#### 문제점

- `SecurityUtil.getCurrentUserId()` / `SecurityUtil.getCurrentUser()`가 이미 존재하는데 미사용
- `CurationDraftService`는 동일한 로직을 private 메서드로 별도 구현
- language가 필요한 곳(getCurationDetail, getCurations, putCuration)은 `getCurrentUser().getLanguage()` 호출로 대체 가능

#### 수정 내용

- `CurationService` 5곳 → `SecurityUtil.getCurrentUserId()` / `SecurityUtil.getCurrentLanguage()` 적용
- `BookmarkService` 2곳 → `SecurityUtil.getCurrentUserId()` 적용
- `CurationDraftService` — private `getCurrentUserId()` 삭제, `SecurityUtil.getCurrentUserId()` 사용
- 미사용 import 정리 완료

---

### 2. `getCurationDetail()` — 조회 API에서 Place DB 쓰기 (side effect)

#### 배경

원래 Place.imageUrl에는 **Google Photos API 호출 URL** (API key 포함)이 저장되어 있었다.

**문제 1 — 비용**: 프론트에서 이미지를 표시할 때마다 Google Photos API가 호출되어 API 비용이 과도하게 발생
**문제 2 — 보안**: API key가 URL에 포함되어 프론트에 그대로 노출

이를 해결하기 위해 **API URL → 리다이렉트된 최종 URL**로 DB를 마이그레이션하려 했으나, 운영 중에 점진적으로 처리하려다 보니 "조회할 때 변환 + DB 저장"이라는 현재 코드가 만들어졌다.

#### 이전 상태

```java
// CurationService.getCurationDetail() — @Transactional (readOnly 아님)
List<Place> places = curationListItemRepository.findByCurationListId(curationListId)
        .stream()
        .map(CurationListItem::getPlace)
        .peek((place) -> {
            String imageUrl = place.getImageUrl() == null
                    ? "https://d1qaf0hhk6y1ff.cloudfront.net/uploads/default.jpg"
                    : googlePhotoService.getRedirectedImageUrl(place.getImageUrl());
            place.setImageUrl(imageUrl);
            placeRepository.save(place);  // 조회 API인데 DB에 쓰기
        }).toList();
```

동일한 패턴이 `SearchService.search()`에도 2곳 존재 (카테고리별 검색 + 일반 검색).

#### 문제점

- **조회 API가 DB를 수정함** — 읽기 전용이어야 할 API에서 Place 엔티티를 변경하고 save
- `@Transactional`이 readOnly가 아님 (이 save 때문에 쓰기 트랜잭션 사용)
- `peek()` 안에서 부수효과(save) — Stream API에서 `peek()`은 디버깅 용도로 권장되는 메서드
- 동시에 여러 유저가 같은 Place를 조회하면 불필요한 중복 UPDATE 발생
- 리다이렉트된 URL이 일시적/만료 가능하다면 DB에 영구 저장하는 것이 오히려 문제가 될 수 있음

#### 해결 방안 비교

| 방안 | 설명 | 장점 | 단점 |
|------|------|------|------|
| **A. 일괄 배치 마이그레이션** | 1회성 스크립트로 모든 Place의 API URL을 리다이렉트 URL로 변환. 완료 후 조회 API에서 변환 로직 제거 | 깔끔한 분리, 조회 API가 순수 읽기로 복원 | 1회성 작업 필요, 새로 유입되는 데이터는 별도 처리 |
| **B. 데이터 유입 시점 변환** | Place 생성/갱신 시점(TMDB/공공데이터 스케줄러)에서 리다이렉트 URL로 변환 후 저장 | 근본적 해결, 조회 시 변환 불필요 | 스케줄러 코드 수정 필요 |
| **C. S3 재업로드** | Google Photos 이미지를 S3/CDN에 재업로드, S3 URL을 DB에 저장 | Google API 의존성 완전 제거, URL 만료 문제 없음 | S3 스토리지 비용, 저작권 이슈 확인 필요 |
| **D. 백엔드 프록시 엔드포인트** | 프론트가 `/api/place/{id}/image`를 호출하면 백엔드가 내부적으로 Google API 호출 후 이미지 전달 | API key 노출 방지, DB 변경 불필요 | 요청마다 백엔드 부하, API 비용은 그대로 |
| **E. Redis 캐시 + 조회 시 변환** | 리다이렉트 URL을 Redis에 캐싱, 조회 시 캐시 히트면 API 호출 스킵. DB는 수정하지 않음 | DB 쓰기 제거, API 호출 최소화 | 캐시 만료 관리 필요, 근본 해결은 아님 |

#### 권장 조합

**A + B** (배치 마이그레이션 + 유입 시점 변환)

1. **B** — 새로 들어오는 Place 데이터는 저장 시점에 리다이렉트 URL로 변환
2. **A** — 기존 데이터는 1회성 배치로 일괄 변환
3. 완료 후 조회 API에서 `peek` + `placeRepository.save()` 제거, `@Transactional(readOnly = true)` 적용

이미지 URL 만료가 걱정된다면 **C** (S3 재업로드)가 가장 안정적이지만, 현재 CloudFront CDN을 이미 사용 중이므로 S3 파이프라인에 얹기 쉬움.

#### 현재 상태

미수정 — 배치 마이그레이션/스케줄러 수정이 선행되어야 하므로, 이 이슈는 방향만 확정하고 별도 작업으로 진행 예정.

---

### 3. ~~`postCuration()` — `placeIds` NPE 가능~~ (수정 완료)

#### 이전 상태

```java
if (!ValidationUtil.checkNotNullAndLengthLimit(requestDTO.getTitle(), 50)
        || !ValidationUtil.checkNotNullAndLengthLimit(requestDTO.getDescription(), 1000)
        || requestDTO.getPlaceIds().isEmpty()) {  // getPlaceIds()가 null이면 NPE
    throw new CustomException(CurationErrorCode.INVALID_VALUE);
}
```

#### 문제점

- `CurationRequestDTO.placeIds`는 nullable (`List<Long> placeIds;` — 기본값 없음)
- `getPlaceIds()`가 null을 반환하면 `.isEmpty()` 호출 시 NPE 발생

#### 수정 내용

```java
// postCuration(), putCuration() 모두 수정
requestDTO.getPlaceIds() == null || requestDTO.getPlaceIds().isEmpty()
```

---

### 4. ~~`postCuration()`/`putCuration()` — 입력 중복 검사를 매번 DB 조회로 수행~~ (수정 완료)

#### 이전 상태

```java
// postCuration() — 새 큐레이션이라 아이템 0개
// putCuration() — deleteAll 직후라 아이템 0개
for (Long placeId : requestDTO.getPlaceIds()) {
    Place place = placeRepository.findById(placeId)...;

    curationListItemRepository.findByCurationListAndPlace(curation, place)  // SELECT 쿼리
            .ifPresent((item) -> {
                throw new CustomException(CurationErrorCode.DUPLICATED_PLACE);
            });

    curationListItemRepository.save(curationListItem);
}
```

#### 의도

입력 placeIds 배열 내 중복 감지 (예: `[1, 2, 1]`). 루프에서 첫 번째 1을 save한 후, 두 번째 1이 올 때 `findByCurationListAndPlace`가 찾아서 예외를 던지는 구조.

#### 문제점

- 의도는 입력 중복 감지인데, **매번 DB SELECT 쿼리를 실행**하여 확인 — placeIds 개수만큼 불필요한 DB 조회
- `postCuration()`은 새 큐레이션, `putCuration()`은 deleteAll 직후이므로, 입력 중복이 아닌 한 DB에서 찾을 수 있는 값이 없음
- 단일 트랜잭션 + 단일 유저 요청이므로 동시성 문제도 없음 — 입력 검증만으로 충분
- 현재 `curation_list_item` 테이블에 `(curation_list_id, place_id)` unique constraint가 없어 DB 레벨 방어도 부재

#### 수정 내용

입력 중복을 `HashSet`으로 검사, DB 조회 제거:

```java
// postCuration(), putCuration() 동일하게 적용
List<Long> placeIds = requestDTO.getPlaceIds();
if (placeIds.size() != new HashSet<>(placeIds).size()) {
    throw new CustomException(CurationErrorCode.DUPLICATED_PLACE);
}

for (Long placeId : placeIds) {
    Place place = placeRepository.findById(placeId)
            .orElseThrow(() -> new CustomException(PlaceErrorCode.PLACE_NOT_FOUND));

    CurationListItem curationListItem = new CurationListItem();
    curationListItem.setCurationList(curation);
    curationListItem.setPlace(place);
    curationListItemRepository.save(curationListItem);
}
```

- placeIds N개 기준: 수정 전 N회 SELECT → 수정 후 0회 SELECT
- `curation_list_item` 테이블에 unique constraint 추가는 TODO로 분리

---

### 5. ~~임시저장(Draft) — Redis TTL 미설정~~ (수정 완료)

#### 이전 상태

```java
// CurationDraftService.saveDraft()
redisUtil.setJsonValue(draftKey, reqDto);       // TTL 없이 저장
redisUtil.setBinaryValue(imageKey, imageBytes);  // TTL 없이 저장
```

#### 문제점

- 임시저장 데이터에 TTL(만료시간)이 설정되지 않아 Redis에 영구 저장됨
- 유저가 임시저장 후 삭제하지 않으면 데이터가 계속 남음
- 이미지 바이너리(최대 5MB)가 Redis에 영구 보관되면 메모리 부담

#### 수정 내용

`RedisUtil`에 TTL 오버로드 메서드 추가 + `CurationDraftService.saveDraft()`에 7일 TTL 적용:

```java
// RedisUtil — setJsonValue, setBinaryValue TTL 오버로드 추가
public <T> void setJsonValue(String key, T data, long time, TimeUnit timeUnit) { ... }
public void setBinaryValue(String key, byte[] data, long time, TimeUnit timeUnit) { ... }

// CurationDraftService.saveDraft()
redisUtil.setJsonValue(draftKey, reqDto, 7, TimeUnit.DAYS);
redisUtil.setBinaryValue(imageKey, imageBytes, 7, TimeUnit.DAYS);
```

---

### 6. ~~`CurationDraftService` — 미사용 import~~ (수정 완료)

#### 이전 상태

```java
import com.king.backend.domain.post.errorcode.PostErrorCode;  // 사용하지 않음
```

#### 문제점

- `PostErrorCode`는 파일 어디에서도 참조되지 않음
- 다른 도메인의 에러코드를 import하고 있어 혼란 유발

#### 수정 내용

`import com.king.backend.domain.post.errorcode.PostErrorCode;` 라인 삭제.

---

### 7. ~~`getCurations()` — 프로덕션 디버그 로그~~ (수정 완료)

#### 이전 상태

```java
// CurationService.getCurations()
log.info("{}, {}", curationList, userBookmark);
```

#### 문제점

- 목록 조회마다 각 큐레이션에 대해 `log.info` 출력
- 프로덕션 환경에서 불필요한 로그 노이즈
- `CurationList.toString()`이 정의되지 않았다면 객체 해시값만 출력되어 무의미

#### 수정 내용

`log.info("{}, {}", curationList, userBookmark);` 라인 삭제.

---

### 8. ~~`@CreatedDate` 어노테이션 — 실질적 미사용~~ (수정 완료)

#### 이전 상태

```java
// CurationList.java
@CreatedDate
@Column(nullable = false, updatable = false)
private OffsetDateTime createdAt;

// CurationListBookmark.java
@CreatedDate
private LocalDateTime createdAt;
```

실제로는 수동 세팅:

```java
// CurationService.postCuration()
curation.setCreatedAt(OffsetDateTime.now());

// BookmarkService.postBookmark()
curationListBookmark.setCreatedAt(LocalDateTime.now());
```

#### 문제점

- `@CreatedDate`는 `@EnableJpaAuditing` + `@EntityListeners(AuditingEntityListener.class)` 조합이 있어야 동작
- `CurationList`의 `@EntityListeners`는 `CurationListListener`(Elasticsearch 동기화)이지, `AuditingEntityListener`가 아님
- `CurationListBookmark`는 `@EntityListeners` 자체가 없음
- 어노테이션이 있지만 실제로는 작동하지 않고, 코드에서 수동으로 시간을 세팅하고 있음

#### 수정 내용 — JPA Auditing 활성화

1. `JpaAuditingConfig` 생성 — `global/config/JpaAuditingConfig.java` (`@EnableJpaAuditing`)
2. `CurationList` — `@EntityListeners`에 `AuditingEntityListener.class` 추가 (기존 `CurationListListener`와 병기)
3. `CurationListBookmark` — `@EntityListeners(AuditingEntityListener.class)` 추가
4. `User` — `@EntityListeners(AuditingEntityListener.class)` 추가 (같은 패턴이었으므로 함께 적용)
5. 수동 `setCreatedAt()` 호출 제거 — `CurationService.postCuration()`, `BookmarkService.postBookmark()`, `UserService.signup()`
6. 미사용 import 정리 — `OffsetDateTime` (CurationService), `LocalDateTime` (BookmarkService)

---

### 9. ~~`postCuration()` — 생성 응답 HTTP 상태 코드~~ (수정 완료)

#### 이전 상태

```java
// CurationController.java
@PostMapping(...)
public ResponseEntity<ApiResponse<CurationDetailResponseDTO>> postCurations(...) {
    return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(curationService.postCuration(...)));
}
```

#### 문제점

- 리소스 생성 API인데 HTTP 200 OK를 반환
- RESTful 관례상 생성은 201 Created가 적절
- 같은 프로젝트의 `CurationDraftController.postCuration()`은 201을, `BookmarkController.postBookmark()`도 201을 반환하고 있어 불일치

#### 수정 내용

```java
// CurationController.postCurations()
return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(...));
```
