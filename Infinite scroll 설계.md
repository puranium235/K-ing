# Infinite Scroll(무한 스크롤) 설계

## 목적
- 무한 스크롤의 애니메이션/부드러운 스크롤 연출

## 방법

### Pagination(BE)
- 페이지 번호를 요청 시, 페이지 당 고정된 갯수를 반환.
- 명시적인 경계가 있기에 연속 스크롤 느낌 제공 어려움.

### Slice & Cursor(BE)
- 마지막으로 불러온 데이터의 위치를 기준으로 다음 데이터를 가져옴.
- 데이터베이스에서는 일반적으로 offset 혹은 "커서 기반 페이징" 사용, 클라이언트는 마지막 항목의 고유 값을 반환하여, 이 값을 기준으로 다음 데이터를 요청
- 새로운 데이터가 삽입되거나 삭제되어도 "커서"를 기반으로 하기 때문에 중복이나 누락 발생 가능성 적음.
- 스크롤 시 부드러운 연속성 연출 가능.

#### 작동 방식
1. 클라이언트가 데이터를 최초로 요청할 때는 커서를 생략하고 서버는 가장 최신 데이터 또는 특정 기준으로 정렬된 첫 번째 데이터 집합을 반환합니다. 이와 함께 클라이언트에 "다음 요청 시 사용할 커서"도 반환.
2. 클라이언트는 이전 응답에서 받은 커서를 포함하여 추가 데이터를 요청. 서버는 해당 커서 이후의 데이터를 찾아 반환하고, 다시 새로운 커서를 함께 제공.
3. 사용자가 계속 스크롤하거나 더 많은 데이터를 요청하면, 클라이언트는 계속 업데이트된 커서를 이용하여 추가 데이터를 요청.
```http
GET /api/posts?cursor=20251020235959_1234&limit=20
```

#### 구현 시 고려사항
- 정렬 기준 : 데이터를 어떤 순서를 기준으로 정렬할지.
- 커서의 불투명성 : 클라이언트가 내부 구현 세부사항을 알 수 없도록 커서 값을 암호화하거나 인코딩.
- 데이터 일관성 : 데이터베이스에서 데이터가 추가되거나 삭제되면 커서는 "마지막으로 본 데이터"의 위치를 기준으로 하기 때문에 추가된 데이터가 상단에 노출되어도 기존 페이지에서는 문제 없이 동작하지만 사용자 경험 측면에서 "새로운 데이터 알림"같은 별도의 UX를 고려할 수 있음.
- 클라이언트와 서버의 동기화 : 클라이언트는 각 요청마다 받은 커서를 저장하고, 다음 요청 시 올바르게 전달해야 함. 또한 잘못된 커서 값이나 만료된 커서에 대한 처리를 서버와 클라이언트 양쪽에서 구현해야 함.
- 성능 : 커서로 사용할 필드에 인덱스를 설정하면 쿼리 성능 개선 가능.

### Infinite Loading with Intersection Obeserver(FE)
- 브라우저에서 특정 요소가 뷰포트(화면)에 진입하는지 감지하는 기능을 제공.
- 사용자가 스크롤하여 페이지 하단에 도달할 때 자동으로 다음 데이터를 요청하도록 구현
- 자연스러운 스크롤 페이지를 제공하며 스크롤 이벤트를 매번 체크하지 않아 성능면에서 유리함.

## 큐레이팅 SNS에서의 설계
- 큐레이팅 SNS와 같은 웹앱에서는 사용자 경험과 데이터 일관성, 그리고 실시간 업데이트에 대한 요구가 높음.
- **커서 기반 API 설계와 Intersection Observer**를 활용한 무한 로딩 방식이 많이 쓰임

## 최신순 포스트 Cursor 기반 무한 스크롤 설계 예시
### 엔티티
```java
import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String content;

    private LocalDateTime createdAt;

    // 기본 생성자, getter/setter 생략
    public Post() {}

    public Post(String content, LocalDateTime createdAt) {
        this.content = content;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getContent() {
        return content;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
```
### Repository
```java
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    // 커서가 null이면 전체 최신순 데이터를 Pageable을 사용해 가져오고,
    // 커서가 존재하면 createdAt이 해당 커서보다 이전인 데이터를 최신순으로 정렬해서 조회.
    List<Post> findByCreatedAtBeforeOrderByCreatedAtDesc(LocalDateTime createdAt, Pageable pageable);
    
    // 커서가 없는 경우 (최초 요청)에는 전체 최신 데이터를 조회하기 위한 메서드
    List<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
```
### API 응답 DTO
```java
import java.time.LocalDateTime;
import java.util.List;

public class PostResponse {

    private List<Post> data;
    private LocalDateTime nextCursor;  // 다음 요청 시 사용할 커서 (마지막 게시글의 createdAt)

    public PostResponse(List<Post> data, LocalDateTime nextCursor) {
        this.data = data;
        this.nextCursor = nextCursor;
    }

    public List<Post> getData() {
        return data;
    }

    public LocalDateTime getNextCursor() {
        return nextCursor;
    }

    public void setData(List<Post> data) {
        this.data = data;
    }

    public void setNextCursor(LocalDateTime nextCursor) {
        this.nextCursor = nextCursor;
    }
}
```
### Controller
```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostRepository postRepository;

    // limit은 고정(예시: 20개)
    private static final int PAGE_SIZE = 20;
    // 날짜 포맷 (예: ISO_LOCAL_DATE_TIME 형식으로 전송)
    private static final DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    /**
     * 커서 기반으로 게시글 목록을 조회합니다.
     * @param cursor 문자열 형태의 LocalDateTime (예: "2025-01-18T23:59:59")
     * @return PostResponse
     */
    @GetMapping
    public PostResponse getPosts(@RequestParam(required = false) String cursor) {
        List<Post> posts;
        PageRequest pageable = PageRequest.of(0, PAGE_SIZE);

        // 최초 요청이면 cursor가 없으므로 전체 최신 데이터를 조회
        if (cursor == null || cursor.isEmpty()) {
            posts = postRepository.findAllByOrderByCreatedAtDesc(pageable);
        } else {
            // 문자열을 LocalDateTime으로 변환
            LocalDateTime cursorTime = LocalDateTime.parse(cursor, formatter);
            posts = postRepository.findByCreatedAtBeforeOrderByCreatedAtDesc(cursorTime, pageable);
        }

        // 다음 커서를 결정: 조회된 목록의 마지막 항목의 createdAt 값을 사용
        LocalDateTime nextCursor = posts.isEmpty() ? null : posts.get(posts.size() - 1).getCreatedAt();

        return new PostResponse(posts, nextCursor);
    }
}
```

