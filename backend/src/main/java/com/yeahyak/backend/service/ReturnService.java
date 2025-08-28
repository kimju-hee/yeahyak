package com.yeahyak.backend.service;

import com.yeahyak.backend.dto.ReturnCreateRequest;
import com.yeahyak.backend.dto.ReturnCreateResponse;
import com.yeahyak.backend.dto.ReturnDetailResponse;
import com.yeahyak.backend.dto.ReturnListResponse;
import com.yeahyak.backend.dto.ReturnUpdateRequest;
import com.yeahyak.backend.entity.OrderItem;
import com.yeahyak.backend.entity.Orders;
import com.yeahyak.backend.entity.Pharmacy;
import com.yeahyak.backend.entity.Product;
import com.yeahyak.backend.entity.ReturnItem;
import com.yeahyak.backend.entity.Returns;
import com.yeahyak.backend.entity.enums.BalanceTxType;
import com.yeahyak.backend.entity.enums.Region;
import com.yeahyak.backend.entity.enums.ReturnStatus;
import com.yeahyak.backend.entity.enums.StockTxType;
import com.yeahyak.backend.repository.OrderItemRepository;
import com.yeahyak.backend.repository.OrderRepository;
import com.yeahyak.backend.repository.PharmacyRepository;
import com.yeahyak.backend.repository.ProductRepository;
import com.yeahyak.backend.repository.ReturnItemRepository;
import com.yeahyak.backend.repository.ReturnRepository;
import com.yeahyak.backend.repository.StockTxRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 반품 요청과 관련된 비즈니스 로직을 처리하는 서비스 클래스입니다.
 */
@Service
@RequiredArgsConstructor
public class ReturnService {

  private final ReturnRepository returnRepo;
  private final ReturnItemRepository returnItemRepo;
  private final OrderRepository orderRepo;
  private final OrderItemRepository orderItemRepo;
  private final PharmacyRepository pharmacyRepo;
  private final ProductRepository productRepo;
  private final StockTxRepository stockTxRepo;
  private final BalanceTxService balanceTxService;
  private final StockTxService stockTxService;

