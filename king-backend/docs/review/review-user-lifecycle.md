# 플로우 2: 유저 라이프사이클 — 로직 복기 & 피드백

## 전체 흐름

```
[OAuth2 로그인 완료] → ROLE_PENDING 상태로 DB 저장
         ↓
[POST /user/signup] → 닉네임/언어 설정 → ROLE_REGISTERED → 새 토큰 발급
         ↓
[GET /user/nickname?nickname=] → 닉네임 중복 검사 (가입 전 사전 체크)
[GET /user/{userId}]           → 프로필 조회 (본인/타인 분기)
[PATCH /user]                  → 프로필 수정 (partial update) → 새 토큰 발급
         ↓
[DELETE /user] → soft delete (ROLE_DELETED) + Redis 토큰 삭제 + 쿠키 만료
```

---

## 발견된 이슈 & 피드백

### 1. ~~SecurityContext 보일러플레이트 반복~~ (수정 완료)

#### 이전 상태

`UserService` 내에서 3곳이 동일한 코드를 반복:

```java
// getUserById(), deleteUser(), patchUser()
Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
OAuth2UserDTO authUser = (OAuth2UserDTO) authentication.getPrincipal();
Long userId = Long.parseLong(authUser.getName());
```

`signup()`은 패턴이 살짝 다름:

```java
Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
Long userId = Long.parseLong(authentication.getName());  // Principal 캐스팅 없이 직접 getName()
```

프로젝트 전체 반복 현황:

| 도메인 | 파일 | 반복 횟수 |
|--------|------|----------|
| post | PostService | 6회 |
| post | CommentService | 3회 |
| post | LikeService | 2회 |
| post | PostDraftService | 1회 |
| curation | CurationService | 5회 |
| curation | BookmarkService | 2회 |
| curation | CurationDraftService | 1회 |
| favorite | FavoriteService | 3회 |
| content | ContentService | 1회 |
| cast | CastService | 1회 |
| user | UserService | 4회 |
| search | SearchService | 1회 |
| search | CurationSearchService | 1회 |

#### 문제점

- 2~3줄짜리 보일러플레이트가 서비스 전체에 약 30회 반복
- `signup()`만 `authentication.getName()` 직접 호출, 나머지는 `OAuth2UserDTO` 캐스팅 후 `getName()` — 결과는 동일하지만 패턴 불일치
- JWT 파싱 중복과는 별개 — 여기서는 이미 JWTFilter가 파싱한 결과를 SecurityContext에서 꺼내는 것이므로 성능 이슈는 없음. 순수 코드 중복 / 가독성 문제

#### 수정 내용

`SecurityUtil` 신규 생성 (`global/util/SecurityUtil.java`):

```java
public class SecurityUtil {
    public static Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return Long.parseLong(authentication.getName());
    }

    public static OAuth2UserDTO getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (OAuth2UserDTO) authentication.getPrincipal();
    }
}
```

`UserService` 4곳 적용:

```java
// Before (getUserById, deleteUser, patchUser — 각각 3줄)
Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
OAuth2UserDTO authUser = (OAuth2UserDTO) authentication.getPrincipal();
Long userId = Long.parseLong(authUser.getName());

// Before (signup — 2줄)
Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
Long userId = Long.parseLong(authentication.getName());

// After (모두 1줄로 통일)
Long userId = SecurityUtil.getCurrentUserId();
```

- 미사용 import(`OAuth2UserDTO`, `Authentication`, `SecurityContextHolder`) 제거
- 다른 서비스(PostService, CurationService 등)는 해당 플로우 복기 시 적용 예정

---

### 2. ~~`getNicknameDuplication()` — 비즈니스 로직이 Controller에 위치~~ (수정 완료)

#### 이전 상태

```java
// UserController.java
@GetMapping("/nickname")
public ResponseEntity<ApiResponse<NicknameResponseDTO>> getNicknameDuplication(
        @RequestParam(value = "nickname", required = false) String nickname) {
    if (!UserUtil.isValidNickname(nickname)) {
        throw new CustomException(UserErrorCode.INVALID_NICKNAME);
    }
    nickname = nickname.trim();

    userRepository.findByNickname(nickname)
            .ifPresent((user) -> {
                throw new CustomException(UserErrorCode.DUPLICATED_NICKNAME);
            });

    NicknameResponseDTO response = new NicknameResponseDTO();
    response.setNickname(nickname);
    return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(response));
}
```

#### 문제점

- Controller에서 `UserRepository`를 직접 호출하여 Service 레이어를 건너뜀
- 닉네임 검증/trim/중복 조회는 비즈니스 로직인데 Controller에 존재
- 이 메서드 때문에 Controller에 `UserRepository` 의존성이 주입되고 있음

#### 수정 내용

`UserService.checkNicknameDuplication()` 메서드 신규 추가:

```java
// UserService.java
public NicknameResponseDTO checkNicknameDuplication(String nickname) {
    if (!UserUtil.isValidNickname(nickname)) {
        throw new CustomException(UserErrorCode.INVALID_NICKNAME);
    }
    nickname = nickname.trim();

    userRepository.findByNickname(nickname)
            .ifPresent((user) -> {
                throw new CustomException(UserErrorCode.DUPLICATED_NICKNAME);
            });

    NicknameResponseDTO response = new NicknameResponseDTO();
    response.setNickname(nickname);
    return response;
}
```

Controller는 Service 호출 1줄로 정리:

```java
// UserController.java
@GetMapping("/nickname")
public ResponseEntity<ApiResponse<NicknameResponseDTO>> getNicknameDuplication(
        @RequestParam(value = "nickname", required = false) String nickname) {
    return ResponseEntity.ok(ApiResponse.success(userService.checkNicknameDuplication(nickname)));
}
```

