# 테스트 계획서

## 1. 테스트 목적

플로우 1~3 리팩토링 결과가 **기존 동작을 보존하는지** 검증하고, **버그 수정이 실제로 적용되었는지** 증명한다.

| 검증 대상 | 기대 결과 |
|-----------|-----------|
| **리팩토링** (SecurityUtil 추출, 책임 이동, 헬퍼 추출 등) | 리팩토링 전후 동일 동작 |
| **버그 수정** (NPE 방지, maxAge 단위, CORS 등) | 리팩토링 전 실패 → 리팩토링 후 통과 |

핵심 원칙: **원본 코드의 동작을 기준으로 테스트를 작성**하여 AI 수정 코드를 맹신하지 않는다.

---

## 2. 테스트 대상 — 분기/경계값 분석

### 2-1. `JWTUtil`

#### `validToken(token)`

| # | 분기/경계 | 조건 | 기대 결과 | 태그 |
|---|----------|------|-----------|------|
| 1 | 정상 | 유효한 토큰 | Claims 반환 | — |
| 2 | catch ExpiredJwtException | 만료된 토큰 (`expireMs = -1000`) | `ACCESSTOKEN_EXPIRED` 예외 | — |
| 3 | catch Exception | 잘못된 문자열 (`"invalid"`) | `INVALID_TOKEN` 예외 | — |
| 4 | 경계값 | `expireMs = 0` (즉시 만료) | 예외 | — |
| 5 | 경계값 | `token = null` | `INVALID_TOKEN` 예외 | — |
| 6 | 경계값 | `token = ""` (빈 문자열) | `INVALID_TOKEN` 예외 | — |

#### getter 메서드 (`getUserId`, `getRole`, `getLanguage`, `getType`)

| # | 분기/경계 | 조건 | 기대 결과 | 태그 |
|---|----------|------|-----------|------|
| 7-10 | 정상 | 유효한 토큰 | 각 claim 값 반환 | — |

---

### 2-2. `CustomLogoutFilter.doFilter()`

| # | 분기/경계 | 조건 | 기대 결과 | 태그 |
|---|----------|------|-----------|------|
| 1 | URI 불일치 | `/api/user/profile` | filterChain 통과 | — |
| 2 | 메서드 불일치 | GET `/api/user/logout` | filterChain 통과 | — |
| 3 | cookies null | `getCookies() = null` | NPE (**bugfix: 400 반환**) | `bugfix` |
| 4 | 쿠키에 refreshToken 없음 | 다른 이름의 쿠키만 존재 | 400 | — |
| 5 | 경계값 | 빈 쿠키 배열 `new Cookie[]{}` | 400 | — |
| 6 | 토큰 만료 | `ExpiredJwtException` 발생 | 400 | — |
| 7 | type 불일치 | `type = "accessToken"` | 400 | — |
| 8 | Redis에 없음 | `existsById = false` | 400 세팅 후 return 누락 → 삭제+200도 실행 | — |
| 9 | 정상 로그아웃 | 유효한 refreshToken + Redis 존재 | 토큰 삭제, 쿠키 무효화, 200 | — |

---

### 2-3. `OAuth2UserService.loadUser()`

> `super.loadUser()`가 HTTP 호출을 하므로 단위 테스트에서 직접 호출 불가.
> Repository 동작 패턴과 NPE 논리적 결함만 검증.

| # | 분기/경계 | 조건 | 기대 결과 | 태그 |
|---|----------|------|-----------|------|
| 1 | google + 기존 유저 | `findByGoogleId` → User 반환 | save 호출 안 함 | — |
| 2 | google + 신규 유저 | `findByGoogleId` → null | 새 User 생성, save 호출 | — |
| 3 | google 아닌 provider | `registrationId ≠ "google"` | userEntity = null → **NPE** | `bugfix` → **단위 테스트 제외** (super.loadUser()가 HTTP 호출하여 mock 불가. @WebMvcTest/통합 테스트에서 검증) |

---

### 2-4. `UserService`

#### `getUserById(id)`

