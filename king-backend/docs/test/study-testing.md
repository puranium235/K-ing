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
    useJUnitPlatform {
        includeTags("bugfix")
    }
}
```

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

## 6. 테스트 작성 패턴 — Given-When-Then

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
