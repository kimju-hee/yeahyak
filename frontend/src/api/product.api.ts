import { PRODUCT_ENDPOINT } from '../constants';
import type {
  ProductCreateRequest,
  ProductCreateResponse,
  ProductDetailResponse,
  ProductListParams,
  ProductListResponse,
  ProductUpdateRequest,
} from '../types';
import { instance } from './client';

// 상품 생성
export const createProduct = async (data: ProductCreateRequest): Promise<ProductCreateResponse> => {
  const response = await instance.post(PRODUCT_ENDPOINT.CREATE, data);
  console.log('📦 상품 생성 응답:', response.data);
  return response.data;
};

// 상품 목록 조회
export const getProducts = async (params?: ProductListParams): Promise<ProductListResponse> => {
  const response = await instance.get(PRODUCT_ENDPOINT.LIST, { params });
  console.log('📦 상품 목록 조회 응답:', response.data);
  return response.data;
};

// 상품 상세 조회
export const getProduct = async (productId: number): Promise<ProductDetailResponse> => {
  const response = await instance.get(PRODUCT_ENDPOINT.DETAIL(productId));
  console.log('📦 상품 상세 조회 응답:', response.data);
  return response.data;
};

// 상품 수정
export const updateProduct = async (
  productId: number,
  data: ProductUpdateRequest,
): Promise<void> => {
  const response = await instance.patch(PRODUCT_ENDPOINT.UPDATE(productId), data);
  console.log('📦 상품 수정 응답:', response.data);
};

// 상품 삭제
export const deleteProduct = async (productId: number): Promise<void> => {
  const response = await instance.delete(PRODUCT_ENDPOINT.DELETE(productId));
  console.log('📦 상품 삭제 응답:', response.data);
};
