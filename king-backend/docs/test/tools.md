# 테스트 도구 및 테스트 단위 검토

## 현재 상태

- `spring-boot-starter-test` 포함 (JUnit 5, Mockito, AssertJ 기본 제공)
- `spring-security-test` 포함
- 테스트 코드: 빈 `contextLoads()`만 존재

---

## 1. 테스트 도구 비교

### A. JUnit 5 + Mockito (이미 포함)

의존성 추가 없이 바로 사용 가능. Service 레이어의 의존성을 mock으로 대체하여 순수 로직만 테스트.

```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    @Mock UserRepository userRepository;
    @Mock JWTUtil jwtUtil;
    @InjectMocks UserService userService;

    @Test
    void signup_정상_동작() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        // ...
    }
}
```

**장점**:
- 의존성 추가 불필요 (이미 포함)
- 빠름 (Spring Context 로딩 없음, 테스트 하나당 ~ms)
- 외부 인프라(MySQL, Redis, ES) 없이 실행 가능
- 우리 목적(리팩토링 전후 동작 비교)에 가장 적합

**단점**:
- Mock 설정이 많아질 수 있음 (Repository, Util 등 모두 mock)
- 실제 DB 쿼리, 트랜잭션 동작은 검증 못 함
- Mock이 실제 구현과 다르게 동작하면 "테스트는 통과하지만 실제론 실패"하는 경우 가능

---

### B. @WebMvcTest (이미 포함)

Controller 레이어만 슬라이스 로딩. HTTP 요청/응답 형식, 상태 코드, Security 설정 검증.

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

**장점**:
- Controller의 요청 매핑, 응답 형식, HTTP 상태 코드 검증 가능
- Security 필터 체인 동작 검증 가능 (`@WithMockUser`, JWT 필터 등)
- Service는 `@MockBean`으로 대체 → 인프라 불필요

**단점**:
- Spring Context 부분 로딩 → 단위 테스트보다 느림 (~초)
- SecurityConfig, JWTFilter 등 설정 클래스와 엮이면 추가 설정 필요
- Service 로직 자체는 검증 못 함

---

### C. @DataJpaTest (이미 포함)

JPA Repository 레이어만 슬라이스 로딩. 실제 쿼리 동작 검증.

```java
@DataJpaTest
class UserRepositoryTest {
    @Autowired UserRepository userRepository;

    @Test
    void findByGoogleId_정상_조회() {
        User user = userRepository.save(new User(...));
        Optional<User> found = userRepository.findByGoogleIdAndStatusIn(...);
        assertThat(found).isPresent();
    }
}
```

**장점**:
- 실제 JPA 쿼리 동작 검증 (JPQL, 네이티브 쿼리, 메서드 이름 기반 쿼리 등)
- H2 인메모리 DB 사용 가능 → MySQL 없이 실행
- 트랜잭션 자동 롤백

**단점**:
- H2와 MySQL 방언 차이로 특정 쿼리가 다르게 동작할 수 있음
- H2 의존성 추가 필요 (`testImplementation("com.h2database:h2")`)
- Repository 커스텀 쿼리가 적으면 가성비 낮음

---

### D. @SpringBootTest (이미 포함)

전체 Spring Context 로딩. 통합 테스트.

```java
@SpringBootTest
@AutoConfigureMockMvc
class IntegrationTest {
    @Autowired MockMvc mockMvc;

    @Test
    void 전체_흐름_테스트() { ... }
}
```

**장점**:
- 실제 Bean 조합으로 동작하므로 가장 현실적인 테스트
- 레이어 간 연동 문제 발견 가능

**단점**:
- MySQL, Redis, ES 모두 실행 중이어야 함 (또는 TestContainers 필요)
- 느림 (전체 Context 로딩 수~십초)
- 현재 프로젝트는 ES, Redis, OAuth2 설정이 필수라 Context 로딩 자체가 실패할 가능성 높음
- 환경 세팅 비용이 높아 초기 도입에 부적합

---

### E. TestContainers (추가 의존성 필요)

Docker로 MySQL, Redis, ES를 테스트 시 자동으로 띄우고 끔.

```java
@Testcontainers
@SpringBootTest
class IntegrationTest {
    @Container
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0");
}
```

**장점**:
- 실제 인프라와 동일한 환경에서 테스트
- CI/CD에서도 Docker만 있으면 실행 가능

