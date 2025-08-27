import { AI_ENDPOINT } from '../constants';
import type { ChatbotReq, ChatbotResponse } from '../types';
import { aiInstance, instance } from './client';

// FAQ 챗봇
export const chatFAQ = async (data: ChatbotReq): Promise<ChatbotResponse> => {
  const response = await instance.post(AI_ENDPOINT.FAQ, data);
  console.log('🤖 FAQ 챗봇 응답:', response);
  return response.data;
};

// QNA 챗봇
export const chatQNA = async (data: ChatbotReq): Promise<ChatbotResponse> => {
  const response = await instance.post(AI_ENDPOINT.QNA, data);
  console.log('🤖 QNA 챗봇 응답:', response);
  return response.data;
};

// 법령 AI 요약
export const summarizeLaw = async (data: { file: File }) => {
  const formData = new FormData();
  formData.append('file', data.file);
  const response = await aiInstance.post(AI_ENDPOINT.LAW, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  console.log('🤖 법령 AI 요약 응답:', response);
  return response.data;
};

// 감염병 AI 요약
export const summarizeEpidemic = async (data: { file: File }) => {
  const formData = new FormData();
  formData.append('file', data.file);
  const response = await aiInstance.post(AI_ENDPOINT.EPIDEMIC, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  console.log('🤖 감염병 AI 요약 응답:', response);
  return response.data;
};

// 신제품 AI 요약
export const summarizeNewProduct = async (data: { file: File }) => {
  const formData = new FormData();
  formData.append('file', data.file);
  const response = await aiInstance.post(AI_ENDPOINT.NEW_PRODUCT, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  console.log('🤖 신제품 AI 요약 응답:', response);
  return response.data;
};
