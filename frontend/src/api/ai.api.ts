import { AI_ENDPOINT } from '../constants';
import type { ChatbotRequest, ChatbotResponse } from '../types';
import { aiInstance } from './client';

// FAQ 챗봇
export const chatFAQ = async (data: ChatbotRequest): Promise<ChatbotResponse> => {
  const response = await aiInstance.post(AI_ENDPOINT.FAQ, data);
  console.log('🤖 FAQ 챗봇 응답:', response);
  return response.data;
};

// QnA 챗봇
export const chatQnA = async (data: ChatbotRequest): Promise<ChatbotResponse> => {
  const response = await aiInstance.post(AI_ENDPOINT.QNA, data);
  console.log('🤖 QnA 챗봇 응답:', response);
  return response.data;
};

// 법률 AI 요약
export const summarizeLaw = async (data: { file: File }) => {
  const formData = new FormData();
  formData.append('file', data.file);
  const response = await aiInstance.post(AI_ENDPOINT.LAW_AI, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  console.log('🤖 법률 AI 요약 응답:', response);
  return response.data;
};

// 전염병 AI 요약
export const summarizeEpidemic = async (data: { file: File }) => {
  const formData = new FormData();
  formData.append('file', data.file);
  const response = await aiInstance.post(AI_ENDPOINT.EPIDEMIC_AI, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  console.log('🤖 전염병 AI 요약 응답:', response);
  return response.data;
};

// 신제품 AI 요약
export const summarizeNewProduct = async (data: { file: File }) => {
  const formData = new FormData();
  formData.append('file', data.file);
  const response = await aiInstance.post(AI_ENDPOINT.NEW_PRODUCT_AI, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  console.log('🤖 신제품 AI 요약 응답:', response);
  return response.data;
};
