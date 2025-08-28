/// <reference types="vite/client" />

// HTML 파일을 텍스트로 import할 수 있도록 타입 정의
declare module '*.html?raw' {
  const content: string;
  export default content;
}