| # | 분기/경계 | 조건 | 기대 결과 | 태그 |
|---|----------|------|-----------|------|
| 1 | 정상 — 본인 | `userId == requestUserId` | `fromSelfEntity` (알림/언어 포함) | — |
| 2 | 정상 — 타인 | `userId != requestUserId` | `fromEntity` (알림/언어 null) | — |
| 3 | 유저 없음 | `findByIdAndStatus` → empty | `USER_NOT_FOUND` 예외 | — |
| 4 | 경계값 | `id = "abc"` (숫자 아님) | `USER_NOT_FOUND` 예외 (NumberFormatException) | — |
| 5 | 경계값 | `id = ""` (빈 문자열) | `USER_NOT_FOUND` 예외 | — |

#### `patchUser(dto, imageFile)`

| # | 분기/경계 | 조건 | 기대 결과 | 태그 |
|---|----------|------|-----------|------|
| 1 | 닉네임만 변경 | `nickname != null`, 나머지 null | 닉네임 저장, 토큰 재발급 | — |
| 2 | language 변경 | `language != null` | language 저장, 토큰 재발급 | — |
| 3 | 닉네임 중복 | `findByNickname` → 다른 유저 | `DUPLICATED_NICKNAME` 예외 | — |
| 4 | 닉네임 본인 것 | `findByNickname` → 본인 | 통과 (예외 없음) | — |
| 5 | 잘못된 닉네임 | `isValidNickname = false` | `INVALID_NICKNAME` 예외 | — |
| 6 | 경계값 — 닉네임 | 공백만 (`"   "`) → trim 후 빈 문자열 | `INVALID_NICKNAME` 예외 | — |
| 7 | 경계값 — 닉네임 길이 | 50자 (통과) vs 51자 (실패) | 50자 통과, 51자 `INVALID_NICKNAME` | — |
| 8 | 잘못된 language | `isValidLanguage = false` (예: `"fr"`) | `INVALID_LANGUAGE` 예외 | — |
| 9 | 경계값 — description | 150자 (통과) vs 151자 (실패) | 150자 통과, 151자 `INVALD_VALUE` | — |
| 10 | 유저 없음 | `findByIdAndStatus` → empty | `USER_NOT_FOUND` 예외 | — |

#### `deleteUser()`

| # | 분기/경계 | 조건 | 기대 결과 | 태그 |
|---|----------|------|-----------|------|
| 1 | 정상 | 유저 존재 | delete + tokenDelete + 204 + 쿠키 무효화 | — |
| 2 | 유저 없음 | `findByIdAndStatus` → empty | `USER_NOT_FOUND` 예외 | — |

---

### 2-5. `CurationService`

#### `postCuration(dto, imageFile)`

| # | 분기/경계 | 조건 | 기대 결과 | 태그 |
|---|----------|------|-----------|------|
| 1 | 정상 | 유효한 title, description, placeIds | CurationList + Item 저장 | — |
| 2 | title 검증 실패 | `title = null` | `INVALID_VALUE` 예외 | — |
| 3 | 경계값 — title | 50자 (통과) vs 51자 (실패) | 50자 통과, 51자 `INVALID_VALUE` | — |
| 4 | 경계값 — description | 1000자 (통과) vs 1001자 (실패) | 1000자 통과, 1001자 `INVALID_VALUE` | — |
| 5 | placeIds null | `getPlaceIds() = null` | **NPE** (.isEmpty() 호출) | `bugfix` |
| 6 | 경계값 — placeIds | 빈 리스트 `[]` | `INVALID_VALUE` 예외 | — |
| 7 | 중복 장소 | 같은 placeId 2번 | `DUPLICATED_PLACE` 예외 | — |
| 8 | 존재하지 않는 장소 | `findById` → empty | `PLACE_NOT_FOUND` 예외 | — |

#### `putCuration(id, dto, imageFile)`

| # | 분기/경계 | 조건 | 기대 결과 | 태그 |
|---|----------|------|-----------|------|
| 1 | 정상 | 본인 큐레이션 + 유효한 입력 | 기존 항목 삭제 → 새 항목 저장 | — |
| 2 | 본인 아님 | `writer != user` | `FORBIDDEN_CURATION` 예외 | — |
| 3 | 큐레이션 없음 | `findById` → empty | `CURATION_NOT_FOUND` 예외 | — |

