# 테스트 전략 검토

## 배경

플로우 1~3 리팩토링 완료 후, 수정된 코드가 기존 동작을 깨뜨리지 않았는지 검증할 방법이 없음. 프로젝트에 테스트가 없는 상태.

## 수정 유형 분류

| 유형 | 예시 | 비고 |
|------|------|------|
| **리팩토링** | SecurityUtil 추출, 책임 이동 (Controller→Service), issueTokens() 헬퍼 추출 | 동작 변경 없어야 함 |
| **버그 수정** | NPE 방지, refreshToken maxAge 단위, CORS exposedHeaders, JWT 이중 파싱 | 동작이 의도적으로 변경됨 |

---

## 방식 1: TDD — 리팩토링 전 코드에서 테스트 작성 후 적용 ← 선택

```
리팩토링 전 커밋에서 브랜치 → 테스트 작성 (기존 동작 캡처) → 리팩토링 브랜치에 머지 → 테스트 통과 확인
```

**장점**:
- 리팩토링이 기존 동작을 깨뜨리지 않았음을 **실제로 증명**
- 원본 코드의 동작을 기준으로 잡으므로, AI 수정 코드를 맹신하지 않음
- 버그 수정 건은 리팩토링 전 코드에서 테스트가 실패 → 리팩토링 후 통과로 버그 수정도 검증

**단점**:
- 버그 수정과 리팩토링이 섞인 경우 테스트 설계가 약간 복잡
- 리팩토링 전 코드로 체크아웃해서 작업해야 함

**버그 수정 건 처리 — `@Tag("bugfix")` 방식 채택**:

`@Disabled`는 해제해야 할 테스트가 누락될 위험이 있음. 대안 비교:

| 기준 | @Tag("bugfix") | bugfix 전용 패키지 |
|------|---------------|-------------------|
| 누락 방지 | `includeTags`로 일괄 실행 가능 | 패키지 단위로 확인 |
| 테스트 위치 | 관련 Service 테스트 옆 → 맥락 유지 | 별도 패키지 → 원래 Service와 분리 |
| 머지 후 전환 | 태그만 제거 | 파일 이동 필요 |
| CI 연동 | Gradle `includeTags`/`excludeTags` 기본 지원 | 패키지 필터링 별도 설정 |

**결정: `@Tag("bugfix")`** — 맥락 유지 + 태그 제거만으로 전환 + Gradle 기본 지원

**리팩토링 전 브랜치에서**:
```java
@Tag("bugfix")
@Test
void tokenRefresh_maxAge_초_단위_변환() {
    // 리팩토링 전 코드에서는 밀리초 단위로 실패
}
```

**Gradle 설정** (`build.gradle.kts`):
```kotlin
// 기본 테스트: bugfix 제외 (리팩토링 전 브랜치용)
tasks.test {
    useJUnitPlatform {
        excludeTags("bugfix")
    }
}

// bugfix 테스트만 실행 (머지 후 검증용)
tasks.register<Test>("testBugfix") {
    useJUnitPlatform {
        includeTags("bugfix")
    }
}
```

**실행**:
```bash
# 리팩토링 전: 일반 테스트만 (bugfix 제외)
./gradlew test

# 머지 후: bugfix 테스트만 (수정 검증)
./gradlew testBugfix

# 머지 후: 전체 (태그 제거 후)
./gradlew test
```

**머지 후 절차**:
1. `./gradlew testBugfix` → bugfix 테스트가 통과하는지 확인 (버그가 수정되었음을 증명)
2. 각 테스트에서 `@Tag("bugfix")` 제거
3. `./gradlew test` → 전체 테스트 통과 확인
4. `build.gradle.kts`에서 `testBugfix` 태스크 제거

---

## 방식 2: Characterization Test — 리팩토링 후 현재 동작을 기준으로 테스트

```
현재(리팩토링 완료) 코드 기준으로 테스트 작성 → 통과 확인 → 이후 변경 시 회귀 방지
```

**장점**:
- 작업 흐름이 단순 (현재 코드에서 바로 테스트 작성)
- 앞으로의 변경에 대한 회귀 방지 안전망

**단점**:
- AI가 수정한 코드가 맞다고 가정하고 그걸 기준으로 테스트 → **검증이 아니라 추인**
- 리팩토링 전후 동작 비교를 할 수 없음
- 리팩토링 과정에서 도입된 버그를 잡지 못함

---

## 방식 3: 혼합 — 수정 유형별 분리

| 수정 유형 | 검증 방식 |
|-----------|-----------|
| **리팩토링** (SecurityUtil 추출, 책임 이동 등) | 리팩토링 전후 동일 동작 확인 (방식 1) |
| **버그 수정** (NPE, maxAge, CORS 등) | 수정 후 코드에서 올바른 동작 테스트 (방식 2) |

**장점**: 가장 정확한 검증
**단점**: 작업량이 가장 많음

---

## 결정: 방식 1

**이유**: 원본 코드 동작을 기준으로 테스트를 만들어야 "AI가 고친 코드가 원래 동작을 보존했는지" 진짜 검증이 됨. 방식 2는 AI 코드를 맞다고 전제하는 것이므로 검증이 아님.

## 실행 계획

1. 리팩토링 전 커밋(`refactor/hakyoung` 시작 전)에서 테스트 브랜치 생성
2. Service 레이어 단위 테스트 작성 (mock 기반, 외부 의존성 격리)
3. 테스트 통과 확인
4. 리팩토링 브랜치(`refactor/hakyoung`)에 테스트 머지
5. 테스트 재실행 → 리팩토링이 동작을 보존했는지 확인
6. 버그 수정 건은 `@Tag("bugfix")` → 리팩토링 전에서는 `excludeTags`로 제외 → 머지 후 `./gradlew testBugfix`로 통과 확인 → 태그 제거

