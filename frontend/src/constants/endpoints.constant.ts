export const AUTH_ENDPOINT = {
  SIGNUP_HQ: '/auth/admin/signup',
  SIGNUP_BRANCH: '/auth/pharmacy/signup',
  LOGIN_HQ: '/auth/admin/login',
  LOGIN_BRANCH: '/auth/pharmacy/login',
  PASSWORD_CHANGE: '/auth/password',
  UPDATE_HQ: (adminId: number) => `/auth/admin/${adminId}/update`,
  UPDATE_BRANCH: (pharmacyId: number) => `/auth/pharmacy/${pharmacyId}/update`,
  LOGOUT: '/auth/logout',
} as const;

export const PHARMACY_REQUEST_ENDPOINT = {
  LIST: '/pharmacy-requests',
  DETAIL: (pharmacyRequestId: number) => `/pharmacy-requests/${pharmacyRequestId}`,
  APPROVE: (pharmacyRequestId: number) => `/pharmacy-requests/${pharmacyRequestId}/approve`,
  REJECT: (pharmacyRequestId: number) => `/pharmacy-requests/${pharmacyRequestId}/reject`,
} as const;

export const NOTICE_ENDPOINT = {
  CREATE: '/notices',
  LIST: '/notices',
  LATEST_LIST: '/notices/latest',
  DETAIL: (noticeId: number) => `/notices/${noticeId}`,
  UPDATE: (noticeId: number) => `/notices/${noticeId}`,
  DELETE: (noticeId: number) => `/notices/${noticeId}`,
  DOWNLOAD: (noticeId: number) => `/notices/${noticeId}/download`,
} as const;

export const ORDER_ENDPOINT = {
  CREATE: '/orders',
  LIST_HQ: '/orders/hq',
  LIST_BRANCH: '/orders/branch',
  DETAIL: (orderId: number) => `/orders/${orderId}`,
  UPDATE: (orderId: number) => `/orders/${orderId}/update`,
  DELETE: (orderId: number) => `/orders/${orderId}`,
  FORECAST: '/forecast/order',
} as const;

export const RETURN_ENDPOINT = {
  CREATE: '/returns',
  LIST_HQ: '/returns/hq',
  LIST_BRANCH: '/returns/branch',
  DETAIL: (returnId: number) => `/returns/${returnId}`,
  UPDATE: (returnId: number) => `/returns/${returnId}/update`,
  DELETE: (returnId: number) => `/returns/${returnId}`,
} as const;

export const PRODUCT_ENDPOINT = {
  CREATE: '/products',
  LIST: '/products',
  DETAIL: (productId: number) => `/products/${productId}`,
  UPDATE: (productId: number) => `/products/${productId}`,
  DELETE: (productId: number) => `/products/${productId}`,
  IN: (productId: number) => `/products/${productId}/in`,
  INVENTORY: (productId: number) => `/products/${productId}/inventory-txs`,
} as const;

export const PHARMACY_ENDPOINT = {
  LIST: '/pharmacies',
  SETTLEMENT: (pharmacyId: number) => `/pharmacies/${pharmacyId}/settle`,
  BALANCE: (pharmacyId: number) => `/pharmacies/${pharmacyId}/balance-txs`,
} as const;

export const AI_ENDPOINT = {
  FAQ: '/chatbot/faq',
  QNA: '/chatbot/qna',
  LAW: '/summarize/law',
  EPIDEMIC: '/summarize/epidemic',
  NEW_PRODUCT: '/summarize/new-product',
} as const;