**단점**:
- Docker 필수 (로컬 개발 환경에 Docker Desktop 필요)
- 느림 (컨테이너 기동 시간 추가)
- 의존성 추가 + 설정 복잡도 높음
- 우리 목적(리팩토링 검증)에 비해 과도한 구성

---

## 2. 테스트 단위 비교

### 단위 테스트 (Unit Test) — Service 메서드 단위

```
테스트 범위: Service 클래스 하나
의존성: 모두 Mock
```

| 장점 | 단점 |
|------|------|
| 가장 빠름 (~ms) | Mock 설정 보일러플레이트 |
| 인프라 불필요 | 실제 DB/Redis 동작 미검증 |
| 리팩토링 전후 비교에 최적 | 레이어 간 연동 미검증 |
| 실패 시 원인 특정 쉬움 | Mock이 실제와 다를 수 있음 |

**적합한 대상**: `UserService.signup()`, `CurationService.postCuration()` 등 비즈니스 로직

---

### 슬라이스 테스트 (Slice Test) — 레이어 단위

```
테스트 범위: Controller만 (@WebMvcTest) 또는 Repository만 (@DataJpaTest)
의존성: 해당 레이어만 로딩, 나머지 Mock
```

| 장점 | 단점 |
|------|------|
| 레이어별 정확한 검증 | 단위 테스트보다 느림 |
| Controller: HTTP 매핑, 응답 형식, Security | Context 부분 로딩 설정 필요 |
| Repository: 실제 쿼리 검증 | H2 의존성 추가 필요 (DataJpaTest) |

**적합한 대상**: Controller 응답 형식, Security 필터, 커스텀 Repository 쿼리

---

### 통합 테스트 (Integration Test) — API 엔드포인트 단위

```
테스트 범위: Controller → Service → Repository 전체
의존성: 실제 Bean (+ 실제 DB 또는 TestContainers)
```

| 장점 | 단점 |
|------|------|
| 가장 현실적인 검증 | 인프라 필수 (MySQL, Redis, ES) |
| 레이어 간 연동 문제 발견 | 가장 느림 |
| 실제 트랜잭션 동작 검증 | 환경 세팅 비용 높음 |
| | 실패 시 원인 특정 어려움 |

**적합한 대상**: 전체 흐름 검증, 트랜잭션 경계 검증

---

## 3. 도구 × 단위 조합 정리

| 조합 | 속도 | 인프라 필요 | 리팩토링 검증 | 도입 난이도 |
|------|------|------------|--------------|------------|
| **JUnit+Mockito 단위 테스트** | 매우 빠름 | 없음 | 최적 | 낮음 |
| **@WebMvcTest 슬라이스** | 빠름 | 없음 | Controller 변경분 | 중간 |
| **@DataJpaTest 슬라이스** | 보통 | H2 추가 | Repository 변경분 | 중간 |
| **@SpringBootTest 통합** | 느림 | MySQL+Redis+ES | 전체 흐름 | 높음 |
| **TestContainers 통합** | 느림 | Docker | 전체 흐름 | 높음 |

---

## 4. 우리 상황에서의 권장 조합

### 1차: JUnit 5 + Mockito 단위 테스트 (즉시 적용)

**이유**:
- 의존성 추가 불필요 (이미 포함)
- 인프라 없이 실행 가능 → 리팩토링 전 커밋에서도 바로 작성+실행
- 리팩토링 전후 "같은 입력 → 같은 출력" 비교에 가장 적합
- 테스트 하나당 ms 단위 → 빠른 피드백 루프

**대상**: 플로우 1~3의 Service 메서드 (수정한 부분 위주)

### 2차: @WebMvcTest (Controller 변경분 검증 시)

**이유**:
- 플로우 1에서 Controller 책임 분리(`buildAuthResponse()` 등)를 했으므로, HTTP 응답 형식이 유지되는지 검증
- Security 필터(JWTFilter, CustomLogoutFilter) 동작 검증

**대상**: `UserController`, `CurationController`의 응답 형식 + 상태 코드

### 3차 이후 (필요 시):

- `@DataJpaTest` — 커스텀 Repository 쿼리 검증 (현재 우선순위 낮음)
- `@SpringBootTest + TestContainers` — 전체 통합 테스트 (트래픽/안정성 요구 시)
