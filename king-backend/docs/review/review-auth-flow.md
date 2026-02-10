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

#### 이전 상태

`setExposedHeaders`를 두 번 호출하여 첫 번째 값(`Set-Cookie`)이 두 번째 값(`Authorization`)으로 덮어써지고 있었다.

```java
configuration.setExposedHeaders(Collections.singletonList("Set-Cookie"));
configuration.setExposedHeaders(Collections.singletonList("Authorization")); // 이전 줄 덮어씀!
```

#### 수정 이유

- `setExposedHeaders`는 additive가 아니라 replace 동작이므로 마지막 호출만 유효함
- `Set-Cookie`는 브라우저가 자동 처리하는 헤더로 JS에서 읽을 수 없어 expose 대상이 아님
- 실제로 프론트에서 읽어야 하는 건 `Authorization` 헤더(accessToken)뿐

#### 수정 내용

```java
// After
configuration.setExposedHeaders(Collections.singletonList("Authorization"));
```

- 불필요한 `Set-Cookie` expose 제거
- 덮어쓰기 문제 해소

---

### 2. ~~CustomSuccessHandler — 쿠키 MaxAge와 Redis TTL 불일치~~ (수정 완료)

#### 이전 상태

쿠키의 `maxAge`가 하드코딩되어 있거나 밀리초가 그대로 들어가 실제 토큰 만료 시간과 불일치했다.

```java
// CustomSuccessHandler
cookie.setMaxAge(60*60*60);  // 하드코딩 216,000초 (60시간), 실제 TTL과 무관

// UserController (tokenRefresh, signup)
.maxAge(REFRESHTOKEN_EXPIRES_IN)  // 밀리초가 그대로 들어감 (maxAge는 초 단위)
```

#### 수정 이유

- `REFRESHTOKEN_EXPIRES_IN`은 JWT 생성에 밀리초로 쓰이는데, 쿠키 `maxAge`는 초 단위
- 쿠키가 토큰보다 훨씬 빨리 또는 늦게 만료되면 예상치 못한 인증 실패 발생
- 하드코딩은 환경변수 변경 시 자동 반영되지 않음

#### 수정 내용

```java
// CustomSuccessHandler
cookie.setMaxAge((int) (REFRESHTOKEN_EXPIRES_IN / 1000));

// UserController (tokenRefresh, signup)
.maxAge(REFRESHTOKEN_EXPIRES_IN / 1000)
```

- 3군데 모두 `REFRESHTOKEN_EXPIRES_IN / 1000`으로 통일
- 하드코딩 제거, 환경변수 기반으로 변경

---

### 3. CustomSuccessHandler — 쿠키에 `Secure` 플래그 미설정 (스킵)

#### 이전 상태

```java
cookie.setHttpOnly(true);
// cookie.setSecure(true); ← 없음
```

#### 수정 이유

- 프로덕션 HTTPS 환경에서 `Secure` 플래그가 없으면 HTTP로도 쿠키가 전송됨
- 단, 로컬 개발 환경은 HTTP이므로 `Secure=true` 설정 시 쿠키 전송 불가

#### 수정 내용

- 로컬 HTTP 환경과의 호환성 문제로 스킵
- 추후 프로필 분기(`prod`/`dev`) 도입 시 적용 예정

---

### 4. ~~CustomLogoutFilter — NPE 위험~~ (수정 완료)

#### 이전 상태

`request.getCookies()`가 `null`을 반환할 수 있는데 null 체크 없이 바로 for문에 진입했다.

```java
Cookie[] cookies = request.getCookies();
for (Cookie cookie : cookies) {  // cookies가 null이면 NPE!
```

#### 수정 이유

- 쿠키가 하나도 없는 요청(예: curl, Postman 등)이 오면 `NullPointerException` 발생
- 500 에러 대신 적절한 400 응답을 반환해야 함

#### 수정 내용

```java
Cookie[] cookies = request.getCookies();
if (cookies == null) {
    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
    return;
}
for (Cookie cookie : cookies) {
```

- null 체크 추가로 NPE 방지

---

### 5. ~~CustomLogoutFilter — 토큰이 없어도 삭제 실행~~ (수정 완료)

#### 이전 상태

Redis에 토큰이 존재하지 않을 때 400을 세팅하지만 `return`이 없어서 아래의 `deleteById`가 그대로 실행됐다.

```java
boolean exist = tokenRepository.existsById(userId);
if (!exist) {
    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
    // return이 없음! → 아래 deleteById가 실행됨
}
tokenRepository.deleteById(userId);
```

#### 수정 이유

- 존재하지 않는 토큰을 삭제 시도하는 것은 의도하지 않은 동작
- 400 응답을 세팅했지만 이후 로직이 계속 실행되어 쿠키 초기화 + 200 덮어쓰기 가능성

#### 수정 내용

```java
if (!exist) {
    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
    return;
}
```

- `return;` 추가로 즉시 종료

---

### 6. ~~JWTUtil — `validToken()` 이중 호출~~ (수정 완료)

#### 이전 상태

`JWTUtil`의 getter 메서드들이 각각 `validToken(token)`을 호출하여 매번 JWT를 재파싱했다.
`JWTFilter`에서 `validToken()` → `getType()` → `getUserId()` → `getRole()` → `getLanguage()` 순으로 호출하면 같은 토큰을 5번 파싱하게 된다.

