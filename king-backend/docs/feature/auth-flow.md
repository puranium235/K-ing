# 플로우 1: 인증 (로그인 ~ 요청 검증 ~ 토큰 갱신 ~ 로그아웃)

## 전체 흐름 다이어그램

```
[사용자] ─── OAuth2 로그인 ───→ [Spring Security OAuth2]
                                      │
                          ┌───────────┴───────────┐
                          ▼                       ▼
                  구글 (OAuth2)              라인 (OIDC)
                  OAuth2UserService      CustomOidcUserService
                          │                       │
                          └───────────┬───────────┘
                                      ▼
                            [CustomSuccessHandler]
                            refreshToken 발급 + Redis 저장
                            쿠키 세팅 + 프론트 리다이렉트
                                      │
                                      ▼
                          [프론트: /token 페이지]
                          POST /user/token-refresh
                                      │
                                      ▼
                          [UserController.tokenRefresh()]
                          refreshToken 검증 → accessToken 발급
                          새 refreshToken 발급 (Rotation)
                                      │
                                      ▼
                          [이후 모든 API 요청]
                          Authorization: Bearer {accessToken}
                                      │
                                      ▼
                              [JWTFilter]
                          accessToken 파싱 + SecurityContext 세팅
                                      │
                                      ▼
                          [로그아웃: POST /user/logout]
                              [CustomLogoutFilter]
                          Redis 삭제 + 쿠키 초기화
```

---

## 1. OAuth2 로그인 (구글)

### 관련 파일
- `OAuth2UserService.java` — `DefaultOAuth2UserService` 확장
- `GoogleUserDTO.java` — 구글 응답 매핑 DTO
- `OAuth2UserDTO.java` — Spring Security에 전달할 사용자 정보 (`OAuth2User` 구현체)

### 동작 흐름

1. 사용자가 `/oauth2/authorization/google`로 접근하면 Spring Security가 구글 OAuth2 인증 시작
2. 구글 인증 완료 후 `OAuth2UserService.loadUser()` 호출
3. 구글 응답에서 `sub`(구글 ID), `email`, `picture`를 `GoogleUserDTO`로 매핑
4. DB에서 `googleId + status(ROLE_PENDING 또는 ROLE_REGISTERED)`로 기존 유저 조회
5. 유저가 없으면 새로 생성 (`ROLE_PENDING` 상태, 아직 회원가입 미완료)
6. `OAuth2UserDTO`에 userId(=DB PK), language, authorities를 담아 반환
7. Spring Security가 이 정보를 `Authentication` 객체로 세팅

### 핵심 코드

```java
// OAuth2UserService.java
GoogleUserDTO googleUserDTO = GoogleUserDTO.from(oAuth2User);

userEntity = userRepository.findByGoogleIdAndStatusIn(
    googleUserDTO.getGoogleId(),
    List.of("ROLE_PENDING", "ROLE_REGISTERED")
);

if (userEntity == null) {
    userEntity = new User();
    userEntity.setGoogleId(googleUserDTO.getGoogleId());
    userEntity.setStatus("ROLE_PENDING");
    userEntity.setEmail(googleUserDTO.getEmail());
    userEntity.setImageUrl(googleUserDTO.getImageUrl());
    userRepository.save(userEntity);
}
```

### 설계 포인트
- `ROLE_PENDING`: OAuth2 인증만 완료, 닉네임/언어 설정 미완료 → `/user/signup`만 접근 가능
- `ROLE_REGISTERED`: 회원가입 완료 → 모든 API 접근 가능
- 탈퇴한 유저(`ROLE_DELETED` 등)는 `statusIn` 조건으로 자연스럽게 제외됨

---

## 2. OAuth2 로그인 (라인)

### 관련 파일
- `CustomOidcUserService.java` — `OidcUserService` 확장 (라인은 OIDC 프로토콜 사용)
- `LineUserDTO.java` — 라인 응답 매핑 DTO
- `OidcUserDTO.java` — Spring Security에 전달할 사용자 정보 (`OidcUser` 구현체)

### 동작 흐름

1. 사용자가 `/oauth2/authorization/line`으로 접근
2. 라인 OIDC 인증 완료 후 `CustomOidcUserService.loadUser()` 호출
3. 라인 응답에서 `sub`(라인 ID), `email`, `picture`를 `LineUserDTO`로 매핑
4. 나머지 흐름은 구글과 동일 (DB 조회 → 없으면 ROLE_PENDING으로 생성)
5. `OidcUserDTO`에 userId, language, authorities를 담아 반환

### 구글과의 차이점
- 구글: `DefaultOAuth2UserService` (일반 OAuth2)
- 라인: `OidcUserService` (OpenID Connect, ID Token 사용)
- `SecurityConfig`에서 라인 ID Token을 HS256으로 검증하도록 `JwtDecoderFactory` 설정:
  ```java
  @Bean
  public JwtDecoderFactory<ClientRegistration> idTokenDecoderFactory() {
      OidcIdTokenDecoderFactory idTokenDecoderFactory = new OidcIdTokenDecoderFactory();
      idTokenDecoderFactory.setJwsAlgorithmResolver(clientRegistration -> MacAlgorithm.HS256);
      return idTokenDecoderFactory;
  }
  ```

