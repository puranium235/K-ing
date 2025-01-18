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


