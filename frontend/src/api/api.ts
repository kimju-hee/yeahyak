import axios from 'axios';

// NOTE: refresh token은 쿠키에, access token은 로컬 스토리지에 저장
// TODO: access token이 만료되었을 때, 자동으로 refresh 요청하여 access token 갱신

const instance = axios.create({
  baseURL: 'http://localhost:8080/api',
  withCredentials: true,
});

export default instance;
