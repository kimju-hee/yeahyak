import {
  Button,
  Cascader,
  Flex,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Table,
  Typography,
  type CascaderProps,
} from 'antd';
import type { TableProps } from 'antd/es/table';
import { useState } from 'react';
import { PRODUCT_PAGE_SIZE, SUB_CATEGORY_TEXT } from '../../constants';
import { useInventoryTxList, useProducts } from '../../hooks';
import {
  PRODUCT_CATEGORIES,
  type InventoryTx,
  type MainCategory,
  type ProductList,
  type SubCategoryWithAll,
} from '../../types';

export default function InventoryPage() {
  const [messageApi, contextHolder] = message.useMessage();

  const [productsCurrentPage, setProductsCurrentPage] = useState<number>(1);
  const [activeMainCategory, setActiveMainCategory] = useState<MainCategory>('전문의약품');
  const [activeSubCategory, setActiveSubCategory] = useState<SubCategoryWithAll>('전체');
  const [selectedItem, setSelectedItem] = useState<ProductList | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 필터 상태
  const [filters, setFilters] = useState({
    threshold: undefined as number | undefined, // 기준재고수량은 threshold로 전달
    productName: undefined as string | undefined,
  });

  // 제품 목록 조회
  const {
    data: productsResponse,
    error: productsError,
    isLoading: productsLoading,
  } = useProducts({
    mainCategory: activeMainCategory,
    subCategory: activeSubCategory === '전체' ? undefined : activeSubCategory,
    page: productsCurrentPage - 1,
    size: PRODUCT_PAGE_SIZE,
    keyword: filters.productName || undefined,
    threshold: filters.threshold || undefined, // 기준재고수량을 threshold로 전달
  });

  const products = productsResponse?.success ? productsResponse.data : [];
  const productsTotal = productsResponse?.success ? productsResponse.page.totalElements : 0;

  // 재고 거래내역 조회 (선택된 제품에 대해)
  const { data: inventoryTxsResponse, isLoading: inventoryTxsLoading } = useInventoryTxList(
    selectedItem?.productId || 0,
    undefined,
    !!selectedItem && isModalOpen,
  );

  const inventoryTxs = inventoryTxsResponse || [];

  // 에러 처리
  if (productsError) {
    messageApi.error('제품 목록을 불러오는데 실패했습니다.');
  }

  // 검색 처리
  const handleSearch = (values: any) => {
    setFilters({
      threshold: values.threshold,
      productName: values.productName,
    });
    setProductsCurrentPage(1);
  };

  // 재고 거래내역 모달 열기
  const handleShowInventoryTx = (product: ProductList) => {
    setSelectedItem(product);
    setIsModalOpen(true);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(undefined);
  };

  // Cascader 옵션 생성
  const cascaderOptions: CascaderProps['options'] = Object.entries(PRODUCT_CATEGORIES).map(
    ([mainCategory, subCategories]) => ({
      value: mainCategory,
      label: mainCategory,
      children: [
        { value: '전체', label: '전체' },
        ...subCategories.map((subCategory) => ({
          value: subCategory,
          label: SUB_CATEGORY_TEXT[subCategory],
        })),
      ],
    }),
  );

  // 카테고리 선택 처리
  const handleCategoryChange = (value: (string | number | null)[] | undefined) => {
    if (value && value.length >= 1 && value[0] !== null) {
      const mainCategory = value[0] as MainCategory;
      const subCategory =
        value.length >= 2 && value[1] !== null ? (value[1] as SubCategoryWithAll) : '전체';

      setActiveMainCategory(mainCategory);
      setActiveSubCategory(subCategory);
      setProductsCurrentPage(1);
    }
  };

  const productTableColumns: TableProps<ProductList>['columns'] = [
    { title: 'No', dataIndex: 'productId', key: 'productId', align: 'center', width: '10%' },
    {
      title: '제품명',
      dataIndex: 'productName',
      key: 'productName',
      align: 'center',
      width: '20%',
    },
    {
      title: '제조사',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      align: 'center',
      width: '15%',
    },

    { title: '단위', dataIndex: 'unit', key: 'unit', width: '10%' },
    {
      title: '재고 수량',
      dataIndex: 'inventoryQty',
      key: 'inventoryQty',
      render: (value) => `${value.toLocaleString()}`,
      align: 'center',
      width: '10%',
    },
    {
      title: '최종 입고 일시',
      dataIndex: 'latestInventoryInAt',
      key: 'latestInventoryInAt',
      align: 'center',
      width: '20%',
    },
    {
      title: '거래내역',
      key: 'actions',
      render: (_, record) => (
        <Button type="link" size="small" onClick={() => handleShowInventoryTx(record)}>
          거래내역
        </Button>
      ),
      align: 'center',
      width: '15%',
    },
  ];

  const inventoryTxTableColumns: TableProps<InventoryTx>['columns'] = [
    { title: '날짜', dataIndex: 'createdAt', key: 'createdAt', align: 'center', width: '25%' },
    { title: '구분', dataIndex: 'type', key: 'type', align: 'center', width: '25%' },
    { title: '수량', dataIndex: 'amount', key: 'amount', align: 'center', width: '25%' },
    {
      title: <div style={{ textAlign: 'center' }}>재고 수량</div>,
      dataIndex: 'inventoryAfter',
      key: 'inventoryAfter',
      render: (value) => `${value.toLocaleString()}`,
      align: 'right',
      width: '25%',
    },
  ];

  return (
    <>
      {contextHolder}
      <Typography.Title level={3} style={{ marginBottom: 24 }}>
        재고 관리
      </Typography.Title>

      <Form onFinish={handleSearch}>
        <Flex wrap justify="space-between" align="start" gap={16} style={{ marginBottom: 16 }}>
          <Form.Item
            name="category"
            label="분류"
            style={{ flex: 1, width: '100%' }}
            rules={[{ required: true, message: '분류를 선택해주세요' }]}
            initialValue={['전문의약품', '전체']}
          >
            <Cascader
              options={cascaderOptions}
              onChange={handleCategoryChange}
              placeholder="카테고리를 선택해주세요"
              value={[
                activeMainCategory,
                activeSubCategory === '전체' ? '전체' : activeSubCategory,
              ]}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item name="threshold" label="기준 재고 수량" style={{ flex: 1, width: '100%' }}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="productName" label="제품명" style={{ flex: 1, width: '100%' }}>
            <Input style={{ width: '100%' }} />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            조회
          </Button>
        </Flex>
      </Form>

      <Table
        columns={productTableColumns}
        dataSource={products}
        loading={productsLoading}
        pagination={{
          position: ['bottomCenter'],
          pageSize: PRODUCT_PAGE_SIZE,
          total: productsTotal,
          current: productsCurrentPage,
          onChange: (page) => setProductsCurrentPage(page),
          showSizeChanger: false,
        }}
        rowKey="productId"
      />

      <Modal
        title={selectedItem?.productName}
        open={isModalOpen}
        footer={null}
        onCancel={handleCloseModal}
        destroyOnClose
        width={720}
      >
        {selectedItem && (
          <Table
            columns={inventoryTxTableColumns}
            dataSource={inventoryTxs}
            loading={inventoryTxsLoading}
            pagination={{ pageSize: 10, showSizeChanger: false }}
            rowKey="inventoryTxId"
          />
        )}
      </Modal>
    </>
  );
}
