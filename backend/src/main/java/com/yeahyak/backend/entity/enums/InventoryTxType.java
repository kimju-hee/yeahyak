package com.yeahyak.backend.entity.enums;

public enum InventoryTxType {
  ORDER, // 발주 생성 시
  ORDER_CANCEL, // 발주 취소 시
  RETURN, // 반품 완료 시
  IN // 입고 시
}
