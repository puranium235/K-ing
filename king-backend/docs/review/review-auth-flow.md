# 플로우 1: 인증 — 로직 복기 & 피드백

## 전체 흐름

```
[사용자] → OAuth2 로그인 요청
         ↓
[Spring Security] → 구글: OAuth2UserService / 라인: CustomOidcUserService
         ↓ (DB에 유저 없으면 ROLE_PENDING으로 생성)
[CustomSuccessHandler] → refreshToken 발급 → Redis 저장 → 쿠키 세팅 → 프론트 리다이렉트
         ↓
[프론트] → POST /user/token-refresh (쿠키의 refreshToken으로)
         ↓
[UserController.tokenRefresh()] → refreshToken 검증 → accessToken + 새 refreshToken 발급
         ↓
[이후 모든 요청] → Authorization: Bearer {accessToken}
         ↓
[JWTFilter] → accessToken 파싱 → SecurityContext 세팅
         ↓
[로그아웃] → POST /user/logout → CustomLogoutFilter → Redis 삭제 + 쿠키 초기화
```

---

## 발견된 이슈 & 피드백

### 1. ~~SecurityConfig — CORS `setExposedHeaders` 덮어쓰기 버그~~ (수정 완료)

**파일**: `SecurityConfig.java:112-113`

```java
// Before
configuration.setExposedHeaders(Collections.singletonList("Set-Cookie"));
configuration.setExposedHeaders(Collections.singletonList("Authorization")); // 이전 줄 덮어씀!

// After
configuration.setExposedHeaders(Collections.singletonList("Authorization"));
```

- `Set-Cookie`는 브라우저가 자동 처리하는 헤더로, JS에서 읽을 수 없어 expose 대상이 아님
- `Authorization`만 expose하면 프론트에서 accessToken을 읽을 수 있음
- 불필요한 `Set-Cookie` expose 제거 + 덮어쓰기 제거로 수정 완료

---

### 2. ~~CustomSuccessHandler — 쿠키 MaxAge와 Redis TTL 불일치~~ (수정 완료)

**파일**: `CustomSuccessHandler.java:75`, `UserController.java` (tokenRefresh, signup)

```java
// Before — CustomSuccessHandler
cookie.setMaxAge(60*60*60);  // 하드코딩 216,000초 (60시간)

// Before — UserController (tokenRefresh, signup)
.maxAge(REFRESHTOKEN_EXPIRES_IN)  // 밀리초가 그대로 들어감

// After — 3군데 모두 통일
cookie.setMaxAge((int) (REFRESHTOKEN_EXPIRES_IN / 1000));  // CustomSuccessHandler
.maxAge(REFRESHTOKEN_EXPIRES_IN / 1000)                     // UserController x2
```

- `REFRESHTOKEN_EXPIRES_IN`은 밀리초 단위, 쿠키 `maxAge`는 초 단위 → `/ 1000` 변환
- 하드코딩 제거, 환경변수 기반으로 통일

---

### 3. CustomSuccessHandler — 쿠키에 `Secure` 플래그 미설정

**파일**: `CustomSuccessHandler.java:73-79`

```java
cookie.setHttpOnly(true);
// cookie.setSecure(true); ← 없음
```

프로덕션 HTTPS 환경에서 `Secure` 플래그가 없으면 HTTP로도 쿠키가 전송된다. `tokenRefresh()`의 `ResponseCookie`에서도 `secure(true)` 미설정.

**수정 방향**: 프로덕션 환경에서 `Secure`, `SameSite` 플래그 추가

---

### 4. ~~CustomLogoutFilter — NPE 위험~~ (수정 완료)

**파일**: `CustomLogoutFilter.java:44-45`

```java
// Before
Cookie[] cookies = request.getCookies();
for (Cookie cookie : cookies) {  // cookies가 null이면 NPE!

// After
Cookie[] cookies = request.getCookies();
if (cookies == null) {
    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
    return;
}
for (Cookie cookie : cookies) {
```

- `request.getCookies()` null 체크 추가로 NPE 방지

---

### 5. ~~CustomLogoutFilter — 토큰이 없어도 삭제 실행~~ (수정 완료)

**파일**: `CustomLogoutFilter.java:71-76`

```java
// Before
if (!exist) {
    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
    // return이 없음! → 아래 deleteById가 실행됨
}

// After
if (!exist) {
    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
    return;
}
```

- `return;` 추가로 토큰 미존재 시 불필요한 deleteById 호출 방지

---

### 6. JWTUtil — `validToken()` 이중 호출

**파일**: `JWTUtil.java:39-53`

```java
public String getType(String token) {
    return validToken(token).get("type", String.class);  // validToken 호출
}
```

`JWTFilter`에서 `validToken()` → `getType()` → `getUserId()` → `getRole()` → `getLanguage()` 순으로 호출하면 매번 JWT 파싱을 반복한다 (총 5회).

**수정 방향**: 한 번 파싱한 `Claims`를 반환받아 재사용하도록 변경

---

### 7. OAuth2UserService — `userEntity` NPE 위험

**파일**: `OAuth2UserService.java:29,47-48`

```java
User userEntity = null;
// google이 아닌 registrationId가 오면 if문을 건너뛰고...
oAuth2UserDTO.setName(userEntity.getId().toString());  // NPE!
```

`CustomOidcUserService`에서는 `userEntity == null` 체크 후 예외를 던지지만, `OAuth2UserService`에서는 그 처리가 없다.

**수정 방향**: `if (userEntity == null) throw new CustomException(...)` 추가

---

### 8. tokenRefresh() / signup() — 컨트롤러에 비즈니스 로직 과다

**파일**: `UserController.java:52-93` (tokenRefresh), `UserController.java:96-153` (signup)

토큰 검증, Redis 조회/삭제/저장, JWT 생성이 모두 Controller에 있다.

**수정 방향**: Service 계층으로 비즈니스 로직 분리 (프로젝트의 다른 도메인 패턴과 동일하게)