  /**
   * 반품 요청을 생성합니다.
   */
  @Transactional
  public ReturnCreateResponse createReturn(ReturnCreateRequest req) {
    Pharmacy pharmacy = pharmacyRepo.findById(req.getPharmacyId())
        .orElseThrow(() -> new RuntimeException("가맹점 정보를 찾을 수 없습니다."));
    Orders orders = orderRepo.findById(req.getOrderId())
        .orElseThrow(() -> new RuntimeException("발주 정보를 찾을 수 없습니다."));
    if (!orders.getPharmacy().getPharmacyId().equals(pharmacy.getPharmacyId())) {
      throw new RuntimeException("해당 가맹점의 발주 내역이 아닙니다.");
    }
    if (req.getItems() == null || req.getItems().isEmpty()) {
      throw new RuntimeException("반품 요청 품목이 없습니다.");
    }

    List<OrderItem> orderItems = orderItemRepo.findByOrders(orders);
    Map<Long, OrderItem> orderedItemMap = orderItems.stream()
        .collect(Collectors
            .toMap(oi -> oi.getProduct().getProductId(), oi -> oi));

    final List<ReturnStatus> statuses = List.of(
        ReturnStatus.REQUESTED,
        ReturnStatus.APPROVED,
        ReturnStatus.RECEIVED,
        ReturnStatus.COMPLETED
    );

    BigDecimal totalPrice = BigDecimal.ZERO;
    List<ReturnItem> returnItems = new ArrayList<>();

    Map<Long, Integer> orderedQtyMap = orderItems.stream()
        .collect(Collectors
            .toMap(oi -> oi.getProduct().getProductId(), OrderItem::getQuantity));

    for (ReturnCreateRequest.Item reqItem : req.getItems()) {
      Product product = productRepo.findById(reqItem.getProductId())
          .orElseThrow(() -> new RuntimeException("제품 정보를 찾을 수 없습니다."));

      int quantity = reqItem.getQuantity();

      // 반품 가능 수량 제한
      int orderedQty = orderedQtyMap.getOrDefault(product.getProductId(), 0);
      long already = returnItemRepo.sumReturnedQtyForOrderAndProduct(
          orders, product.getProductId(), statuses
      );
      long left = Math.max(0L, (long) orderedQty - already);
      if (quantity > left) {
        throw new RuntimeException(
            String.format("반품 가능 수량을 초과했습니다. (주문수량=%d개, 누적반품=%d개)", orderedQty, already)
        );
      }

      // 반품 단가 고정
      OrderItem orderedItem = orderedItemMap.get(product.getProductId());
      if (orderedItem == null) {
        throw new RuntimeException("발주 내역에 없는 제품은 반품할 수 없습니다.");
      }
      BigDecimal unitPrice = orderedItem.getUnitPrice();
      BigDecimal subtotalPrice = unitPrice.multiply(BigDecimal.valueOf(quantity));
      totalPrice = totalPrice.add(subtotalPrice);

      ReturnItem returnItem = ReturnItem.builder()
          .returns(null) // 나중에 세팅
          .product(product)
          .quantity(quantity)
          .unitPrice(unitPrice)
          .subtotalPrice(subtotalPrice)
          .build();
      returnItems.add(returnItem);
    }

    Returns returns = Returns.builder()
        .pharmacy(pharmacy)
        .orders(orders)
        .status(ReturnStatus.REQUESTED)
        .reason(req.getReason())
        .totalPrice(totalPrice)
        .build();
    returnRepo.save(returns);

    for (ReturnItem returnItem : returnItems) {
      returnItem.setReturns(returns);
    }
    returnItemRepo.saveAll(returnItems);

    return new ReturnCreateResponse(returns.getReturnId());
  }

  /**
   * 본사에서 반품 요청 목록을 조회합니다. 기간이나 상태를 지정하지 않으면 모든 반품 요청을 조회합니다.
   */
  @Transactional(readOnly = true)
  public Page<ReturnListResponse> getReturns(
      ReturnStatus status, Region region, LocalDateTime start, LocalDateTime end,
      int page, int size
  ) {
    Pageable pageable = PageRequest.of(page, size, Sort.by(Direction.DESC, "createdAt"));
    return returnRepo.findByStatusAndRegionAndCreatedAtBetween(
            status, region, start, end, pageable)
        .map(returns -> ReturnListResponse.builder()
            .returnId(returns.getReturnId())
            .pharmacyId(returns.getPharmacy().getPharmacyId())
            .pharmacyName(returns.getPharmacy().getPharmacyName())
            .status(returns.getStatus())
            .summary(makeSummary(returns))
            .reason(returns.getReason())
            .totalPrice(returns.getTotalPrice())
            .createdAt(returns.getCreatedAt())
            .build());
  }

  /**
   * 가맹점에서 반품 요청 목록을 조회합니다. 상태를 지정하지 않으면 해당 가맹점의 모든 반품 요청을 조회합니다.
   */
  @Transactional(readOnly = true)
  public Page<ReturnListResponse> getReturnsByPharmacy(
      Long pharmacyId, ReturnStatus status, int page, int size
  ) {
    Pageable pageable = PageRequest.of(page, size, Sort.by(Direction.DESC, "createdAt"));
    return returnRepo.findByPharmacy_PharmacyIdAndStatus(pharmacyId, status, pageable)
        .map(returns -> ReturnListResponse.builder()
            .returnId(returns.getReturnId())
            .pharmacyId(pharmacyId)
            .pharmacyName(returns.getPharmacy().getPharmacyName())
            .status(returns.getStatus())
            .summary(makeSummary(returns))
            .reason(returns.getReason())
            .totalPrice(returns.getTotalPrice())
            .createdAt(returns.getCreatedAt())
            .build());
  }

