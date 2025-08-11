package com.yeahyak.backend.entity.enums;

public enum HqTransactionType {
    IN,        // 본사로의 매입 입고
    OUT,       // 본사 -> 가맹점 출고
    RETURN_IN  // 가맹점 반품으로 본사 입고
}