### 테스트 대상 (플로우 1~3 수정 사항 기준)

| 플로우 | 테스트 대상 | 주요 검증 포인트 |
|--------|------------|-----------------|
| 1. 인증 | `UserService.tokenRefresh()` | 토큰 재발급 로직 |
| 1. 인증 | `CustomLogoutFilter` | 로그아웃 흐름 |
| 1. 인증 | `JWTUtil` | Claims 파싱 |
| 1. 인증 | `OAuth2UserService` | 유저 조회/생성 |
| 2. 유저 | `UserService.signup()` | 회원가입 |
| 2. 유저 | `UserService.patchUser()` | 프로필 수정 + 닉네임 검증 |
| 2. 유저 | `UserService.deleteUser()` | 회원탈퇴 |
| 3. 큐레이션 | `CurationService.postCuration()` | 큐레이션 생성 + placeIds 검증 |
| 3. 큐레이션 | `CurationService.putCuration()` | 큐레이션 수정 |
| 3. 큐레이션 | `CurationService.getCurationDetail()` | 상세 조회 |
| 3. 큐레이션 | `BookmarkService` | 북마크 등록/해제 |

---

## GitHub Actions CI — 리팩토링 전후 테스트 결과 비교

### 목표

CI에서 리팩토링 전후 테스트 결과 차이를 시각적으로 확인:
- **리팩토링 전**: 일반 테스트 통과, bugfix 테스트 **실패** (버그가 존재하므로)
- **리팩토링 후**: 일반 테스트 통과, bugfix 테스트 **통과** (버그가 수정되었으므로)

### 핵심 문제: bugfix 실패를 어떻게 보여줄 것인가

`excludeTags("bugfix")`로 제외하면 CI에서 "스킵"으로 표시될 뿐 "실패"로 보이지 않음.
bugfix 테스트가 리팩토링 전에서 실패하는 것을 **의도적으로 보여줘야** 전후 비교가 의미 있음.

### CI 워크플로우 설계

```yaml
# .github/workflows/test.yml

name: Test - Refactoring Verification

on:
  push:
    branches: [test/pre-refactor, refactor/hakyoung]
  pull_request:
    branches: [refactor/hakyoung]

jobs:
  # Job 1: 일반 테스트 (리팩토링 보존 검증)
  unit-test:
    name: Unit Tests (리팩토링 보존)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: 17
      - run: ./gradlew test
      # 리팩토링 전/후 모두 통과해야 함

  # Job 2: bugfix 테스트 (버그 수정 검증)
  bugfix-test:
    name: Bugfix Tests (버그 수정 검증)
    runs-on: ubuntu-latest
    continue-on-error: true  # 리팩토링 전에서는 실패 허용
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: 17
      - run: ./gradlew testBugfix
      # 리팩토링 전: 실패 (expected) → 빨간 X 표시되지만 워크플로우는 통과
      # 리팩토링 후: 통과 → 초록 체크

  # Job 3: 결과 요약
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

### CI 결과 예상

**리팩토링 전 브랜치 (`test/pre-refactor`)**:

| Job | 결과 | 의미 |
|-----|------|------|
| Unit Tests | ✅ 통과 | 기존 동작 정상 |
| Bugfix Tests | ❌ 실패 (허용) | 버그가 존재함을 증명 |

**리팩토링 후 브랜치 (`refactor/hakyoung`)**:

| Job | 결과 | 의미 |
|-----|------|------|
| Unit Tests | ✅ 통과 | 리팩토링이 기존 동작 보존 |
| Bugfix Tests | ✅ 통과 | 버그가 수정되었음을 증명 |

### `continue-on-error` 역할

- `bugfix-test` job에 `continue-on-error: true` 설정
- 리팩토링 전 브랜치에서 bugfix 테스트가 실패해도 **워크플로우 전체는 통과** (의도된 실패이므로)
- 하지만 해당 job 자체는 **❌ 빨간 X로 표시** → "이 버그는 아직 안 고쳐졌다"가 시각적으로 보임
- 리팩토링 후 브랜치에서는 통과 → **✅ 초록 체크** → "버그가 수정되었다"

### 브랜치 흐름

```
develop (리팩토링 전)
  └── test/pre-refactor (테스트 작성)
        │   CI: unit-test ✅, bugfix-test ❌
        │
        └── refactor/hakyoung (테스트 머지 + 리팩토링 코드)
              CI: unit-test ✅, bugfix-test ✅
```

### Gradle 설정 (`build.gradle.kts`)

기존 제안에 테스트 리포트 설정 추가:

```kotlin
tasks.test {
    useJUnitPlatform {
        excludeTags("bugfix")
    }
    reports.junitXml.required.set(true)  // CI에서 결과 파싱용
}

tasks.register<Test>("testBugfix") {
    useJUnitPlatform {
        includeTags("bugfix")
    }
    reports.junitXml.required.set(true)
}
```

### 주의사항

1. **인프라 불필요** — 단위 테스트(Mockito mock)이므로 CI에서 MySQL/Redis/ES 없이 실행 가능
2. **리팩토링 후 최종 정리** — bugfix 테스트 전체 통과 확인 후:
   - `@Tag("bugfix")` 제거
   - `build.gradle.kts`에서 `excludeTags`, `testBugfix` 태스크 제거
   - CI 워크플로우에서 `bugfix-test` job 제거
   - `continue-on-error` 제거
3. **테스트 리포트 업로드** — 필요 시 `actions/upload-artifact`로 HTML 리포트 업로드 가능