  /**
   * 반품 요청 상세를 조회합니다.
   */
  @Transactional(readOnly = true)
  public ReturnDetailResponse getReturnById(Long returnId) {
    Returns returns = returnRepo.findById(returnId)
        .orElseThrow(() -> new RuntimeException("반품 요청 정보를 찾을 수 없습니다."));

    List<ReturnItem> items = returnItemRepo.findByReturns(returns);
    List<ReturnDetailResponse.Item> itemsList = items.stream()
        .map(item -> ReturnDetailResponse.Item.builder()
            .productId(item.getProduct().getProductId())
            .productName(item.getProduct().getProductName())
            .mainCategory(item.getProduct().getMainCategory())
            .subCategory(item.getProduct().getSubCategory())
            .manufacturer(item.getProduct().getManufacturer())
            .productImgUrl(item.getProduct().getProductImgUrl())
            .quantity(item.getQuantity())
            .unit(item.getProduct().getUnit())
            .unitPrice(item.getUnitPrice())
            .subtotalPrice(item.getSubtotalPrice())
            .build()
        ).toList();

    return ReturnDetailResponse.builder()
        .returnId(returns.getReturnId())
        .pharmacyId(returns.getPharmacy().getPharmacyId())
        .pharmacyName(returns.getPharmacy().getPharmacyName())
        .status(returns.getStatus())
        .summary(makeSummary(items))
        .reason(returns.getReason())
        .totalPrice(returns.getTotalPrice())
        .createdAt(returns.getCreatedAt())
        .updatedAt(returns.getUpdatedAt())
        .items(itemsList)
        .build();
  }

  private String makeSummary(Returns returns) {
    List<ReturnItem> items = returnItemRepo.findByReturns(returns);
    String firstProductName = items.get(0).getProduct().getProductName();
    int count = items.size();
    return (count > 1) ? firstProductName + " 외 " + (count - 1) + "개" : firstProductName;
  }

  private String makeSummary(List<ReturnItem> items) {
    String firstProductName = items.get(0).getProduct().getProductName();
    int count = items.size();
    return (count > 1) ? firstProductName + " 외 " + (count - 1) + "개" : firstProductName;
  }

  /**
   * 반품 요청의 상태를 업데이트합니다. 업데이트 상태가 COMPLETED인 경우, 유저의 미정산 잔액을 감소시키고 제품의 재고를 복구합니다.
   */
  @Transactional
  public void updateReturnStatus(Long returnId, ReturnUpdateRequest req) {
    Returns returns = returnRepo.findById(returnId)
        .orElseThrow(() -> new RuntimeException("반품 요청 정보를 찾을 수 없습니다."));

    if (returns.getStatus() == ReturnStatus.CANCELED) {
      throw new RuntimeException("이미 취소된 반품 요청입니다.");
    } else if (returns.getStatus() == ReturnStatus.COMPLETED) {
      throw new RuntimeException("이미 완료된 반품 요청입니다.");
    }

    if (req.getStatus() == ReturnStatus.COMPLETED) {
      balanceTxService.createBalanceTx(
          returns.getPharmacy().getPharmacyId(), BalanceTxType.RETURN, returns.getTotalPrice()
      );

      List<ReturnItem> items = returnItemRepo.findByReturns(returns);
      for (ReturnItem ri : items) {
        stockTxService.createStockTx(
            ri.getProduct().getProductId(), StockTxType.RETURN, ri.getQuantity()
        );
      }
    }

    returns.setStatus(req.getStatus());
    returnRepo.save(returns);
  }

  /**
   * 반품 요청을 삭제합니다.
   */
  @Transactional
  public void deleteReturn(Long returnId) {
    Returns returns = returnRepo.findById(returnId)
        .orElseThrow(() -> new RuntimeException("반품 요청 정보를 찾을 수 없습니다."));

    returnItemRepo.deleteAllByReturns(returns);
    returnRepo.delete(returns);
  }
}
