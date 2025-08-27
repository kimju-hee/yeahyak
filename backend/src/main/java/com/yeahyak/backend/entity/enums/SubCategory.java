package com.yeahyak.backend.entity.enums;

public enum SubCategory {

    // 전문의약품
    항생제(MainCategory.전문의약품),
    고혈압_치료제(MainCategory.전문의약품),
    당뇨병_치료제(MainCategory.전문의약품),
    진통소염제(MainCategory.전문의약품),
    정신신경용제(MainCategory.전문의약품),
    항암제(MainCategory.전문의약품),
    기타_전문의약품(MainCategory.전문의약품),

    // 일반의약품
    감기약(MainCategory.일반의약품),
    소화제(MainCategory.일반의약품),
    해열진통제(MainCategory.일반의약품),
    지사제(MainCategory.일반의약품),
    외용제(MainCategory.일반의약품),
    멀미약(MainCategory.일반의약품),
    기타_일반의약품(MainCategory.일반의약품),

    // 의약외품
    마스크(MainCategory.의약외품),
    손소독제(MainCategory.의약외품),
    밴드_반창고(MainCategory.의약외품),
    체온계(MainCategory.의약외품),
    구강청결제(MainCategory.의약외품),
    방역용품(MainCategory.의약외품),
    기타_의약외품(MainCategory.의약외품);

    private final MainCategory mainCategory;

    SubCategory(MainCategory mainCategory) {
        this.mainCategory = mainCategory;
    }

    public MainCategory getMainCategory() {
        return mainCategory;
    }
}
