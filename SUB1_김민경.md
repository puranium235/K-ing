# [웹 디자인] Sub PJT 1. 모바일 웹 디자인 및 기본 구성

- 기획 명세서 및 기능 구체화

  - [Notion Link](https://young5306.notion.site/0110-89beadd06daa4f4dbe8545b1c259ce8a)

- API 명세 리뷰

  - [Notion Link](https://young5306.notion.site/API-1732f0f38a4981448388e9740d6201b6)

- Figma 화면 설계

  - [Figma Link](https://www.figma.com/design/1q0BsgQxuVqRIR3t6hx8Lx/Jackpot-777?node-id=122-2634&p=f&t=8cF5ejNCH3huLNFn-0)
  - Archive : 사용자가 즐겨찾기한 장소, 큐레이션, 키워드(작품, 인물)에 대한 정보를 모아보는 페이지
  - Mypage : 사용자가 작성한 게시글, 큐레이션을 볼 수 있는 페이지
  - Setting : 설정 관리 페이지

- Figma 피드백 정리

  - Archive
    - 장소 북마크에 썸네일이 필요한가 : 사진 없애고 텍스트만 리스트 형식으로 제공
    - 좋아요 눌렀을 때 좋아요 리스트 뜨는 화면 + 새 좋아요 리스트 만드는 창 필요
    - 한 장소를 여러 리스트에 저장하는 것은 불가능(리스트 하나에 여러개의 장소 가능) = 1대다
    - 리스트 수정 삭제화면 - 밖에서 : 버튼 (큐레이션처럼)
    - 상세 페이지에서 하트를 빼는 순간 좋아요에서 빠질 것인지 페이지아웃할 때 한번에 빠질 것인지 → 하트 빼는 순간 좋아요 삭제
    - 정렬 순서 추가된 순서
    - 큐레이션도 오른쪽 상단에 북마크 모양해서 넣었다 뻈다
    - 키워드 디테일에서 작품명이랑 하트를 포스터 안에 넣고 하트는 오른쪽 상단 위. 하트는 흰색으로.
    - 좌측 정렬
    - 네이게이션 바 아이콘 북마크로 변경
  - Mypage
    - 아이디 대신 연동 이메일
    - 계정을 삭제하는 이유 페이지 x
    - 내 포스트 전체 공개 / 맞팔만 공개
    - 남의 페이지 들어갔을 때 팔로잉하고 있는지 뜨는지 (그 사람이 날 팔로잉하고 있는지(=팔로우))
  - Setting
    - 계정 비공개가 아니라 포스트 전체 공개 / 포스트 맞팔 공개로 변경 (라디오 버튼)

- ERD 설계 리뷰
  ![image](./img/ERD%20K-ING.png)
- REACT 강의
  - [메모장 프로젝트](https://github.com/MingyeongKim0708/React_MemoProject)
  - [Notion Link](https://www.notion.so/React-17d3eaa46d158037aff6d95148bb099c)
  - 특이사항 : 강의 내용은 react-create-app을 사용했으나 현재는 vite 사용