#### `deleteCuration(id)`

| # | 분기/경계 | 조건 | 기대 결과 | 태그 |
|---|----------|------|-----------|------|
| 1 | 정상 | 본인 큐레이션 | bookmark + item + curation 삭제 | — |
| 2 | 본인 아님 | `writer != user` | `FORBIDDEN_CURATION` 예외 | — |
| 3 | 큐레이션 없음 | `findById` → empty | `CURATION_NOT_FOUND` 예외 | — |

---

### 2-6. `BookmarkService`

#### `postBookmark(dto)`

| # | 분기/경계 | 조건 | 기대 결과 | 태그 |
|---|----------|------|-----------|------|
| 1 | 정상 — public 큐레이션 | `isPublic = true` | Bookmark 저장 | — |
| 2 | 비공개 + 본인 | `isPublic = false`, writer == user | Bookmark 저장 | — |
| 3 | 비공개 + 타인 | `isPublic = false`, writer != user | `CURATION_NOT_FOUND` 예외 | — |
| 4 | 이미 북마크됨 | `existsByCurationListIdAndUserId = true` | `DUPLICATED_BOOKMARK` 예외 | — |
| 5 | 큐레이션 없음 | `findById` → empty | `CURATION_NOT_FOUND` 예외 | — |

#### `deleteBookmark(dto)`

| # | 분기/경계 | 조건 | 기대 결과 | 태그 |
|---|----------|------|-----------|------|
| 1 | 정상 | 북마크 존재 | Bookmark 삭제 | — |
| 2 | 비공개 + 타인 | `isPublic = false`, writer != user | `CURATION_NOT_FOUND` 예외 | — |
| 3 | 북마크 없음 | `findByCurationListAndUser` → empty | `NOT_BOOKMARKED` 예외 | — |

---

## 3. 선택 기술

### 1차: JUnit 5 + Mockito 단위 테스트

Service 레이어 메서드를 대상으로, 의존성(Repository, Util 등)을 mock 처리하여 순수 로직만 검증한다.

```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    @Mock UserRepository userRepository;
    @Mock JWTUtil jwtUtil;
    @Mock TokenService tokenService;
    @InjectMocks UserService userService;

    @Test
    void signup_정상_동작() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        // ...
    }

    @Tag("bugfix")
    @Test
    void tokenRefresh_maxAge_초_단위_변환() {
        // 리팩토링 전: 밀리초 단위로 실패
    }
}
```

### 2차: @WebMvcTest 슬라이스 테스트 (Controller 변경분)

Controller 레이어의 HTTP 응답 형식, 상태 코드, Security 필터 동작을 검증한다.

```java
@WebMvcTest(UserController.class)
class UserControllerTest {
    @Autowired MockMvc mockMvc;
    @MockBean UserService userService;

    @Test
    void signup_201_반환() throws Exception {
        mockMvc.perform(post("/api/user/signup")...)
               .andExpect(status().isCreated());
    }
}
```

---

## 4. 선택 이유

### JUnit 5 + Mockito를 1차로 선택한 이유

| 기준 | 평가 |
|------|------|
| 의존성 추가 | 불필요 (`spring-boot-starter-test`에 이미 포함) |
| 인프라 요구 | 없음 (MySQL, Redis, ES 없이 실행) |
| 실행 속도 | 매우 빠름 (테스트 하나당 ~ms) |
| 리팩토링 검증 적합성 | 최적 ("같은 입력 → 같은 출력" 비교) |
| 도입 난이도 | 낮음 |

**핵심**: 리팩토링 전 커밋에서 바로 테스트를 작성하고 실행할 수 있어야 한다. 인프라가 필요한 테스트(@SpringBootTest, TestContainers)는 현재 환경(ES, Redis, OAuth2 설정 필수)에서 Context 로딩 자체가 실패할 가능성이 높아 부적합하다.

### @WebMvcTest를 2차로 선택한 이유

플로우 1에서 Controller 책임을 분리(`buildAuthResponse()` 등)했으므로, HTTP 응답 형식과 상태 코드가 유지되는지 검증이 필요하다. Service는 `@MockBean`으로 대체하므로 인프라 불필요.

