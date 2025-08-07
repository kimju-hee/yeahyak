package com.yeahyak.backend.repository;

import com.yeahyak.backend.entity.ReturnItems;
import com.yeahyak.backend.entity.Returns;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReturnItemsRepository extends JpaRepository<ReturnItems, Long> {
    List<ReturnItems> findByReturns(Returns returns);
    void deleteAllByReturns(Returns returns);
}