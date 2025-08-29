package com.yeahyak.backend.entity.enums;

public enum BalanceTxType {
  ORDER, // 발주 생성 시
  ORDER_CANCEL, // 발주 취소 시
  RETURN, // 반품 완료 시
  SETTLEMENT // 정산 처리
}