### 제외한 기술과 그 이유

| 기술 | 제외 이유 |
|------|-----------|
| @DataJpaTest | 커스텀 Repository 쿼리가 적어 가성비 낮음. H2 의존성 추가 필요 |
| @SpringBootTest | MySQL, Redis, ES 모두 필요. Context 로딩 실패 가능성 높음. 환경 세팅 비용 과도 |
| TestContainers | Docker 필수 + 느림 + 설정 복잡. 리팩토링 검증 목적에 과도한 구성 |

---

## 5. 장단점 정리

### JUnit 5 + Mockito 단위 테스트

| 장점 | 단점 |
|------|------|
| 의존성 추가 불필요 | Mock 설정 보일러플레이트가 많아질 수 있음 |
| 인프라 없이 실행 | 실제 DB 쿼리/트랜잭션 동작 미검증 |
| 매우 빠른 피드백 루프 (~ms) | Mock이 실제 구현과 다르면 false positive 가능 |
| 실패 시 원인 특정 쉬움 | 레이어 간 연동 문제 미검증 |
| TDD 방식에 최적 | |

### @WebMvcTest 슬라이스 테스트

| 장점 | 단점 |
|------|------|
| HTTP 매핑/응답 형식/상태 코드 검증 | Spring Context 부분 로딩 → 단위 테스트보다 느림 (~초) |
| Security 필터 동작 검증 가능 | SecurityConfig, JWTFilter 설정 엮이면 추가 설정 필요 |
| 인프라 불필요 (Service는 MockBean) | Service 로직 자체는 검증 못 함 |

---

## 6. 버그 수정 건 처리 — `@Tag("bugfix")`

리팩토링 전 브랜치에서는 버그가 존재하므로 bugfix 테스트가 실패해야 한다. 이를 분리 관리하기 위해 `@Tag("bugfix")` 방식을 채택한다.

### 동작 방식

| 단계 | 실행 명령 | 일반 테스트 | bugfix 테스트 |
|------|-----------|------------|--------------|
| 리팩토링 전 | `./gradlew test` | 통과 | 제외 (excludeTags) |
| 리팩토링 전 | `./gradlew testBugfix` | 제외 | 실패 (버그 존재) |
| 리팩토링 후 | `./gradlew test` | 통과 (동작 보존) | 제외 |
| 리팩토링 후 | `./gradlew testBugfix` | 제외 | 통과 (버그 수정 증명) |

### 최종 정리 (머지 후)

1. `@Tag("bugfix")` 제거
2. `build.gradle.kts`에서 `excludeTags`, `testBugfix` 태스크 제거
3. `./gradlew test` → 전체 테스트 통과 확인

---

## 7. 추가 필요 사항

### 7-1. Gradle 설정 (`build.gradle.kts`)

```kotlin
tasks.test {
    useJUnitPlatform {
        excludeTags("bugfix")
    }
    reports.junitXml.required.set(true)
}

tasks.register<Test>("testBugfix") {
    group = "verification"
    description = "Runs only @Tag(\"bugfix\") tests"
    useJUnitPlatform {
        includeTags("bugfix")
    }
    reports.junitXml.required.set(true)
}
```

> **주의**: `tasks.register`로 등록한 태스크는 `group`과 `description`을 명시하지 않으면
> `./gradlew tasks --group=verification`에 표시되지 않는다.
> `--all` 옵션으로는 보이지만, 그룹 필터링에서 누락되므로 반드시 설정할 것.

### 7-2. GitHub Actions CI 워크플로우

`.github/workflows/test.yml` 생성 필요:

- **unit-test** job: `./gradlew test` (bugfix 제외) — 리팩토링 전후 모두 통과해야 함
- **bugfix-test** job: `./gradlew testBugfix` + `continue-on-error: true` — 리팩토링 전 실패 허용, 리팩토링 후 통과
- **summary** job: 결과 요약 (`$GITHUB_STEP_SUMMARY`)

### 7-3. 테스트 브랜치 전략