---

## 3. CustomSuccessHandler (로그인 성공 처리)

### 관련 파일
- `CustomSuccessHandler.java` — `SimpleUrlAuthenticationSuccessHandler` 확장

### 동작 흐름

1. OAuth2/OIDC 로그인 성공 시 `onAuthenticationSuccess()` 호출
2. `Authentication.getPrincipal()`의 타입으로 구글/라인 분기:
   - `OAuth2UserDTO` → 구글
   - `OidcUserDTO` → 라인
3. userId, language, role을 추출
4. **refreshToken** 생성 (JWT, `type=refreshToken`)
5. Redis에 `TokenEntity(userId, refreshToken, TTL)` 저장
6. 응답 쿠키에 refreshToken 세팅 (`HttpOnly`)
7. 프론트엔드 `{CLIENT_URL}/token` 페이지로 리다이렉트

### 핵심 코드

```java
String refreshToken = jwtUtil.createJwt("refreshToken", userId, language, role, REFRESHTOKEN_EXPIRES_IN);

TokenEntity token = new TokenEntity(Long.parseLong(userId), refreshToken, REFRESHTOKEN_EXPIRES_IN);
tokenRepository.save(token);

response.addCookie(createCookie("refreshToken", refreshToken));
response.sendRedirect(CLIENT_URL + "/token");
```

### 설계 포인트
- 로그인 성공 시 **accessToken은 발급하지 않음** — 프론트가 리다이렉트 후 `/token-refresh`로 accessToken을 요청
- refreshToken만 HttpOnly 쿠키로 전달하여 XSS 공격에서 토큰 탈취 방지
- Redis에 저장하여 서버 사이드에서 토큰 무효화(로그아웃) 가능

---

## 4. JWTFilter (매 요청 검증)

### 관련 파일
- `JWTFilter.java` — `OncePerRequestFilter` 확장

### 동작 흐름

1. `Authorization` 헤더에서 `Bearer {token}` 추출
2. 헤더가 없으면:
   - `/api/user/token-refresh` POST 요청이면 → 통과 (이 엔드포인트는 accessToken 없이 접근)
   - 그 외 → 401 응답
3. accessToken JWT 검증 (`jwtUtil.validToken()`)
4. 토큰의 `type`이 `accessToken`인지 확인 (refreshToken으로 API 접근 차단)
5. 토큰에서 userId, role, language 추출
6. `OAuth2UserDTO`에 담아 `SecurityContext`에 설정
7. 이후 컨트롤러에서 `SecurityContextHolder.getContext().getAuthentication()`으로 접근

### 핵심 코드

```java
String accessToken = authorization.substring(7);
jwtUtil.validToken(accessToken);

String type = jwtUtil.getType(accessToken);
if (!type.equals("accessToken")) {
    response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
    return;
}

OAuth2UserDTO oAuth2UserDTO = new OAuth2UserDTO();
oAuth2UserDTO.setName(userId);
oAuth2UserDTO.setLanguage(language);
oAuth2UserDTO.setAuthorities(List.of(new SimpleGrantedAuthority(role)));

Authentication authToken = new UsernamePasswordAuthenticationToken(
    oAuth2UserDTO, null, oAuth2UserDTO.getAuthorities()
);
SecurityContextHolder.getContext().setAuthentication(authToken);
```

### 필터 체인 위치
```java
// SecurityConfig.java
.addFilterAfter(new JWTFilter(jwtUtil), OAuth2LoginAuthenticationFilter.class)
```
- OAuth2 로그인 필터 **이후**에 배치 → OAuth2 로그인 요청에는 간섭하지 않음

---

## 5. accessToken 재발급 (Token Refresh)

### 관련 파일
- `UserController.tokenRefresh()` — POST `/user/token-refresh`
- `JWTUtil.java` — JWT 생성/검증
- `TokenService.java` — Redis 토큰 조회
- `TokenRepository.java` — Redis CRUD (`CrudRepository<TokenEntity, Long>`)
- `TokenEntity.java` — Redis Hash (`@RedisHash("token")`, TTL 자동 만료)

### 동작 흐름

1. 프론트가 쿠키에 담긴 refreshToken과 함께 POST `/user/token-refresh` 호출
2. refreshToken JWT 유효성 검증
3. 토큰 type이 `refreshToken`인지 확인
4. Redis에서 userId로 저장된 토큰 조회 → 요청의 refreshToken과 일치 여부 확인
5. **Refresh Token Rotation**: 기존 토큰 삭제 → 새 accessToken + 새 refreshToken 발급
6. 응답:
   - `Authorization` 헤더: `Bearer {newAccessToken}`
   - `Set-Cookie` 헤더: 새 refreshToken (HttpOnly)

### 핵심 코드

