# [Issue Log] RestTemplate 자동 url 인코딩 문제
## 목차
1. 문제 상황
2. 문제 해결 방법
3. 다른 식의 접근 방법들과 비교

## 문제 상황
### 문제 발생 상황
공공 데이터 포털에서 URL과 디코딩 키를 사용하여 API를 통해 데이터에 접근하여 가져오는 과정에서 RestTemplate을 사용하였고 이 과정에서 API 접근에 실패함.

### 문제 발생 요인
Error 로그를 통해 현재 서버 구동 시 접근하는 URL을 살펴보니 api 문서에서 작동하는 url과 다르다는 점을 알게 되었고 인코딩이 일부분만 일어나는 문제가 발생했다는 점을 인지함.

## 나의 문제 해결 방법
1. url이 인코딩 되길래 처음에는 인코딩 키와 디코딩 키의 문제인줄 알고 바꿔가며 사용하였으나 소용 없었음.
2. url을 직접 인코딩 방식에 맞추어 웹 인코더를 통해서 키를 비교/대조 해보아서 잘못된 점을 깨닫고 서칭 결과 RestTemplate의 config를 설정하여 따로 RestTemplate이 인코딩을 안할 수 있도록 할 수 있다는 점을 배움.

### 나의 코드
```java
package com.king.backend.externaldata.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.DefaultUriBuilderFactory;

@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate() {
        DefaultUriBuilderFactory factory = new DefaultUriBuilderFactory();
        // 인코딩 모드를 NONE으로 설정하면 자동 인코딩을 수행하지 않습니다.
        factory.setEncodingMode(DefaultUriBuilderFactory.EncodingMode.NONE);

        RestTemplate restTemplate = new RestTemplate();
        restTemplate.setUriTemplateHandler(factory);
        return restTemplate;
    }
}
```

### 코드 설명
팩토리 패턴(Factory Pattern)은 객체 생성 로직을 캡슐화하여 클라이언트 코드와 객체 생성 로직을 분리하는 디자인 패턴이다. 이 패턴은 객체 생성의 책임을 별도의 클래스로 이전함으로써 코드의 유용성과 재사용성을 높여준다. spring에서는 팩토리 빈을 통해 생성과 설정을 관리할 수 있다.

이 때, DefaultUriBuilderFactory는 URI 빌더 팩토리로 UriBuilder 인스턴스를 생성하고 구성하는 역할을 한다. UriBuilder 클래스는 URiComponentsBuilder의 인스턴스를 만들기 위해 사용되며, RestTemplate이나 WebClient와 같은 HTTP 클라이언트에서 URL을 구성할 때 사용된다.

그렇기에 인코딩 모드를 DefaultUriBuilderFactory를 통해 None으로 설정하면서 제거할 수 있다.

RestTemplate 클래스는 HTTP 요청을 수행할 때, URI 템플릿을 처리하기 위해 UriTemplateHanlder를 사용하는데 이곳에 DefaultUriBuilderFactory를 설정하므로써 URI를 빌드할 수 있다.

## 차선책들

### URiComponentsBuilder 사용
코드 설명에서 언급했던 URiComponentsBuilder을 사용해서 URI 인코딩을 세밀하게 제어할 수 있다. 이 때, builer.build를 false로 설정함으로써 URL이 인코딩 되는 것을 방지할 수 있다.
```java
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

public class RestTemplateExample {
    public static void main(String[] args) {
        RestTemplate restTemplate = new RestTemplate();

        String baseUrl = "https://api.example.com/search";
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(baseUrl)
                .queryParam("query", "스프링 프레임워크")
                .queryParam("page", 1);

        String uri = builder.build(false).toUriString(); // 인코딩을 방지하려면 build(false) 사용

        ResponseEntity<String> response = restTemplate.getForEntity(uri, String.class);
        System.out.println(response.getBody());
    }
}
```

### URI 객체 직접 생성
URI를 객체를 직접 생성함으로써 RestTemplate에 전달하면 자동 인코딩을 방지할 수 있으며 URL의 각 부분을 세부적으로 통제가 가능하다.
```java
import java.net.URI;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

public class RestTemplateURIExample {
    public static void main(String[] args) throws Exception {
        RestTemplate restTemplate = new RestTemplate();

        String url = "https://api.example.com/search?query=스프링 프레임워크&page=1";
        URI uri = new URI("https", "api.example.com", "/search", "query=스프링 프레임워크&page=1", null);

        ResponseEntity<String> response = restTemplate.getForEntity(uri, String.class);
        System.out.println(response.getBody());
    }
}
```

### Spring WebClient
RestTemplate은 개발이 더 이상 지원이 안되서 비동기와 반응형 프로그래밍을 지원하는 WebClient를 권장하고 있다고 한다.
```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.DefaultUriBuilderFactory;

@Configuration
public class WebClientConfig {

    @Bean
    public WebClient webClient() {
        DefaultUriBuilderFactory uriBuilderFactory = new DefaultUriBuilderFactory();
        uriBuilderFactory.setEncodingMode(DefaultUriBuilderFactory.EncodingMode.NONE);

        return WebClient.builder()
                .uriBuilderFactory(uriBuilderFactory)
                // 추가 설정 (필터, 인터셉터 등)
                .build();
    }
}
```