```java
public String getType(String token) {
    return validToken(token).get("type", String.class);  // validToken 내부에서 JWT 파싱
}
```

#### 수정 이유

- JWT 파싱(서명 검증 포함)은 비용이 있는 연산으로, 매 요청마다 불필요하게 반복
- JWTFilter(5회), UserController(5회), CustomLogoutFilter(3회), WebSocketInterceptor(2회) 총 15회 → 4회로 감소

#### 수정 내용

```java
// JWTUtil — getter가 Claims를 받도록 변경
public String getType(Claims claims) {
    return claims.get("type", String.class);
}

// 호출부 — validToken() 한 번 호출 후 Claims 재사용
Claims claims = jwtUtil.validToken(token);
String type = jwtUtil.getType(claims);
String userId = jwtUtil.getUserId(claims);
```

- JWTUtil의 getType/getUserId/getRole/getLanguage 파라미터를 `String token` → `Claims claims`로 변경
- 4곳(JWTFilter, UserController, CustomLogoutFilter, WebSocketSecurityInterceptor) 모두 수정

---

### 7. ~~OAuth2UserService — `userEntity` NPE 위험~~ (수정 완료)

#### 이전 상태

`userEntity`가 `null`로 초기화된 뒤, google이 아닌 registrationId가 오면 if문을 건너뛰고 null 상태로 접근했다.

```java
User userEntity = null;

if (registrationId.equals("google")) {
    // ... userEntity 세팅
}

// userEntity가 null인 채로 접근 → NPE
oAuth2UserDTO.setName(userEntity.getId().toString());
```

#### 수정 이유

- `CustomOidcUserService`에서는 동일한 상황에 `OAUTH2_LOGIN_FAILED` 예외를 던지지만 `OAuth2UserService`에는 누락
- 예상치 못한 provider가 추가되거나 설정 오류 시 500 NPE 대신 명시적 에러가 나와야 함

#### 수정 내용

```java
if (userEntity == null) {
    throw new CustomException(UserErrorCode.OAUTH2_LOGIN_FAILED);
}

OAuth2UserDTO oAuth2UserDTO = new OAuth2UserDTO();
```

- `CustomOidcUserService`와 동일하게 null 체크 + 예외 처리 추가

---

### 8. ~~tokenRefresh() / signup() — 컨트롤러에 비즈니스 로직 과다~~ (수정 완료)

#### 이전 상태

`UserController`에 토큰 검증, Redis 조회/삭제/저장, JWT 생성, 쿠키 조립이 모두 섞여 있었다.
또한 `UserService`의 `deleteUser()`, `patchUser()`는 `ResponseEntity`를 직접 반환하고 있어서
Service가 HTTP를 아는 구조와 Controller가 비즈니스를 아는 구조가 혼재되어 있었다.

```java
// Before — Controller에 비즈니스 로직
@PostMapping("/token-refresh")
public ResponseEntity<ApiResponse<Void>> tokenRefresh(...) {
    jwtUtil.validToken(oldRefreshToken);          // 토큰 검증
    tokenService.findTokenById(...);              // Redis 조회
    jwtUtil.createJwt("accessToken", ...);        // 토큰 생성
    tokenRepository.deleteById(...);              // Redis 삭제
    tokenRepository.save(...);                    // Redis 저장
    ResponseCookie refreshCookie = ...;           // 쿠키 조립
    headers.add(HttpHeaders.AUTHORIZATION, ...);  // 헤더 세팅
    return ResponseEntity.status(...).headers(headers).body(...);
}

// Before — Service가 ResponseEntity 직접 반환
public ResponseEntity<ApiResponse<Void>> deleteUser() {
    // ... 비즈니스 로직 + ResponseCookie + HttpHeaders + ResponseEntity 조립
}
```

#### 수정 이유

- Controller와 Service의 책임이 뒤섞여 있어 어디서 뭘 하는지 파악이 어려움
- Service가 `ResponseEntity`, `HttpHeaders`, `ResponseCookie` 같은 HTTP 개념에 의존하면 재사용 불가
- 토큰 발급(JWT 생성 + Redis 저장) 로직이 4곳에서 중복

#### 수정 내용

1. **`AuthResult<T>` 제네릭 DTO 신규 생성** — Service가 반환하는 결과 객체 (accessToken, refreshToken, maxAge, data)
2. **`UserService.issueTokens()` 공통 헬퍼 추출** — JWT 생성 + Redis 저장을 한 곳으로 통합
3. **비즈니스 로직을 Service로 이동**:
   - `tokenRefresh()` → `AuthResult<Void>` 반환
   - `signup()` → `AuthResult<SignUpResponseDTO>` 반환
   - `patchUser()` → `AuthResult<UserProfileResponseDTO>` 반환 (ResponseEntity 제거)
   - `deleteUser()` → `void` 반환 (ResponseEntity 제거)
4. **Controller는 HTTP 조립만 담당**:
   - `buildAuthResponse()` 헬퍼로 쿠키/헤더 세팅 공통화
   - 각 엔드포인트는 Service 호출 → HTTP 조립 2줄로 정리
5. **부수 수정**: `patchUser()`의 `maxAge(REFRESHTOKEN_EXPIRES_IN)` 밀리초→초 미변환 버그도 수정
