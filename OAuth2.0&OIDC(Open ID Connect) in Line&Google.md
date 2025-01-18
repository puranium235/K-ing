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