```
develop (리팩토링 전)
  └── test/pre-refactor (테스트 작성)     ← 현재 브랜치
        │   CI: unit-test ✅, bugfix-test ❌
        │
        └── refactor/hakyoung (테스트 머지 + 리팩토링 코드)
              CI: unit-test ✅, bugfix-test ✅
```

### 7-4. 테스트 파일 구조

```
src/test/java/com/king/backend/
├── domain/
│   ├── user/
│   │   └── service/
│   │       └── UserServiceTest.java          ← 플로우 1, 2
│   └── curation/
│       └── service/
│           ├── CurationServiceTest.java      ← 플로우 3
│           └── BookmarkServiceTest.java      ← 플로우 3
├── global/
│   ├── util/
│   │   └── JWTUtilTest.java                  ← 플로우 1
│   └── filter/
│       └── CustomLogoutFilterTest.java       ← 플로우 1
└── auth/
    └── service/
        └── OAuth2UserServiceTest.java        ← 플로우 1
```

### 7-5. SecurityUtil 테스트 고려사항

`SecurityUtil`은 `SecurityContextHolder`에 의존하므로, 테스트에서 `SecurityContext`를 직접 세팅하거나 `@WithMockUser`를 사용해야 한다. 단, 단위 테스트에서는 SecurityUtil을 호출하는 Service 메서드를 테스트하므로, SecurityUtil 자체를 mock하면 된다.

### 7-6. 3차 이후 확장 (현재 미적용)

| 기술 | 시기 | 대상 |
|------|------|------|
| @DataJpaTest + H2 | 커스텀 Repository 쿼리 추가 시 | 복잡 JPQL, 네이티브 쿼리 |
| @SpringBootTest + TestContainers | 안정성/트래픽 요구 시 | 전체 API 흐름 통합 테스트 |
| @WebMvcTest Security 테스트 | JWTFilter 변경 시 | Security 필터 체인 동작 |

---

## 8. 실행 절차

### 단계 1: Gradle 설정 변경

**파일**: `build.gradle.kts`

기존 `tasks.withType<Test>` 블록을 아래로 교체:

```kotlin
// 기존 코드 삭제:
// tasks.withType<Test> {
//     useJUnitPlatform()
// }

// 일반 테스트: bugfix 제외 (리팩토링 전 브랜치에서 실행)
tasks.test {
    useJUnitPlatform {
        excludeTags("bugfix")
    }
    reports.junitXml.required.set(true)
}

// bugfix 테스트만 실행 (머지 후 버그 수정 검증)
tasks.register<Test>("testBugfix") {
    group = "verification"
    description = "Runs only @Tag(\"bugfix\") tests"
    useJUnitPlatform {
        includeTags("bugfix")
    }
    reports.junitXml.required.set(true)
}
```

**확인**: `./gradlew tasks --group=verification` 실행 → `test`, `testBugfix` 두 태스크 확인

---

### 단계 2: 테스트 파일 생성

`test/pre-refactor` 브랜치 (현재 브랜치)에서 아래 파일들을 생성한다.
모든 테스트 파일은 리팩토링 **전** 코드(`e6d7fe9` 커밋) 기준으로 작성한다.

#### 생성할 파일 목록

```
src/test/java/com/king/backend/
├── domain/
│   ├── user/
│   │   ├── service/
│   │   │   ├── UserServiceTest.java           ← 플로우 1, 2
│   │   │   └── OAuth2UserServiceTest.java     ← 플로우 1
│   │   ├── jwt/
│   │   │   └── JWTUtilTest.java               ← 플로우 1
│   │   └── CustomLogoutFilterTest.java        ← 플로우 1
│   └── curation/
│       └── service/
│           ├── CurationServiceTest.java       ← 플로우 3
│           └── BookmarkServiceTest.java       ← 플로우 3
```

각 파일의 테스트 대상 메서드와 Mock 대상은 아래와 같다:

#### 2-1. `UserServiceTest.java`

- **위치**: `src/test/java/com/king/backend/domain/user/service/UserServiceTest.java`
- **Mock 대상**: `UserRepository`, `JWTUtil`, `TokenService`, `RedisUtil`
- **테스트 메서드**:

