import React, { useState } from 'react';
import {
  Table,
  Typography,
  Input,
  Space,
  Button,
  Modal,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { mockHqStocks, mockHqStockTransactions } from '../../mocks/stock.mock';
import { mockProducts } from '../../mocks/product.mock';
import type { Product, HqStockTransaction } from '../../mocks/types';
import { mockOrders } from '../../mocks/order.mock';
import { mockReturns } from '../../mocks/return.mock';
import { mockPharmacies } from '../../mocks/auth.mock';

const { Title } = Typography;

interface StockItem {
  key: string;
  stockId: number;
  productId: number;
  productCode: string;
  productName: string;
  unit: string;
  quantity: number;
  lastInboundDate: string;
  lastOutboundDate: string;
}

function buildStockData(): StockItem[] {
  return mockHqStocks.map((stock) => {
    const product = mockProducts.find((p: Product) => p.id === stock.productId);
    return {
      key: stock.id.toString(),
      stockId: stock.id,
      productId: stock.productId,
      productCode: product?.productCode ?? '',
      productName: product?.productName ?? '',
      unit: product?.unit ?? '',
      quantity: stock.quantity,
      lastInboundDate: stock.lastInboundedAt?.slice(0, 10) ?? '-',
      lastOutboundDate: stock.lastOutboundedAt?.slice(0, 10) ?? '-',
    };
  });
}

export default function HqStockPage() {
  const [activeTab, setActiveTab] = useState<'inbound' | 'outbound'>('inbound');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [filteredData, setFilteredData] = useState<StockItem[]>(buildStockData());
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  const showModal = (item: StockItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
    setActiveTab('inbound');
  };

  const handleOk = () => setIsModalOpen(false);
  const handleCancel = () => setIsModalOpen(false);

  const handleSearch = () => {
    const keyword = searchKeyword.trim().toLowerCase();
    const data = buildStockData();
    const result = keyword
      ? data.filter(
          (item) =>
            item.productCode.toLowerCase().includes(keyword) ||
            item.productName.toLowerCase().includes(keyword)
        )
      : data;
    setFilteredData(result);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchKeyword(value);
    if (value.trim() === '') {
      setFilteredData(buildStockData());
    }
  };

  const getModalData = (): {
    id: number;
    date: string;
    type: '입고' | '출고' | '반품입고';
    quantity: number;
    balance: number;
    remark: string;
  }[] => {
    if (!selectedItem) return [];

    // 1. 해당 품목 거래 내역 필터
    const txList = mockHqStockTransactions
      .filter((tx) => tx.hqStockId === selectedItem.stockId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // 역순 정렬

    // 2. 기준 재고 설정 (최신 기준)
    let currentStock = selectedItem.quantity;

    // 3. 누적 배열 생성 (역산)
    const result = txList.map((tx) => {
      let typeLabel: '입고' | '출고' | '반품입고';
      let isInbound = false;
      let remark = '-';

      if (tx.type === 'IN') {
        typeLabel = '입고';
        isInbound = true;
      } else if (tx.type === 'RETURN_IN') {
        typeLabel = '반품입고';
        isInbound = true;

        if (tx.returnId) {
          const ret = mockReturns.find((r) => r.id === tx.returnId);
          const pharmacy = mockPharmacies.find((p) => p.id === ret?.pharmacyId);
          if (pharmacy) remark = pharmacy.pharmacyName;
        }
      } else {
        typeLabel = '출고';
        isInbound = false;

        if (tx.orderId) {
          const order = mockOrders.find((o) => o.id === tx.orderId);
          const pharmacy = mockPharmacies.find((p) => p.id === order?.pharmacyId);
          if (pharmacy) remark = pharmacy.pharmacyName;
        }
      }

      const row = {
        id: tx.id,
        date: tx.createdAt.slice(0, 10),
        type: typeLabel,
        quantity: tx.quantity,
        balance: currentStock,
        remark,
      };

      // 다음 줄 계산 준비
      currentStock -= isInbound ? tx.quantity : -tx.quantity;

      return row;
    });

    // 4. 다시 시간순 정렬하여 테이블에 표시
    return result.reverse();
  };




  const columns: ColumnsType<StockItem> = [
    {
      title: 'No',
      key: 'index',
      render: (_text, _record, index) => index + 1,
      width: 60,
    },
    {
      title: '품목코드',
      dataIndex: 'productCode',
      key: 'productCode',
    },
    {
      title: '품목명',
      dataIndex: 'productName',
      key: 'productName',
      render: (text, record) => <a onClick={() => showModal(record)}>{text}</a>,
    },
    {
      title: '단위',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
    },
    {
      title: '재고수량',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (value) => (
        <span style={{ color: value === 0 ? 'red' : undefined }}>{value}</span>
      ),
    },
    {
      title: '최종 입고 일시',
      dataIndex: 'lastInboundDate',
      key: 'lastInboundDate',
    },
    {
      title: '최종 출고 일시',
      dataIndex: 'lastOutboundDate',
      key: 'lastOutboundDate',
    },
  ];

  return (
    <div>
      <Title level={3}>본사 재고 현황</Title>

      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="품목코드 또는 품목명 검색"
          allowClear
          value={searchKeyword}
          onChange={handleInputChange}
          onSearch={handleSearch}
          style={{ width: 300 }}
        />
        <Button type="primary" onClick={handleSearch}>
          조회
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={filteredData}
        pagination={{ pageSize: 10 }}
        rowKey="key"
      />

      <Modal
        title={selectedItem?.productName}
        open={isModalOpen}
        footer={null} // ✅ OK/Cancel 버튼 제거
        onCancel={handleCancel}
        destroyOnClose
        width={700}
      >
        {selectedItem && (
            <Table
              size="small"
              pagination={false}
              columns={[
                { title: '날짜', dataIndex: 'date', key: 'date' },
                { title: '구분', dataIndex: 'type', key: 'type' },
                { title: '수량', dataIndex: 'quantity', key: 'quantity' },
                { title: '재고', dataIndex: 'balance', key: 'balance' },
                { title: '비고', dataIndex: 'remark', key: 'remark' },
              ]}
              dataSource={getModalData()}
              rowKey="id"
            />

        )}
      </Modal>

    </div>
  );
}
