# 큐레이션 플로우 (플로우 3)

## 개요

유저가 촬영지(Place)를 묶어 큐레이션 리스트를 작성하고, 다른 유저가 조회/북마크할 수 있는 기능이다. Redis 기반 임시저장, S3 이미지 업로드, Google Translate 번역, Elasticsearch 동기화를 포함한다.

## 전체 흐름

```
[임시저장 (Redis)]
  POST   /curation/draft     → 큐레이션 임시저장 생성 (JSON + 이미지 바이너리)
  GET    /curation/draft     → 임시저장 조회
  DELETE /curation/draft     → 임시저장 삭제

[큐레이션 CRUD (MySQL + S3)]
  POST   /curation           → 큐레이션 생성 (multipart: JSON + imageFile)
  GET    /curation/{id}      → 큐레이션 상세 조회 (번역 포함)
  GET    /curation            → 큐레이션 목록 조회 (커서 기반 페이징)
  GET    /curation/id?title=  → 큐레이션 ID 조회 (제목 기반, Levenshtein 유사도)
  PUT    /curation/{id}      → 큐레이션 수정 (전체 교체)
  DELETE /curation/{id}      → 큐레이션 삭제

[북마크]
  POST   /bookmark           → 북마크 등록
  DELETE /bookmark           → 북마크 해제
```

## 엔티티 구조

### CurationList (큐레이션)
- `id` (PK, auto increment)
- `title` (제목, 50자 제한)
- `description` (설명, 1000자 제한)
- `imageUrl` (S3 업로드 이미지 URL)
- `isPublic` (공개 여부, 기본 true)
- `createdAt` (생성 시간, OffsetDateTime)
- `writer` (ManyToOne → User)
- `@EntityListeners(CurationListListener.class)` → Elasticsearch 동기화

### CurationListItem (큐레이션 아이템)
- `id` (PK)
- `curationList` (ManyToOne → CurationList)
- `place` (ManyToOne → Place)

### CurationListBookmark (북마크)
- `id` (PK)
- `curationList` (ManyToOne → CurationList)
- `user` (ManyToOne → User)
- `createdAt` (LocalDateTime)

## API 상세

### 1. 임시저장 생성 — `POST /curation/draft`

**요청**: multipart/form-data — `curation` (CurationRequestDTO JSON) + `imageFile` (선택)

**처리 흐름**:
1. title 50자, description 1000자 초과 검증
2. placeIds가 있으면 각 place 존재 여부 검증
3. Redis에 JSON 저장 (key: `curation:draft:user{userId}`)
4. 이미지가 있으면 5MB 초과 검증 후 Redis에 바이너리 저장 (key: `curation:draft:user{userId}:image`)
5. 이미지가 없으면 기존 이미지 바이너리 삭제

**응답**: 201 Created

### 2. 임시저장 조회 — `GET /curation/draft`

**처리 흐름**:
1. Redis에서 JSON + 바이너리 이미지 조회
2. 둘 다 null이면 204 No Content
3. placeIds로 Place 엔티티를 개별 조회하여 PlaceDTO 변환

**응답**: `CurationDraftResponseDTO { title, description, isPublic, imageData(byte[]), places[] }`

### 3. 임시저장 삭제 — `DELETE /curation/draft`

**처리 흐름**: Redis에서 JSON key + image key 삭제

**응답**: 204 No Content

### 4. 큐레이션 생성 — `POST /curation`

**요청**: multipart/form-data — `curation` (CurationRequestDTO) + `imageFile` (필수)

**처리 흐름**:
1. SecurityContext에서 유저 ID 추출, `ROLE_REGISTERED` 상태 확인
2. 제목(50자), 설명(1000자), 장소 목록 비어있지 않음 검증 (`ValidationUtil`)
3. S3에 이미지 업로드
4. CurationList 엔티티 생성 및 저장
5. placeIds 순회: place 존재 검증 → 중복 체크 → CurationListItem 생성 및 개별 저장
6. 북마크 여부 조회
7. `CurationDetailResponseDTO` 반환 (번역 없음 — 생성 직후이므로)

**응답**: 200 OK + CurationDetailResponseDTO

### 5. 큐레이션 수정 — `PUT /curation/{curationId}`

