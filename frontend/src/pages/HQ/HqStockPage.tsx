import { Button, Input, Modal, Space, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState } from 'react';
import { Card } from 'antd';
import axios from 'axios';

const { Title } = Typography;

interface StockItem {
  stockId: number;
  productId: number;
  productCode: string;
  productName: string;
  unit: string;
  quantity: number;
  lastInboundDate: string | null;
  lastOutboundDate: string | null;
}

interface HqTxRow {
  id: number;
  date: string; // "YYYY-MM-DD"
  type: string; // "입고" | "출고" | "반품입고"
  quantity: number;
  balance: number;
  remark: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T[];
  totalPages: number;
  totalElements: number;
  currentPage: number; // 0-based
}

const StockTransactionTable: React.FC<{ data: HqTxRow[] }> = ({ data }) => (
  <Card styles={{ body: { maxHeight: 400, overflowY: 'auto', paddingRight: 8 } }}>
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
      dataSource={data}
      rowKey="id"
      scroll={{ y: 360 }}
    />
  </Card>
);

export default function HqStockPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);

  // 목록 데이터 (API)
  const [rows, setRows] = useState<StockItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1); // antd는 1-base
  const pageSize = 10;

  // 검색어
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // 거래내역 데이터 (API)
  const [txRows, setTxRows] = useState<HqTxRow[]>([]);

  // 목록 API
  const fetchStocks = async (page = 0, search = '') => {
    const res = await axios.get<ApiResponse<StockItem>>('/api/hq/stocks', {
      params: { page, size: pageSize, search: search || undefined },
    });
    const r = res.data;
    setRows(r.data);
    setTotal(r.totalElements);
    setCurrentPage(r.currentPage + 1); // API는 0-base → antd 1-base
  };

  // 거래내역 API
  const fetchTransactions = async (stockId: number) => {
    const res = await axios.get<ApiResponse<HqTxRow>>(`/api/hq/stocks/${stockId}/transactions`);
    setTxRows(res.data.data);
  };

  useEffect(() => {
    fetchStocks(0, '');
  }, []);

  const showModal = async (item: StockItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
    await fetchTransactions(item.stockId);
  };

  const handleCancel = () => setIsModalOpen(false);

  const handleSearch = () => {
    const keyword = searchKeyword.trim();
    fetchStocks(0, keyword);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchKeyword(value);
    if (value.trim() === '') {
      fetchStocks(0, '');
    }
  };

  const columns: ColumnsType<StockItem> = [
    {
      title: 'No',
      key: 'index',
      render: (_text, _record, index) => (currentPage - 1) * pageSize + index + 1,
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
      render: (value) => <span style={{ color: value === 0 ? 'red' : undefined }}>{value}</span>,
    },
    {
      title: '최종 입고 일시',
      dataIndex: 'lastInboundDate',
      key: 'lastInboundDate',
      render: (v: string | null) => v ?? '-',
    },
    {
      title: '최종 출고 일시',
      dataIndex: 'lastOutboundDate',
      key: 'lastOutboundDate',
      render: (v: string | null) => v ?? '-',
    },
  ];

  return (
    <>
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
        dataSource={rows}
        pagination={{
          pageSize,
          current: currentPage,
          total,
          onChange: (page) => fetchStocks(page - 1, searchKeyword.trim()),
        }}
        rowKey="stockId"
      />

      <Modal
        title={selectedItem?.productName}
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
        destroyOnHidden
        width={700}
      >
        {selectedItem && <StockTransactionTable data={txRows} />}
      </Modal>
    </>
  );
}
