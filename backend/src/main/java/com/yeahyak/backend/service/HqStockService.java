package com.yeahyak.backend.service;

import com.yeahyak.backend.dto.HqStockDto;
import com.yeahyak.backend.dto.HqStockTxDto;
import org.springframework.data.domain.Page;

import java.util.List;

public interface HqStockService {
    Page<HqStockDto> list(String search, int page, int size);
    List<HqStockTxDto> transactions(Long stockId);
}