```java
// 1. 쿠키에서 refreshToken 추출
@CookieValue(value = "refreshToken", required = false) String oldRefreshToken

// 2. 검증
jwtUtil.validToken(oldRefreshToken);
jwtUtil.getType(oldRefreshToken).equals("refreshToken");

// 3. Redis 일치 확인
Optional<TokenEntity> token = tokenService.findTokenById(Long.parseLong(userId));
token.get().getRefreshToken().equals(oldRefreshToken);

// 4. Rotation: 삭제 후 재발급
tokenRepository.deleteById(Long.parseLong(userId));
tokenRepository.save(new TokenEntity(Long.parseLong(userId), refreshToken, REFRESHTOKEN_EXPIRES_IN));
```

### 설계 포인트
- **Refresh Token Rotation**: 매 갱신 시 refreshToken도 새로 발급하여 탈취된 토큰의 재사용 방지
- Redis의 `@TimeToLive`로 만료된 토큰 자동 삭제
- `SecurityConfig`에서 `/user/token-refresh`는 `permitAll()` — accessToken 없이 접근 가능
- JWTFilter에서도 이 경로는 별도 처리하여 통과시킴

---

## 6. 로그아웃

### 관련 파일
- `CustomLogoutFilter.java` — `GenericFilterBean` 확장

### 동작 흐름

1. POST `/api/user/logout` 요청 감지 (URI + Method 매칭)
2. 쿠키에서 refreshToken 추출
3. refreshToken JWT 유효성 검증
4. 토큰 type이 `refreshToken`인지 확인
5. Redis에서 해당 userId의 토큰 존재 여부 확인
6. Redis에서 토큰 삭제
7. 쿠키 초기화 (`maxAge=0`)
8. 200 OK 응답

### 핵심 코드

```java
// 쿠키에서 refreshToken 추출
for (Cookie cookie : cookies) {
    if (cookie.getName().equals("refreshToken")) {
        refreshToken = cookie.getValue();
        break;
    }
}

// Redis에서 삭제
tokenRepository.deleteById(userId);

// 쿠키 초기화
Cookie cookie = new Cookie("refreshToken", null);
cookie.setMaxAge(0);
cookie.setPath("/");
response.addCookie(cookie);
```

### 필터 체인 위치
```java
// SecurityConfig.java
.addFilterBefore(new CustomLogoutFilter(jwtUtil, tokenRepository), LogoutFilter.class)
```
- Spring 기본 `LogoutFilter` **이전**에 배치
- Spring 기본 로그아웃 기능은 `.logout(AbstractHttpConfigurer::disable)`로 비활성화

### 설계 포인트
- 필터 레벨에서 처리 → 컨트롤러까지 가지 않음
- Redis 삭제로 서버 사이드 토큰 무효화 → 이후 해당 refreshToken으로 token-refresh 불가
- 쿠키 초기화로 클라이언트 사이드도 정리

---

## JWT 구조

### JWTUtil.java

JWT 생성 및 검증을 담당하는 유틸리티 클래스.

### 토큰 Claim 구조

| Claim | 설명 | 예시 |
|-------|------|------|
| `type` | 토큰 종류 | `"accessToken"` / `"refreshToken"` |
| `userId` | 유저 DB PK (문자열) | `"42"` |
| `language` | 유저 언어 설정 | `"ko"`, `"en"`, `"ja"`, `"zh"` |
| `role` | 유저 권한 | `"ROLE_PENDING"` / `"ROLE_REGISTERED"` |
| `iat` | 발급 시각 | timestamp |
| `exp` | 만료 시각 | timestamp |

### 서명 알고리즘
- **HS256** (HMAC-SHA256), 환경변수 `spring.jwt.secret`에서 키 로드

---

## Redis 토큰 저장소

### TokenEntity

```java
@RedisHash(value = "token")
public class TokenEntity {
    @Id
    private Long id;           // = userId (유저당 1개)
    private String refreshToken;
    @TimeToLive
    private Long expiration;   // 밀리초 단위, Redis TTL 자동 만료
}
```

- 유저당 refreshToken 1개만 저장 (Id = userId)
- 새 로그인/갱신 시 기존 토큰 덮어씀 → 다른 기기 세션 무효화

---

## SecurityConfig 권한 설정

```java
.authorizeHttpRequests((auth) -> auth
    .requestMatchers("/oauth2/**").permitAll()              // OAuth2 로그인
    .requestMatchers("/user/token-refresh").permitAll()     // 토큰 갱신
    .requestMatchers("/user/signup").hasRole("PENDING")     // 회원가입 (미완료 유저만)
    .requestMatchers("/user/nickname").hasAnyRole("PENDING", "REGISTERED")  // 닉네임 중복검사
    .anyRequest().hasRole("REGISTERED"))                    // 나머지 모든 API
```

### Security 무시 경로 (WebSecurityCustomizer)
```
/v3/api-docs/**, /swagger-ui/**, /ws/**
```
- Swagger 문서와 WebSocket 경로는 필터 체인 자체를 우회
