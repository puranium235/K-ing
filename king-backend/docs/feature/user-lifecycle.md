# 유저 라이프사이클 (플로우 2)

## 개요

OAuth2 로그인 이후 유저의 가입 → 활동 → 탈퇴까지의 라이프사이클을 관리한다.

## 유저 상태 전이

```
OAuth2 로그인 → ROLE_PENDING → signup() → ROLE_REGISTERED → deleteUser() → ROLE_DELETED (soft delete)
```

- `ROLE_PENDING`: OAuth2 로그인은 완료했지만 닉네임/언어 설정을 아직 하지 않은 상태
- `ROLE_REGISTERED`: 가입이 완료되어 서비스 이용 가능한 상태
- `ROLE_DELETED`: 탈퇴 처리된 상태 (DB에서 물리 삭제되지 않고 status만 변경, `@SQLDelete`)

## API 목록

### 1. 회원가입 — `POST /api/user/signup`

**진입 조건**: `ROLE_PENDING` 상태의 유저만 가능 (OAuth2 로그인 직후)

**요청**: `SignUpRequestDTO { nickname, language }`

**처리 흐름**:
1. 닉네임 유효성 검증 (`UserUtil.isValidNickname` — null/빈값/50자 초과 체크)
2. 닉네임 중복 검증 (`userRepository.findByNickname`)
3. 언어 코드 유효성 검증 (`UserUtil.isValidLanguage` — ko/en/ja/zh)
4. SecurityContext에서 현재 유저 ID 추출
5. `ROLE_PENDING` 상태의 유저 엔티티 조회
6. 닉네임, 언어, createdAt, contentAlarmOn(true), status(`ROLE_REGISTERED`) 설정 후 저장
7. `ROLE_REGISTERED` 역할로 새 토큰 쌍 발급

**응답**: `SignUpResponseDTO { userId, email, nickname, imageUrl, language }` + 토큰

### 2. 닉네임 중복 검사 — `GET /api/user/nickname?nickname={nickname}`

**처리 흐름**:
1. 닉네임 유효성 검증
2. trim 후 DB 중복 조회
3. 중복 시 `DUPLICATED_NICKNAME` (409), 사용 가능 시 닉네임 반환

**응답**: `NicknameResponseDTO { nickname }`

### 3. 프로필 조회 — `GET /api/user/{userId}`

**처리 흐름**:
1. userId를 Long으로 파싱 (실패 시 `USER_NOT_FOUND`)
2. `ROLE_REGISTERED` 상태의 유저 조회
3. SecurityContext에서 요청자 ID 추출
4. 본인 프로필 → `fromSelfEntity()` (language, contentAlarmOn 포함)
5. 타인 프로필 → `fromEntity()` (language, contentAlarmOn 미포함)

**응답**: `UserProfileResponseDTO { userId, email, nickname, imageUrl, description, contentAlarmOn?, language? }`

### 4. 프로필 수정 — `PATCH /api/user` (multipart/form-data)

**요청**: `PatchUserRequestDTO { nickname?, description?, contentAlarmOn?, language? }` + `imageFile?`

**처리 흐름**:
1. SecurityContext에서 현재 유저 ID 추출
2. `ROLE_REGISTERED` 상태의 유저 조회
3. 각 필드가 null이 아닌 경우에만 검증 후 업데이트 (partial update)
   - nickname: 유효성 + 중복 검사 (자기 자신 닉네임은 허용)
   - language: 유효성 검사
   - description: 150자 이하 검증
   - contentAlarmOn: 그대로 설정
4. imageFile이 있으면 S3 업로드 후 URL 설정
5. 저장 후 새 토큰 쌍 발급

**응답**: `UserProfileResponseDTO` (self 기준) + 토큰

### 5. 회원 탈퇴 — `DELETE /api/user`

**처리 흐름**:
1. SecurityContext에서 현재 유저 ID 추출
2. `ROLE_REGISTERED` 상태의 유저 조회
3. `userRepository.delete()` → `@SQLDelete`에 의해 status를 `ROLE_DELETED`로 변경 (soft delete)
4. Redis에서 refreshToken 삭제
5. Controller에서 refreshToken 쿠키를 maxAge=0으로 만료 처리

**응답**: 204 No Content + 만료된 refreshToken 쿠키

## 주요 엔티티/DTO 구조

### User 엔티티
- PK: `id` (auto increment)
- OAuth 식별자: `googleId`, `lineId`
- 프로필: `email`, `nickname`(unique), `imageUrl`, `description`
- 설정: `language`, `contentAlarmOn`
- 상태: `status` (ROLE_PENDING / ROLE_REGISTERED / ROLE_DELETED)
- `@SQLDelete`: delete 호출 시 status를 ROLE_DELETED로 변경하는 soft delete

### UserUtil 검증 규칙
- 닉네임: not null, not blank(trim), 50자 이하
- 언어: ko / en / ja / zh 중 하나
- 소개글: 150자 이하
