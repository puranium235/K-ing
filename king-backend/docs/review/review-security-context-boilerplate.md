# SecurityContext 보일러플레이트 반복 이슈

## 현상

아래 2줄짜리 코드가 서비스 전체에 약 20회 이상 반복된다:

```java
Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
OAuth2UserDTO oauthUser = (OAuth2UserDTO) authentication.getPrincipal();
```

## 해당 파일 목록

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
| user | UserController | 1회 |
| user | UserService | 별도 패턴 |

## 수정 방향 (검토 필요)

유틸 메서드로 추출하여 한 줄로 호출:

```java
// 예: UserUtil 또는 SecurityUtil에 추가
public static OAuth2UserDTO getCurrentUser() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    return (OAuth2UserDTO) authentication.getPrincipal();
}

// 서비스에서 사용
OAuth2UserDTO user = SecurityUtil.getCurrentUser();
```

## 비고

- JWT 파싱 중복과는 별개 이슈 — 여기서는 이미 JWTFilter가 파싱한 결과를 SecurityContext에서 꺼내는 것이므로 성능 이슈는 없음
- 순수 코드 중복 / 가독성 문제