- Controller에서 `UserRepository` 의존성 제거
- 미사용 import(`UserErrorCode`, `UserRepository`, `UserUtil`, `CustomException`) 제거

---

### 3. ~~닉네임 검증 로직 3곳 중복~~ (수정 완료)

#### 이전 상태

| 위치 | 유효성 검증 | trim | 중복 조회 |
|------|:---------:|:----:|:---------:|
| `checkNicknameDuplication()` (Service) | O | O | O |
| `signup()` (Service) | O | O | O |
| `patchUser()` (Service) | O | O | O (자기 자신 제외) |

#### 문제점

- 닉네임 유효성 검사 + trim + 중복 체크 조합이 3곳에서 거의 동일하게 반복
- `patchUser()`만 자기 자신 닉네임을 허용하는 분기가 추가되어 있어 약간 다름
- 검증 규칙이 변경되면 3곳을 동시에 수정해야 함

#### 수정 내용

공통 헬퍼 `validateAndTrimNickname()` 추출:

```java
private String validateAndTrimNickname(String nickname, Long excludeUserId) {
    if (!UserUtil.isValidNickname(nickname)) {
        throw new CustomException(UserErrorCode.INVALID_NICKNAME);
    }
    String trimmed = nickname.trim();

    userRepository.findByNickname(trimmed)
            .ifPresent((user) -> {
                if (excludeUserId == null || !user.getId().equals(excludeUserId)) {
                    throw new CustomException(UserErrorCode.DUPLICATED_NICKNAME);
                }
            });

    return trimmed;
}
```

3곳 모두 헬퍼 호출로 교체:

```java
// checkNicknameDuplication(), signup() — 신규 닉네임이므로 제외 대상 없음
String nickname = validateAndTrimNickname(nickname, null);

// patchUser() — 자기 자신 닉네임은 허용
String nickname = validateAndTrimNickname(userRequestDTO.getNickname(), userId);
```

---

### 4. ~~`UserUtil` — NPE 가능성~~ (수정 완료)

#### 이전 상태

```java
public static boolean isValidNickname(String nickname) {
    return nickname != null && !nickname.trim().isEmpty() && nickname.length() <= 50;  // null 체크 있음
}

public static boolean isValidLanguage(String language) {
    return language.matches("^(ko|en|ja|zh)$");  // null 체크 없음
}

public static boolean isValidDescription(String description) {
    return description.length() <= 150;  // null 체크 없음
}
```

#### 문제점

- `isValidNickname()`은 null 체크가 있지만 `isValidLanguage()`와 `isValidDescription()`은 null 체크가 없음
- `language`가 null이면 `language.matches()` 호출 시 NPE 발생
- 현재 호출부에서 null 체크 후 호출하고 있어 실제 NPE 확률은 낮지만, 유틸 메서드 자체가 null-safe하지 않음

#### 수정 내용

```java
// isValidLanguage — null이면 false 반환
public static boolean isValidLanguage(String language) {
    return language != null && language.matches("^(ko|en|ja|zh)$");
}

// isValidDescription — null이면 유효한 것으로 처리 (description은 선택 필드)
public static boolean isValidDescription(String description) {
    return description == null || description.length() <= 150;
}
```

- `isValidLanguage`: `isValidNickname`과 동일한 null 방어 패턴
- `isValidDescription`: description은 선택 필드이므로 null은 유효한 값으로 취급

---

### 5. ~~`UserErrorCode.INVALD_VALUE` — 오타~~ (수정 완료)

#### 이전 상태

```java
INVALD_VALUE(HttpStatus.BAD_REQUEST, "잘못된 값으로 요청을 시도하고 있습니다"),
```

#### 문제점

- `INVALD_VALUE` → `INVALID_VALUE` 오타. 이 코드를 참조하는 곳도 함께 수정 필요

#### 수정 내용

- `UserErrorCode.java`: `INVALD_VALUE` → `INVALID_VALUE`
- `UserService.java`: 참조하는 곳 1곳 함께 수정

---

### 6. ~~`patchUser()` — 변경 없어도 항상 토큰 재발급~~ (수정 완료)

#### 이전 상태

```java
public AuthResult<UserProfileResponseDTO> patchUser(...) {
    // ... 필드 업데이트 ...
    userRepository.save(user);

    return issueTokens(userId.toString(), user.getLanguage(), "ROLE_REGISTERED",
            UserProfileResponseDTO.fromSelfEntity(user));  // 항상 새 토큰 발급
}
```

#### 문제점

- JWT에 `language`가 포함되어 있어 language 변경 시에만 토큰 재발급이 필요
- 닉네임이나 이미지만 변경해도 매번 새 토큰 쌍 발급 + Redis 저장이 실행됨

#### 수정 내용

Service — language 변경 여부를 추적하여 조건부 토큰 발급:

```java
String oldLanguage = user.getLanguage();
// ... 필드 업데이트 ...
userRepository.save(user);

UserProfileResponseDTO responseDTO = UserProfileResponseDTO.fromSelfEntity(user);

boolean languageChanged = !oldLanguage.equals(user.getLanguage());
if (languageChanged) {
    return issueTokens(userId.toString(), user.getLanguage(), "ROLE_REGISTERED", responseDTO);
}
return new AuthResult<>(null, null, 0, responseDTO);
```

Controller — 토큰 유무에 따라 응답 분기:

```java
AuthResult<UserProfileResponseDTO> result = userService.patchUser(patchUserRequestDTO, imageFile);
if (result.getAccessToken() != null) {
    return buildAuthResponse(result, HttpStatus.OK);
}
return ResponseEntity.ok(ApiResponse.success(result.getData()));
```