| 메서드 | 테스트 | 태그 |
|--------|--------|------|
| `tokenRefresh()` | 유효한 refreshToken → 새 accessToken 반환 | — |
| `tokenRefresh()` | 만료된 refreshToken → 예외 발생 | — |
| `tokenRefresh()` | maxAge가 초 단위로 설정되는지 확인 | `@Tag("bugfix")` |
| `signup()` | 정상 가입 → ROLE_REGISTERED 전환, 닉네임 저장 | — |
| `signup()` | 중복 닉네임 → 예외 발생 | — |
| `patchUser()` | 닉네임만 변경 → 토큰 재발급 없음 | — |
| `patchUser()` | language 변경 → 토큰 재발급 | — |
| `patchUser()` | 중복 닉네임 → 예외 발생 | — |
| `deleteUser()` | 정상 탈퇴 → 상태 변경 + refreshToken 삭제 | — |
| `checkNicknameDuplication()` | 미사용 닉네임 → 사용 가능 | — |
| `checkNicknameDuplication()` | 사용 중인 닉네임 → 예외 발생 | — |

#### 2-2. `OAuth2UserServiceTest.java`

- **위치**: `src/test/java/com/king/backend/domain/user/service/OAuth2UserServiceTest.java`
- **Mock 대상**: `UserRepository`
- **테스트 메서드**:

| 메서드 | 테스트 | 태그 |
|--------|--------|------|
| `loadUser()` | 기존 유저 → 기존 User 반환 | — |
| `loadUser()` | 신규 유저 → 새 User 생성 후 반환 | — |
| `loadUser()` | userEntity null 시 NPE 발생하지 않는지 | `@Tag("bugfix")` |

#### 2-3. `JWTUtilTest.java`

- **위치**: `src/test/java/com/king/backend/domain/user/jwt/JWTUtilTest.java`
- **Mock 대상**: 없음 (JWTUtil 자체 테스트, 테스트용 secretKey 사용)
- **테스트 메서드**:

| 메서드 | 테스트 | 태그 |
|--------|--------|------|
| `createJwt()` | 토큰 생성 → 유효한 JWT 반환 | — |
| `getUserId()` | 토큰에서 userId 추출 | — |
| `getRole()` | 토큰에서 role 추출 | — |
| `getLanguage()` | 토큰에서 language 추출 | — |
| `isExpired()` | 만료된 토큰 → true 반환 | — |
| `isExpired()` | 유효한 토큰 → false 반환 | — |

#### 2-4. `CustomLogoutFilterTest.java`

- **위치**: `src/test/java/com/king/backend/domain/user/CustomLogoutFilterTest.java`
- **Mock 대상**: `JWTUtil`, `TokenService`, `RedisUtil`
- **테스트 메서드**:

| 메서드 | 테스트 | 태그 |
|--------|--------|------|
| `doFilter()` | POST /api/logout + 유효한 토큰 → refreshToken 삭제, 200 응답 | — |
| `doFilter()` | POST /api/logout + 만료된 토큰 → 400 응답 | — |
| `doFilter()` | POST 아닌 요청 → 다음 필터로 전달 (filterChain.doFilter 호출) | — |
| `doFilter()` | Authorization 헤더 null → NPE 발생하지 않음 | `@Tag("bugfix")` |

#### 2-5. `CurationServiceTest.java`

- **위치**: `src/test/java/com/king/backend/domain/curation/service/CurationServiceTest.java`
- **Mock 대상**: `CurationListRepository`, `CurationListItemRepository`, `PlaceRepository`, `UserRepository`, `BookmarkRepository`, `SecurityUtil` (static mock 또는 SecurityContext 세팅)
- **테스트 메서드**:

| 메서드 | 테스트 | 태그 |
|--------|--------|------|
| `postCuration()` | 정상 생성 → CurationList + CurationListItem 저장 | — |
| `postCuration()` | placeIds 중복 → 예외 발생 | — |
| `postCuration()` | placeIds null → NPE 발생하지 않음 | `@Tag("bugfix")` |
| `putCuration()` | 정상 수정 → 기존 항목 삭제 후 새 항목 저장 | — |
| `putCuration()` | 본인 큐레이션 아님 → 예외 발생 | — |
| `getCurationDetail()` | 정상 조회 → 번역된 장소 정보 + 북마크 여부 포함 | — |
| `getCurationDetail()` | 존재하지 않는 큐레이션 → 예외 발생 | — |

