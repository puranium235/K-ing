# 테스트 공부 노트

## 1. JUnit 5 기본 어노테이션

### `@Test`
메서드가 테스트임을 표시한다. `public` 없어도 된다.

```java
@Test
void 닉네임_변경_성공() {
    // given - when - then
}
```

### `@DisplayName`
테스트 결과에 한글 설명을 표시한다. 메서드명 대신 보여줌.

```java
@DisplayName("닉네임만 변경 시 토큰 재발급 없음")
@Test
void patchUser_닉네임만_변경() { ... }
```

### `@BeforeEach` / `@AfterEach`
각 테스트 메서드 실행 전/후에 호출된다. 공통 초기화에 사용.

```java
@BeforeEach
void setUp() {
    jwtUtil = new JWTUtil("test-secret-key");
}
```

### `@ExtendWith(MockitoExtension.class)`
Mockito의 `@Mock`, `@InjectMocks`를 자동으로 초기화해준다. 테스트 클래스에 붙인다.

```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    @Mock UserRepository userRepository;
    @InjectMocks UserService userService;
}
```

---

## 2. Mockito — Mock이 뭔가?

실제 객체 대신 **가짜 객체**를 만들어서, 특정 메서드 호출 시 원하는 값을 반환하도록 설정하는 것.

### 왜 필요한가?

`UserService.patchUser()`를 테스트하려면 `UserRepository`, `JWTUtil`, `TokenRepository`, `S3Service`가 전부 필요하다.
실제 객체를 쓰면 MySQL, Redis, S3가 다 떠 있어야 한다.
→ Mock을 쓰면 **DB/인프라 없이 순수 로직만 테스트** 가능.

### 핵심 메서드

```java
// "이 메서드가 호출되면 이 값을 반환해라"
when(userRepository.findByIdAndStatus(1L, "ROLE_REGISTERED"))
    .thenReturn(Optional.of(user));

// "이 메서드가 호출되었는지 확인해라"
verify(userRepository).save(user);

// "이 메서드가 호출되지 않았는지 확인해라"
verify(tokenRepository, never()).deleteById(any());
```

### `@Mock` vs `@InjectMocks`

```java
@Mock UserRepository userRepository;      // 가짜 객체
@Mock JWTUtil jwtUtil;                     // 가짜 객체
@InjectMocks UserService userService;     // 위의 가짜 객체들을 주입받는 실제 객체
```

`@InjectMocks`는 `UserService`의 생성자 파라미터에 `@Mock` 객체들을 자동으로 넣어준다.

---

## 3. AssertJ — 검증

JUnit 기본 `assertEquals`보다 읽기 쉬운 검증 라이브러리. `spring-boot-starter-test`에 포함되어 있다.

```java
// 값 비교
assertThat(result.getNickname()).isEqualTo("새닉네임");

// null 확인
assertThat(result).isNotNull();

// 예외 검증
assertThatThrownBy(() -> userService.patchUser(dto, null))
    .isInstanceOf(CustomException.class);

// 리스트
assertThat(list).hasSize(3);
assertThat(list).contains("ko", "en");
```

---

## 4. `@Tag` — 테스트 분류

테스트를 카테고리별로 나눠서 **선택적으로 실행**할 수 있게 한다.

### 우리 프로젝트에서 쓰는 이유

| 종류 | pre-refactor | refactor |
|------|-------------|----------|
| 일반 테스트 | 통과 | 통과 |
| bugfix 테스트 | **실패** (버그 있음) | 통과 |

둘을 섞으면 pre-refactor에서 빌드가 깨지니까 `@Tag("bugfix")`로 분리한다.

```java
// 일반 테스트 — 태그 없음
@Test
void patchUser_닉네임_변경() { ... }

// 버그 수정 테스트
@Tag("bugfix")
@Test
void doFilter_쿠키_null_NPE_방지() { ... }
```

### Gradle에서 분리 실행

```kotlin
// ./gradlew test → bugfix 제외
tasks.test {
    useJUnitPlatform {
        excludeTags("bugfix")
    }
}

// ./gradlew testBugfix → bugfix만 실행
tasks.register<Test>("testBugfix") {
    group = "verification"                          // ← 이거 없으면 tasks --group=verification에 안 보임
    description = "Runs only @Tag(\"bugfix\") tests"
    useJUnitPlatform {
        includeTags("bugfix")
    }
}
```

> **삽질 기록**: `tasks.register`로 등록한 태스크는 `group`을 명시하지 않으면
> `./gradlew tasks --group=verification`에 표시되지 않는다. `--all`로는 보인다.

### 리팩토링 완료 후

