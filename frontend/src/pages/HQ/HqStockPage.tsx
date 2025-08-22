import { Button, Input, Modal, Space, Table, Typography, Card } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useMemo, useState } from 'react';

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

interface TxRow {
  id: string | number;
  date: string;
  type: '입고' | '출고' | '반품입고';
  quantity: number;
  balance: number;
  remark: string;
}

const PRODUCTS_API = '/api/products/filter';
const HISTORY_API = '/api/inventory';

const StockTransactionTable: React.FC<{ data: TxRow[]; loading?: boolean }> = ({ data, loading }) => (
  <Card styles={{ body: { maxHeight: 400, overflowY: 'auto', paddingRight: 8 } }}>
    <Table
      size="small"
      pagination={false}
      loading={loading}
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
  const [filteredData, setFilteredData] = useState<StockItem[]>([]);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [txLoading, setTxLoading] = useState(false);
  const [txData, setTxData] = useState<TxRow[]>([]);
  const pageSize = 10;

  // 목록 조회
  async function fetchList(keyword = '', page = 0, size = 200) {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), size: String(size) });
      if (keyword.trim()) params.set('keyword', keyword.trim()); // 백엔드에서 무시해도 무해

      const res = await fetch(`${PRODUCTS_API}?${params.toString()}`);
      const json = await res.json();

      const list = Array.isArray(json.data) ? json.data : json.data?.content ?? [];

      const rows: StockItem[] = list.map((p: any) => ({
        key: String(p.productId),
        stockId: p.productId,
        productId: p.productId,
        productCode: p.productCode ?? '',
        productName: p.productName ?? '',
        unit: p.unit ?? '',
        quantity: p.stock ?? 0,
        lastInboundDate: p.lastInboundAt ? String(p.lastInboundAt).slice(0, 10) : '-',
        lastOutboundDate: p.lastOutboundAt ? String(p.lastOutboundAt).slice(0, 10) : '-',
      }));

      setFilteredData(rows);
      setCurrentPage(1);
    } catch (e) {
      console.error('fetch products failed', e);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showModal = async (item: StockItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
    setTxLoading(true);
    try {
      const r = await fetch(`${HISTORY_API}?productId=${item.productId}&page=0&size=100`);
      const j = await r.json();
      const arr: any[] = Array.isArray(j.data) ? j.data : [];
      // 서버가 이미 snapshot stock을 내려주므로 그대로 사용
      const rows: TxRow[] = arr
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map((h, idx) => ({
          id: `${item.productId}-${idx}-${h.date}`,
          date: String(h.date).slice(0, 10),
          type: h.division === 'IN' ? '입고' : h.division === 'RETURN_IN' ? '반품입고' : '출고',
          quantity: h.quantity,
          balance: h.stock,
          remark: h.division === 'IN' ? '-' : h.note || '-',
        }));
      setTxData(rows);
    } catch (e) {
      console.error('fetch history failed', e);
      setTxData([]);
    } finally {
      setTxLoading(false);
    }
  };

  const handleCancel = () => setIsModalOpen(false);

  const handleSearch = () => {
    const keyword = searchKeyword.trim();
    fetchList(keyword);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchKeyword(value);
    if (value.trim() === '') {
      fetchList('');
    }
  };

  const columns: ColumnsType<StockItem> = useMemo(
    () => [
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
      },
      {
        title: '최종 출고 일시',
        dataIndex: 'lastOutboundDate',
        key: 'lastOutboundDate',
      },
    ],
    [currentPage],
  );

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
        dataSource={filteredData}
        loading={loading}
        pagination={{
          pageSize,
          onChange: (page) => setCurrentPage(page),
        }}
        rowKey="key"
      />

      <Modal
        title={selectedItem?.productName}
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
        destroyOnHidden
        width={700}
      >
        {selectedItem && <StockTransactionTable data={txData} loading={txLoading} />}
      </Modal>
    </>
  );
}