#### 2-6. `BookmarkServiceTest.java`

- **위치**: `src/test/java/com/king/backend/domain/curation/service/BookmarkServiceTest.java`
- **Mock 대상**: `BookmarkRepository`, `CurationListRepository`, `UserRepository`
- **테스트 메서드**:

| 메서드 | 테스트 | 태그 |
|--------|--------|------|
| `postBookmark()` | 정상 등록 → Bookmark 저장 | — |
| `postBookmark()` | 이미 등록된 북마크 → 예외 발생 | — |
| `postBookmark()` | 존재하지 않는 큐레이션 → 예외 발생 | — |
| `deleteBookmark()` | 정상 해제 → Bookmark 삭제 | — |
| `deleteBookmark()` | 등록되지 않은 북마크 → 예외 발생 | — |

---

### 단계 3: 리팩토링 전 테스트 실행

`test/pre-refactor` 브랜치에서 실행:

```bash
# 1. 일반 테스트 (bugfix 제외) — 전체 통과 확인
./gradlew test

# 2. bugfix 테스트만 — 전체 실패 확인 (버그가 존재하므로)
./gradlew testBugfix
```

**기대 결과**:

| 명령 | 결과 | 의미 |
|------|------|------|
| `./gradlew test` | 전체 통과 | 원본 코드의 정상 동작을 캡처 |
| `./gradlew testBugfix` | 전체 실패 | 아직 수정되지 않은 버그 존재 증명 |

실패하는 bugfix 테스트 목록 (4건):
- `UserServiceTest.tokenRefresh_maxAge_초_단위_변환`
- `CustomLogoutFilterTest.doFilter_Authorization_헤더_null_NPE_방지`
- `OAuth2UserServiceTest.loadUser_userEntity_null_NPE_방지`
- `CurationServiceTest.postCuration_placeIds_null_NPE_방지`

**문제 발생 시**: 일반 테스트가 실패하면 테스트 코드가 원본 동작을 정확히 반영하지 못한 것이므로, 실패 원인을 분석하고 테스트를 수정한다.

---

### 단계 4: CI 워크플로우 생성

**파일**: `.github/workflows/test.yml`

```yaml
name: Test - Refactoring Verification

on:
  push:
    branches: [test/pre-refactor, refactor/hakyoung]
  pull_request:
    branches: [refactor/hakyoung]

jobs:
  unit-test:
    name: Unit Tests (리팩토링 보존)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: 17
      - run: chmod +x ./gradlew
      - run: ./gradlew test

  bugfix-test:
    name: Bugfix Tests (버그 수정 검증)
    runs-on: ubuntu-latest
    continue-on-error: true
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: 17
      - run: chmod +x ./gradlew
      - run: ./gradlew testBugfix

  summary:
    name: Test Summary
    needs: [unit-test, bugfix-test]
    runs-on: ubuntu-latest
    if: always()
    steps:
      - name: Report
        run: |
          echo "## Test Results" >> $GITHUB_STEP_SUMMARY
          echo "| Job | Status |" >> $GITHUB_STEP_SUMMARY
          echo "|-----|--------|" >> $GITHUB_STEP_SUMMARY
          echo "| Unit Tests | ${{ needs.unit-test.result }} |" >> $GITHUB_STEP_SUMMARY
          echo "| Bugfix Tests | ${{ needs.bugfix-test.result }} |" >> $GITHUB_STEP_SUMMARY
```

**확인**: push 후 GitHub Actions 탭에서 워크플로우 실행 확인

---

### 단계 5: 커밋 및 푸시 (`test/pre-refactor`)

```bash
git add build.gradle.kts
git add src/test/
git add .github/workflows/test.yml
git commit -m "test: 플로우 1~3 단위 테스트 작성 (리팩토링 전 기준)"
git push origin test/pre-refactor
```

**CI 기대 결과** (GitHub Actions):

| Job | 결과 | 표시 |
|-----|------|------|
| Unit Tests | 통과 | ✅ |
| Bugfix Tests | 실패 (허용) | ❌ (워크플로우 자체는 통과) |

