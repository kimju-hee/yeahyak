import { Button, Card, Form, InputNumber, message, Modal, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useMemo, useState } from 'react';
import { productAPI, stockAPI } from '../../api';
import { SearchBox } from '../../components/SearchBox';
import { STOCK_TX_TYPE_TEXT } from '../../constants';
import type { ProductList, StockInRequest, StockTxDetail } from '../../types';

// 입고 처리 폼 컴포넌트
const StockInForm: React.FC<{
  product: ProductList;
  onSubmit: (amount: number) => Promise<void>;
  loading: boolean;
}> = ({ product, onSubmit, loading }) => {
  const [form] = Form.useForm();

  const handleSubmit = async (values: { amount: number }) => {
    try {
      await onSubmit(values.amount);
      form.resetFields();
      message.success('입고 처리가 완료되었습니다.');
    } catch (error) {
      message.error('입고 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <Card title="입고" style={{ marginBottom: 16 }}>
      <div style={{ marginBottom: 16 }}>
        <p>
          <strong>현재 재고:</strong> {product.stockQty.toLocaleString()}개
        </p>
      </div>
      <Form form={form} layout="inline" onFinish={handleSubmit} initialValues={{ amount: 1 }}>
        <Form.Item
          label="입고 수량"
          name="amount"
          rules={[
            { required: true, message: '입고 수량을 입력해주세요.' },
            { type: 'number', min: 1, message: '1 이상의 수량을 입력해주세요.' },
          ]}
        >
          <InputNumber min={1} placeholder="입고 수량" style={{ width: 120 }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            입고 처리
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

// 재고 거래 내역 테이블 컴포넌트
const StockTransactionTable: React.FC<{
  data: StockTxDetail[];
  loading?: boolean;
}> = ({ data, loading }) => {
  const columns: ColumnsType<StockTxDetail> = [
    {
      title: '날짜',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value) => (value ? new Date(value).toLocaleDateString() : '-'),
    },
    {
      title: '구분',
      dataIndex: 'type',
      key: 'type',
      render: (type: keyof typeof STOCK_TX_TYPE_TEXT) => STOCK_TX_TYPE_TEXT[type] || type,
    },
    {
      title: '수량',
      dataIndex: 'amount',
      key: 'amount',
      render: (value) => value.toLocaleString(),
    },
    {
      title: '재고',
      dataIndex: 'quantityAfter',
      key: 'quantityAfter',
      render: (value) => value.toLocaleString(),
    },
  ];

  return (
    <Card
      title="거래 내역"
      styles={{ body: { maxHeight: 400, overflowY: 'auto', paddingRight: 8 } }}
    >
      <Table
        size="small"
        pagination={false}
        loading={loading}
        columns={columns}
        dataSource={data}
        rowKey="stockTxId"
        scroll={{ y: 360 }}
      />
    </Card>
  );
};

export default function HqStockPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductList | null>(null);
  const [products, setProducts] = useState<ProductList[]>([]);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [txLoading, setTxLoading] = useState(false);
  const [stockInLoading, setStockInLoading] = useState(false);
  const [txData, setTxData] = useState<StockTxDetail[]>([]);
  const pageSize = 10;

  // 제품 목록 조회
  const fetchProducts = async (keyword = '', page = 0, size = 100) => {
    setLoading(true);
    try {
      // mainCategory가 필수인 것 같으니 모든 카테고리에서 가져오기
      const categories = ['전문의약품', '일반의약품', '의약외품'] as const;
      let allProducts: ProductList[] = [];

      if (keyword.trim()) {
        // 검색어가 있으면 모든 카테고리에서 검색
        for (const category of categories) {
          const response = await productAPI.getProducts({
            mainCategory: category,
            keyword: keyword.trim(),
            page: 0,
            size: 1000, // 충분히 큰 수로 설정
          });
          if (response.success && response.data) {
            allProducts = [...allProducts, ...response.data];
          }
        }
      } else {
        // 검색어가 없으면 모든 카테고리의 제품 가져오기
        for (const category of categories) {
          const response = await productAPI.getProducts({
            mainCategory: category,
            page: 0,
            size: 1000, // 충분히 큰 수로 설정
          });
          if (response.success && response.data) {
            allProducts = [...allProducts, ...response.data];
          }
        }
      }

      setProducts(allProducts);
      if (page === 0) {
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('제품 목록 조회 실패:', error);
      setProducts([]);
      message.error('제품 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 재고 거래 내역 조회
  const fetchStockTransactions = async (productId: number) => {
    setTxLoading(true);
    try {
      const response = await stockAPI.getStockTxList({
        productId,
        page: 0,
        size: 100,
      });

      if (response.success) {
        const { data } = response;
        setTxData(data);
      } else {
        setTxData([]);
      }
    } catch (error) {
      console.error('재고 거래 내역 조회 실패:', error);
      setTxData([]);
      message.error('재고 거래 내역을 불러오는데 실패했습니다.');
    } finally {
      setTxLoading(false);
    }
  };

  // 모달 열기
  const showModal = async (product: ProductList) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
    await fetchStockTransactions(product.productId);
  };

  // 모달 닫기
  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setTxData([]);
  };

  // 검색
  const handleSearch = () => {
    const keyword = searchKeyword.trim();
    fetchProducts(keyword);
  };

  // 입고 처리
  const handleStockIn = async (amount: number) => {
    if (!selectedProduct) return;

    setStockInLoading(true);
    try {
      const request: StockInRequest = {
        productId: selectedProduct.productId,
        amount: amount,
      };

      const response = await stockAPI.stockIn(request);

      if (response.success) {
        message.success('입고 처리가 완료되었습니다.');
        // 재고 거래 내역 다시 조회
        await fetchStockTransactions(selectedProduct.productId);
        // 제품 목록도 다시 조회 (재고량 업데이트를 위해)
        await fetchProducts(searchKeyword);
        // 선택된 제품의 재고량 업데이트
        setSelectedProduct((prev) => (prev ? { ...prev, stockQty: prev.stockQty + amount } : null));
      }
    } catch (error) {
      console.error('입고 처리 실패:', error);
      throw error;
    } finally {
      setStockInLoading(false);
    }
  };

  const columns: ColumnsType<ProductList> = useMemo(
    () => [
      {
        title: '번호',
        key: 'index',
        render: (_text, _record, index) => (currentPage - 1) * pageSize + index + 1,
        width: 60,
      },
      {
        title: '제품명',
        dataIndex: 'productName',
        key: 'productName',
        render: (text, record) => (
          <Button type="link" onClick={() => showModal(record)}>
            {text}
          </Button>
        ),
      },
      {
        title: '제조사',
        dataIndex: 'manufacturer',
        key: 'manufacturer',
      },
      {
        title: '단위',
        dataIndex: 'unit',
        key: 'unit',
        width: 80,
      },
      {
        title: '단가',
        dataIndex: 'unitPrice',
        key: 'unitPrice',
        render: (value) => `${value.toLocaleString()}원`,
        width: 120,
      },
      {
        title: '재고 수량',
        dataIndex: 'stockQty',
        key: 'stockQty',
        render: (value) => (
          <span style={{ color: value === 0 ? 'red' : value < 10 ? 'orange' : undefined }}>
            {value.toLocaleString()}
          </span>
        ),
        width: 100,
      },
      {
        title: '최근 입고일',
        dataIndex: 'latestStockInAt',
        key: 'latestStockInAt',
        render: (value) => (value ? new Date(value).toLocaleDateString() : '-'),
        width: 120,
      },
    ],
    [currentPage],
  );

  return (
    <>
      <Typography.Title level={3}>재고 관리</Typography.Title>

      <SearchBox
        searchField="productName"
        searchOptions={[{ value: 'productName', label: '제품명' }]}
        searchKeyword={searchKeyword}
        onSearchFieldChange={() => {}}
        onSearchKeywordChange={setSearchKeyword}
        onSearch={handleSearch}
      />

      <Table
        columns={columns}
        dataSource={products}
        loading={loading}
        pagination={{
          pageSize,
          onChange: (page) => setCurrentPage(page),
          showSizeChanger: false,
        }}
        rowKey="productId"
        style={{ marginTop: 16 }}
      />

      <Modal
        title={`${selectedProduct?.productName} - 재고 관리`}
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
        destroyOnHidden
        width={800}
      >
        {selectedProduct && (
          <div>
            <StockInForm
              product={selectedProduct}
              onSubmit={handleStockIn}
              loading={stockInLoading}
            />
            <StockTransactionTable data={txData} loading={txLoading} />
          </div>
        )}
      </Modal>
    </>
  );
}