**요청**: multipart/form-data — `curation` (CurationRequestDTO) + `imageFile` (선택)

**처리 흐름**:
1. SecurityContext에서 유저 확인 + 큐레이션 소유자 검증
2. 제목/설명/장소 검증
3. 이미지가 있으면 S3 재업로드, 없으면 기존 이미지 유지
4. 큐레이션 필드 업데이트 후 저장
5. **기존 아이템 전체 삭제 → 새로 추가** (PUT = 전체 교체)
6. 번역 캐시 삭제 (Redis key: `curation:{id}:{language}:title/description`)
7. `CurationDetailResponseDTO` 반환

**응답**: 200 OK + CurationDetailResponseDTO

### 6. 큐레이션 삭제 — `DELETE /curation/{curationId}`

**처리 흐름**:
1. SecurityContext에서 유저 확인 + 큐레이션 소유자 검증
2. 북마크 전체 삭제 → 아이템 전체 삭제 → 큐레이션 삭제
3. `CurationListListener` → Elasticsearch에서도 삭제

**응답**: 204 No Content

### 7. 큐레이션 상세 조회 — `GET /curation/{curationListId}`

**처리 흐름**:
1. SecurityContext에서 유저 ID, language 추출
2. 큐레이션 존재 확인 + 비공개 큐레이션은 작성자만 접근 가능
3. 북마크 여부 조회
4. 아이템 목록 조회 → Place의 imageUrl이 null이면 기본 이미지, 아니면 Google Photo redirect URL로 교체 후 **DB에 저장**
5. `CurationDetailResponseDTO` 변환
6. title, description을 유저 language로 번역 (Redis 캐싱 + Google Translate)

**응답**: 200 OK + CurationDetailResponseDTO (번역된 title/description)

### 8. 큐레이션 목록 조회 — `GET /curation`

**요청 파라미터**: `CurationQueryRequestDTO { userId, size(기본10), cursor, bookmarked }`

**처리 흐름**:
- `bookmarked=true`: 내 북마크 목록 조회 (CurationListBookmarkRepository)
- `bookmarked=false/null`: 큐레이션 목록 조회 (CurationListRepository)
  - `userId` 지정 시 해당 유저의 큐레이션만
  - 비공개 큐레이션은 본인 것만 노출
- 커서 기반 페이징 (ID 내림차순)
- title을 유저 language로 번역

**응답**: `CurationListResponseDTO { curations[], nextCursor }`

### 9. 큐레이션 ID 조회 — `GET /curation/id?title={title}`

**처리 흐름**:
1. 입력 title로 DB LIKE 검색 (공백 제거)
2. 결과가 없으면 CURATION_NOT_FOUND
3. Levenshtein Distance로 가장 유사한 큐레이션 선택 (동점이면 최신 우선)

**용도**: AI 챗봇이 큐레이션 이름으로 ID를 조회할 때 사용

### 10. 북마크 등록 — `POST /bookmark`

**요청**: `BookmarkRequestDTO { curationId }`

**처리 흐름**:
1. SecurityContext에서 유저 확인
2. 큐레이션 존재 + 접근 권한 확인 (비공개면 작성자만)
3. 이미 북마크된 경우 DUPLICATED_BOOKMARK (409)
4. CurationListBookmark 생성 후 저장

**응답**: 201 Created

### 11. 북마크 해제 — `DELETE /bookmark`

**요청**: `BookmarkRequestDTO { curationId }`

**처리 흐름**:
1. SecurityContext에서 유저 확인
2. 큐레이션 존재 + 접근 권한 확인
3. 북마크 조회, 없으면 NOT_BOOKMARKED (400)
4. 북마크 삭제

**응답**: 204 No Content

## 주요 의존 관계

- **S3Service**: 큐레이션 이미지 업로드 (생성/수정)
- **TranslateService**: 제목/설명 번역 (조회 시, Redis 캐싱)
- **GooglePhotoService**: Place 이미지 URL redirect 처리 (상세 조회)
- **CurationListListener → SyncService**: CurationList 변경 시 Elasticsearch 동기화
- **RedisUtil**: 임시저장 (JSON + binary), 번역 캐시
- **CursorUtil**: 커서 기반 페이징 인코딩/디코딩
- **ValidationUtil**: 필수값 + 글자수 제한 검증