`@Tag("bugfix")` 제거하고, Gradle 설정도 원래대로 되돌린다. 임시 도구.

---

## 5. SecurityContext 테스트

우리 서비스는 `SecurityContextHolder.getContext().getAuthentication()`으로 현재 유저를 가져온다.
테스트에서는 SecurityContext를 직접 세팅해야 한다.

```java
private void setSecurityContext(Long userId, String language) {
    OAuth2UserDTO authUser = new OAuth2UserDTO();
    authUser.setName(userId.toString());
    authUser.setLanguage(language);
    authUser.setAuthorities(List.of(new SimpleGrantedAuthority("ROLE_REGISTERED")));

    Authentication auth = new UsernamePasswordAuthenticationToken(
        authUser, null, authUser.getAuthorities());
    SecurityContextHolder.getContext().setAuthentication(auth);
}

@BeforeEach
void setUp() {
    setSecurityContext(1L, "ko");
}

@AfterEach
void tearDown() {
    SecurityContextHolder.clearContext();
}
```

---

## 6. 분기 테스트 & 경계값 테스트

### 분기 테스트 (Branch Testing)

코드의 **if/else, try/catch, switch** 등 분기마다 최소 하나의 테스트를 작성한다.
모든 분기를 통과하는 테스트 세트를 만들면 **분기 커버리지 100%**가 된다.

#### 예시: `validToken()`의 분기 분석

```java
public Claims validToken(String token) {
    try {
        return Jwts.parser()...parseSignedClaims(token)...;  // ← 분기 1: 정상
    } catch (ExpiredJwtException e) {
        throw new CustomException(ACCESSTOKEN_EXPIRED);       // ← 분기 2: 만료
    } catch (Exception e) {
        throw new CustomException(INVALID_TOKEN);             // ← 분기 3: 기타 에러
    }
}
```

3개 분기 → 최소 3개 테스트:

| 분기 | 입력 | 기대 결과 |
|------|------|-----------|
| 정상 | 유효한 토큰 | Claims 반환 |
| 만료 | 만료된 토큰 (`expireMs = -1000`) | `ACCESSTOKEN_EXPIRED` 예외 |
| 기타 에러 | 잘못된 문자열 (`"invalid"`) | `INVALID_TOKEN` 예외 |

### 경계값 테스트 (Boundary Value Testing)

값의 **경계**에서 버그가 발생하기 쉽다. 경계 근처의 값을 테스트한다.

#### 원칙: 경계 ± 1

| 조건 | 테스트할 값 |
|------|------------|
| `length <= 50` | 49 (통과), **50 (경계)**, 51 (실패) |
| `expireMs > 0` | -1 (만료), **0 (경계)**, 1 (유효) |
| `list.isEmpty()` | 빈 리스트 (경계), 1개 리스트 |
| `value == null` | null (경계), 빈 문자열, 정상 문자열 |

#### 예시: JWT 만료 경계값

```java
// 경계: expireMs = 0 → 생성 즉시 만료
@Test
void validToken_만료시간_0_경계값() {
    String token = jwtUtil.createJwt("accessToken", "1", "ko", "ROLE_REGISTERED", 0L);
    assertThatThrownBy(() -> jwtUtil.validToken(token))
            .isInstanceOf(CustomException.class);
}
```

### 분기 + 경계값을 조합하는 방법

1. 코드에서 **모든 분기(if/else/catch)를 찾는다**
2. 각 분기의 **조건식에서 경계값을 식별**한다
3. 분기마다 **정상값 1개 + 경계값 1~2개** 테스트를 작성한다

```
분기: if (token == null)
  → 테스트: null 전달 (경계), 빈 문자열 전달, 정상 토큰 전달

분기: catch (ExpiredJwtException)
  → 테스트: expireMs = -1000 (확실히 만료), expireMs = 0 (경계)
```

---

## 7. 테스트 작성 패턴 — Given-When-Then

```java
@Test
void patchUser_language_변경_시_토큰_재발급() {
    // Given — 테스트 데이터 준비
    User user = createUser(1L, "ko");
    PatchUserRequestDTO dto = new PatchUserRequestDTO();
    dto.setLanguage("en");
    when(userRepository.findByIdAndStatus(1L, "ROLE_REGISTERED"))
        .thenReturn(Optional.of(user));

    // When — 테스트 대상 메서드 실행
    ResponseEntity<?> response = userService.patchUser(dto, null);

    // Then — 결과 검증
    assertThat(user.getLanguage()).isEqualTo("en");
    verify(jwtUtil).createJwt(eq("accessToken"), any(), eq("en"), any(), any());
}
```
