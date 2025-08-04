# 💊 예약 프론트엔드

## 🛠️ 기술 스택

| 기술                                                             | 설명                    |
| ---------------------------------------------------------------- | ----------------------- |
| [React](https://reactjs.org/)                                    | UI 라이브러리           |
| [Vite](https://vitejs.dev/)                                      | 빠른 빌드 도구          |
| [TypeScript](https://www.typescriptlang.org/)                    | 정적 타입               |
| [Ant Design](https://ant.design/)                                | UI 컴포넌트 라이브러리  |
| [Axios](https://axios-http.com/)                                 | API 요청 라이브러리     |
| [React Query](https://tanstack.com/query/latest)                 | 서버 상태 관리          |
| [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/) | 코드 스타일 & 품질 관리 |

## 🚀 시작하기

이 프로젝트를 로컬 개발 환경에서 설정하고 실행하는 방법입니다.

### 필수 조건

- [Node.js](https://nodejs.org/ko/) 18.0 이상
- [npm](https://www.npmjs.com/)

### 설치 및 실행

1.  **의존성 설치**: 프로젝트에 필요한 모든 패키지를 설치합니다.

    ```bash
    cd frontend
    npm install
    ```

2.  **환경 변수 설정**: `frontend` 폴더에 `.env` 파일을 생성하고 다음 내용을 추가합니다.

    ```ini
    # 백엔드 API 기본 주소
    VITE_API_BASE_URL=http://localhost:8080/api

    # 챗봇(AI) API 주소
    VITE_AI_API_URL=http://localhost:5000/api/chatbot
    ```

3.  **개발 서버 실행**: 개발 서버를 시작하고 브라우저에서 앱을 확인합니다.

    ```bash
    npm run dev
    ```

## 📁 폴더 구조

```
frontend/src/
├── api/         # API 호출 관련
├── assets/      # 이미지, 아이콘 등 정적 파일
├── components/  # 재사용 가능한 컴포넌트
├── hooks/       # 커스텀 훅
├── layouts/     # 페이지 레이아웃 컴포넌트
├── pages/       # 라우팅되는 실제 페이지
├── types/       # 공통 타입 정의
├── utils/       # 유틸리티 함수
├── App.tsx      # 메인 앱 컴포넌트 및 라우팅 설정
└── main.tsx     # 앱의 진입점
```

## 💡 개발 가이드라인

- **컴포넌트 분리**: 하나의 컴포넌트가 너무 많은 기능을 담당하지 않도록 작게 분리하는 연습을 합니다.
- **재사용성**: 가능한 한 많은 컴포넌트와 훅을 재사용 가능하도록 만듭니다.
- **타입스크립트 활용**: 모든 변수와 함수의 타입을 명확히 정의하여 오류를 줄이고 코드 가독성을 높입니다.
- **커밋 메시지**: Git 커밋 메시지는 간결하고 명확하게 작성하여 어떤 변경 사항이 있었는지 쉽게 파악할 수 있도록 합니다. (예: `feat: 재고 목록 페이지 구현`, `fix: 로그인 오류 수정`, `refactor: 코드 리팩토링`)