---

### 단계 6: 리팩토링 브랜치에 테스트 머지

```bash
git checkout refactor/hakyoung
git merge test/pre-refactor
```

**충돌 가능 파일**: `build.gradle.kts` (Gradle 설정 변경)
- 충돌 시 단계 1의 설정을 유지하면서, `refactor/hakyoung`의 다른 변경사항도 반영

---

### 단계 7: 리팩토링 후 테스트 실행

`refactor/hakyoung` 브랜치에서 실행:

```bash
# 1. 일반 테스트 (bugfix 제외) — 전체 통과 확인 (리팩토링이 동작 보존)
./gradlew test

# 2. bugfix 테스트만 — 전체 통과 확인 (버그가 수정되었음)
./gradlew testBugfix
```

**기대 결과**:

| 명령 | 결과 | 의미 |
|------|------|------|
| `./gradlew test` | 전체 통과 | 리팩토링이 기존 동작을 보존함 |
| `./gradlew testBugfix` | 전체 통과 | 버그 수정이 실제로 적용됨 |

**문제 발생 시**:
- 일반 테스트 실패 → 리팩토링이 기존 동작을 깨뜨린 것. 리팩토링 코드를 수정해야 함
- bugfix 테스트 실패 → 버그 수정이 완전하지 않은 것. 수정 코드를 재확인

---

### 단계 8: 테스트 코드 조정 (필요 시)

리팩토링으로 내부 구조가 변경된 경우(메서드 시그니처, 클래스 분리 등), 테스트 코드를 리팩토링 후 구조에 맞게 조정한다.

**조정이 필요한 경우**:
- `SecurityUtil` 추출로 인해 mock 대상이 변경된 경우
- `issueTokens()` 헬퍼 추출로 반환 타입이 `AuthResult<T>`로 변경된 경우
- `validateAndTrimNickname()` 헬퍼 추출로 검증 흐름이 변경된 경우

**조정 원칙**: 테스트의 **입력과 기대 출력은 동일**하게 유지하고, mock 설정만 새 구조에 맞게 변경한다.

---

### 단계 9: 커밋 및 푸시 (`refactor/hakyoung`)

```bash
git add src/test/
git commit -m "test: 리팩토링 후 테스트 조정 및 전체 통과 확인"
git push origin refactor/hakyoung
```

**CI 기대 결과** (GitHub Actions):

| Job | 결과 | 표시 |
|-----|------|------|
| Unit Tests | 통과 | ✅ |
| Bugfix Tests | 통과 | ✅ |

---

### 단계 10: 정리

모든 테스트가 통과한 후 최종 정리:

#### 10-1. `@Tag("bugfix")` 제거

각 테스트 파일에서 `@Tag("bugfix")` 어노테이션 제거 (4곳):
- `UserServiceTest.java` — `tokenRefresh_maxAge_초_단위_변환()`
- `CustomLogoutFilterTest.java` — `doFilter_Authorization_헤더_null_NPE_방지()`
- `OAuth2UserServiceTest.java` — `loadUser_userEntity_null_NPE_방지()`
- `CurationServiceTest.java` — `postCuration_placeIds_null_NPE_방지()`

#### 10-2. `build.gradle.kts` 원복

```kotlin
// 아래로 되돌리기:
tasks.withType<Test> {
    useJUnitPlatform()
}

// 삭제: excludeTags, testBugfix 태스크, reports 설정
```

#### 10-3. CI 워크플로우 정리

`.github/workflows/test.yml`에서:
- `bugfix-test` job 삭제
- `continue-on-error` 삭제
- `summary` job에서 bugfix 관련 행 삭제

#### 10-4. 최종 확인

```bash
./gradlew test
# → @Tag("bugfix")가 제거되었으므로, bugfix 테스트 포함 전체 통과
```

#### 10-5. 최종 커밋

```bash
git add build.gradle.kts src/test/ .github/workflows/test.yml
git commit -m "chore: bugfix 태그 및 테스트 분리 설정 제거 (전체 테스트 통합)"
git push origin refactor/hakyoung
```
