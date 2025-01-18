## 목차
1. [기본 개념](##-기본-개념)
2. [로그인 시스템 설계 종류](##-로그인-시스템-설계-종류)

## 기본 개념

### 기본적인 OAuth2.0 흐름(sequence diagram)
![oauth2.0-process](/uploads/5c63fc482fa38bca0e6e526673fc96a3/oauth2.0-process.png)

#### 1 ~ 2 : 로그인 요청
- Resource Owner(사용자)가 client(spring boot 서버)에 'XX로 로그인하기'를 버튼을 눌러 로그인 요청.
- client는 OAuth 프로세스를 시작하기 위해 사용자의 브라우저를 Authorization Server로 보냄.
- 클라이언트는 이 때 Authorization Server가 제공하는 Authorization URL에 다음의 매개변수를 스트링으로 포함하여 보냄.
   - response_type : 반드시 code로 값 설정.
   - client_id : 애플리케이션을 생성했을 때 발급받은 Client ID
   - redirect_uri : 애플리케이션을 생성할 때 등록한 Redirect URI
   - scope : 클라이언트가 부여받은 리소스 접근 권한.
#### 3 ~ 4 : 로그인 페이지 제공 & ID/PW 제공
- client가 빌드한 Authorization URL로 이동된 Resource Owner는 제공된 로그인 페이지에서 ID와 PW 등을 입력하여 인증(예: 구글 로그인 폼으로 이동하여 로그인)
#### 5 ~ 6 : Authorization Code 발금, Redirect URI로 리다렉트
- 인증이 성공되면 Authorization Server는 제공된 Redirect URI로 사용자를 redirect 시킴. 이때, Redirect URI에 Authorization Code를 포함하여 사용자를 redirect 시킴.
- 이 때, Authorization Code는 Client가 Access Token을 획득하기 위해 사용하는 임시 코드.
- 여기서 바로 Access Token을 전달하지 않고 Authorization Code를 통해 전달하는 이유는 Access Token을 바로 전달하기 위해 Redirect URI를 사용하는 방법밖에 없는데 이 때 URI에 실어 전달하면 노출되기 때문이다. 
#### 7 ~ 8 : Authorization Code와 Access Token 교환
- Client는 Authorization Server에 Authorization Code를 전달하고, Access Token을 받아옴.
- Client는 발급받은 Resource Owner의 Access Token을 저장(DB에 저장장). 이 토큰은 이후 Resource Server에서 Resource Owner의 리소스에 접근하기 위해 사용됨.
#### 9 : 로그인 성공
- 1 ~ 8의 과정이 성공적으로 끝나면 Client가 Resource Owner에게 로그인 성공을 알림.
#### 10 : Access Token으로 리소스 접근
- 이후에는 Resource Owner의 Access Toekn으로 제한된 리소스에 접근.
#### 참고
https://hudi.blog/oauth-2.0/

### OpenID Connect(OIDC) 흐름
#### 개념 용어
- IdP (Identity Provider) : IdP는 구글, 카카오와 같이 OpenID 서비스를 제공하는 당사자.
- RP (Relying Party) : 사용자를 인증하기 위해 IdP에 의존하는 주체. 'XXX으로 로그인하기' 등의 기능을 제공하는 서비스
#### OIDC는 OAuth 2.0의 확장
- OAuth2.0은 인가(Authorization)을 위한 것이며 OIDC는 인증(Authentication)을 위해 필요한 OAuth2.0위에서 동작하는 ID 계층이다.
- OAuth2.0도 과정 중에 인증을 제공하지만 핵심 목적은 Access Token을 통한 인가(Authorization)이다.
- Open ID Connect를 사용하면 클라이언트는 ID 토큰을 획들할 수 있고 이 ID 토큰에는 사용자에 대한 신원 정보가 담겨있다.
- OIDC 없이 사용자 프로필 정보를 리소스 서버로부터 가져올 수 있으나 OAuth2.0 단독으로 사용자 리소스를 가지고 오기 위해서는 OIDC를 사용할 때의 2배의 통신을 해야한다. 즉, Access Token을 발급 받은 다음 이 토큰을 사용하여 리소스를 다시 요청하여 받아와야하지만, OIDC를 사용하면 Acces Token과 함께 전달받은 ID Token을 복호화하여 사용자 정보를 가져오면 끝이다.

#### OIDC 인증 과정
- OIDC는 OAuth2.0을 확장하여 동작하는데 이 때 Scope(리소스 서버에 접근할 수 있는 제한 범위에 대한 내용)로 openid 값이 포함되어 들어오면, 액세스 토큰과 함께 사용자 인증에 대한 정보를 ID Token이라고 불리는 JWT로 반환.

#### 참고
https://hudi.blog/open-id/

### API 호출
- 발급받은 Access Token을 이용하여 Resource Server의 기능을 핸들링하려면 Resource Server에서 제공하는 방식대로 핸들링해야 하는데 이 방식을 API(Application programming Interface)라고 한다.

## 로그인 시스템 설계 종류

### 하이브리드 인증 방식
- 가장 소셜 로그인에서 대표적으로 쓰이는 방식
- 대신 구현 복잡도가 비교적 높음
- 다음의 두가지 방식의 결합
1. 외부 인증 : OAuth2.0와 OIDC와 같은 외부 인증
2. 내부 인증 (Internal Session/Token Management) : 외부 인증이 완료 된 후, 자체 서버에서 인증 절차를 관리. 이를 통해 지속적인 인증 상태 유지(자동 로그인 : remember me), 권한 관리, 사용자 식별 등을 수행

#### 세부 흐름
1. 첫 로그인 시, 기본 개념에 나와있는 절차대로 Client(우리한테는 Spring boot 서버)로 Id Token 및 Access Token을 가져옴. 즉, 초기 절차를 외부 제공자에 맡김.
2. Id Token을 검증하여 사용자의 신원을 확인하고 필요한 경우 추가 사용자 정보를 외부 제공자로 부터 가져옴.
3. 2번의 검증된 사용자 정보를 바탕으로 자체적으로 Session 및 JWT Provider를 두어 발급하여 이를 이후 인증에 사용함.
4. 이 후, 재방문이나 새로운 요청 시에는 3번의 토큰이나 세션을 사용함. 이 때의 토큰은 1~2번에서 외부 제공자가 제공하는 토큰이 아닌 제작자의 서버 자체적으로 인증을 위해 발급한 토큰임. Access Token의 유효 기간이 짧은 경우, Refresh token을 사용하여 Access Token을 발급함.

#### 장점
- 초기 인증 절차를 외부 제공자에 맡겨 보안적으로 뛰어남.
- 초기 인증 이후에는 외부 제공자 의존하지 않으므로 의존성을 줄일 수 있음.
- 외부 인증 제공자의 인증 과정을 사용한 간편함과 이후에는 자동 로그인을 통해 편리한 접근이 가능.

#### 단점
- 외부 인증과 내부 인증을 두기 때문에 복잡함.
- 내부 세션이나 토큰을 안전하게 저장하기 위한 추가 적인 보안 조치가 필요. 세션 하이재킹이나 토큰 암호화, Secure 쿠키 설정 등
- 토큰 동기화 문제를 고려해야 하는데 이는 외부 제공자의 토큰 정책과 내부 토큰 정책이 다를 수 있기 때문에 이를 관리할 로직이 필요.

### 순수 외부 인증 방식 (Pure External Authentication)
- 단순히 모든 Authentication과 Authorization을 외부 제공자에 맡기는 방식.
- 매 요청마다 외부 제공자를 통해 토큰의 유효성을 확인하는 방식.

#### 세부 흐름
1. 로그인 시, 기본 개념에 나와있는 Oauth2.0 흐름과 동일하게 AccessToken과 Id Token을 받은 후 이를 클라이언트(사용자)로 넘김.
2. 사용자가 이후 추가 요청 시마다 저장된 Access Token을 통해 API 호출 및 인증.
3. 토큰 받을 시에 다음에 2가지 검증 가능.
- 내부 검증 : 토큰에 포함된 정보를 공개 키를 통해 서명 검증하고, 유효 기간 및 클레임을 확인.
- 외부 검증 : 필요한 경우, 외부 인증 제공자에 토큰의 상태를 확인할 수 있음.

#### 장점
- 외부 인증 제공자가 모든 인증 과정을 담당하므로 애플리케이션 서버에서는 내부 토큰 발행 로직을 구현할 필요가 없어 간단.
- 소셜 로그인이나 서드파티 API 사용 시, 이미 검증된 외부 인증 방식과의 연동이 간편.

#### 단점
- 애플리케이션 서버가 매 요청마다 토큰 검증을 수행해야하므로 추가적인 연산 부담이 될 수 있음.
- 외부 제공자에서 토큰 만료 정책 및 갱신 정책을 정의하기 때문에 클라이언트 측에서 토큰 갱신 로직을 별도로 구현해야 할 수 있음(refresh Token 관리 등)
- 토큰이 클라이언트에 저장되므로 저장 위치에 따라 XSS나 CSRF와 같은 보안 위협에 취약할 수 있어 추가적인 보안 조치를 해야함.

### 추가적 방법
#### API Gateway 또는 프록시 인증 방식
- 사용자가 OAuth2.0/OIDC 등으로 외부 인증을 받은 후, 게이트웨이가 토큰을 검증.
- 내부 서비스는 인증 로직에 신경 쓸 필요 없이 게이트웨이에서 전달한 컨텍스트 정보(즉, 사용자 정보)만 신뢰하면 되므로, 마이크로서비스 아키텍처에 적합
- API 게이트웨이의 복잡성이 증가하며, 게이트웨이가 단일 실패 지점(Single Point of Failure)이 될 수 있으므로 고가용성을 위한 설계가 필요.




