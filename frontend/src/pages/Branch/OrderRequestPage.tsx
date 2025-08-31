import { UploadOutlined } from '@ant-design/icons';
import {
  Button,
  Cascader,
  Col,
  Descriptions,
  Divider,
  Flex,
  InputNumber,
  message,
  Modal,
  Row,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
  Upload,
  type CascaderProps,
  type TableProps,
  type UploadFile,
  type UploadProps,
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { orderAPI, productAPI } from '../../api';
import { SearchBox } from '../../components';
import {
  CREDIT_LIMIT,
  DATE_FORMAT,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_OPTIONS,
  ORDER_STATUS_TEXT,
  PAGE_SIZE,
  SUB_CATEGORY_TEXT,
} from '../../constants';
import { useAuthStore } from '../../stores/authStore';
import { useOrderCartStore } from '../../stores/orderCartStore';
import type {
  MainCategory,
  OrderCartItem,
  OrderCreateRequest,
  OrderDetail,
  OrderList,
  OrderStatus,
  Pharmacy,
  ProductList,
  SubCategoryWithAll,
} from '../../types';
import { PRODUCT_CATEGORIES } from '../../types';
import { PLACEHOLDER } from '../../utils';

const getStatusTag = (status: OrderStatus) => {
  const color = ORDER_STATUS_COLORS[status];
  const text = ORDER_STATUS_TEXT[status];
  return (
    <Tag bordered={true} color={color} style={{ cursor: 'default' }}>
      {text}
    </Tag>
  );
};

export default function OrderRequestPage() {
  const [messageApi, contextHolder] = message.useMessage();

  const profile = useAuthStore((state) => state.profile) as Pharmacy;
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const pharmacyId = profile.pharmacyId;
  const balance = profile.balance;
  const { items, addItem, removeItem, updateQuantity, clearCart, getTotalPrice } =
    useOrderCartStore();

  const [orders, setOrders] = useState<OrderList[]>([]);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>(undefined);
  const [ordersCurrentPage, setOrdersCurrentPage] = useState<number>(1);
  const [ordersTotal, setOrdersTotal] = useState<number>(0);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(false);
  const [expandedRowData, setExpandedRowData] = useState<Record<number, OrderDetail>>({});
  const [expandedRowLoading, setExpandedRowLoading] = useState<Record<number, boolean>>({});
  const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([]);

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [products, setProducts] = useState<ProductList[]>([]);
  const [activeMainCategory, setActiveMainCategory] = useState<MainCategory>('전문의약품');
  const [activeSubCategory, setActiveSubCategory] = useState<SubCategoryWithAll>('전체');
  const [search, setSearch] = useState({
    field: 'productName',
    keyword: undefined as string | undefined,
    appliedField: 'productName',
    appliedKeyword: undefined as string | undefined,
  });
  const [productsCurrentPage, setProductsCurrentPage] = useState<number>(1);
  const [productsTotal, setProductsTotal] = useState<number>(0);
  const [productsLoading, setProductsLoading] = useState<boolean>(false);

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);

  const totalPrice = getTotalPrice();

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

  const fetchOrders = async (statusFilter: OrderStatus | undefined) => {
    setOrdersLoading(true);
    try {
      const res = await orderAPI.getOrdersBranch({
        pharmacyId: pharmacyId,
        status: statusFilter || undefined,
        page: ordersCurrentPage - 1,
        size: PAGE_SIZE,
      });

      if (res.success) {
        const { data, page } = res;
        setOrders(data);
        setOrdersTotal(page.totalElements);
      }
    } catch (e: any) {
      console.error('주문 목록 로딩 실패:', e);
      messageApi.error(e.response?.data?.message || '주문 목록 로딩 중 오류가 발생했습니다.');
      setOrders([]);
      setOrdersTotal(0);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchOrderDetail = async (orderId: number) => {
    setExpandedRowLoading((prev) => ({ ...prev, [orderId]: true }));
    try {
      const res = await orderAPI.getOrder(orderId);

      if (res.success) {
        setExpandedRowData((prev) => ({ ...prev, [orderId]: res.data }));
      }
    } catch (e: any) {
      console.error('주문 상세 로딩 실패:', e);
      messageApi.error(e.response?.data?.message || '주문 상세 로딩 중 오류가 발생했습니다.');
    } finally {
      setExpandedRowLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const res = await productAPI.getProducts({
        mainCategory: activeMainCategory,
        subCategory: activeSubCategory === '전체' ? undefined : activeSubCategory,
        keyword: search.appliedKeyword || undefined,
        threshold: undefined,
        page: productsCurrentPage - 1,
        size: PAGE_SIZE,
      });

      if (res.success) {
        const { data, page } = res;
        setProducts(data);
        setProductsTotal(page.totalElements);
      }
    } catch (e: any) {
      console.error('상품 목록 로딩 실패:', e);
      messageApi.error(e.response?.data?.message || '상품 목록 로딩 중 오류가 발생했습니다.');
      setProducts([]);
      setProductsTotal(0);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(statusFilter);
  }, [ordersCurrentPage, statusFilter]);

  useEffect(() => {
    fetchProducts();
  }, [
    isModalVisible,
    productsCurrentPage,
    activeMainCategory,
    activeSubCategory,
    search.appliedKeyword,
    search.appliedField,
  ]);

  const handleUploadChange: UploadProps['onChange'] = ({ fileList }) => {
    setFileList(fileList);
  };

  const handleAiSuggest = async () => {
    if (fileList.length === 0 || !fileList[0].originFileObj) {
      messageApi.warning('파일을 업로드해주세요');
      return;
    }
    setAiLoading(true);
    try {
      const file = fileList[0].originFileObj as File;
      const res = await orderAPI.forecastOrder({ file });

      if (res.success) {
        messageApi.success('AI 발주 추천이 완료되었습니다!');
        const recommendedItems: OrderCartItem[] = res.data.map((item: any) => ({
          productId: item.productId,
          productName: item.productName,
          insuranceCode: item.insuranceCode,
          manufacturer: item.manufacturer,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          subtotalPrice: item.subtotalPrice,
          productImgUrl: item.productImgUrl || PLACEHOLDER,
        }));
        addItem(recommendedItems);
      }
    } catch (e: any) {
      console.error('AI 발주 추천 실패:', e);
      messageApi.error(e.response?.data?.message || 'AI 발주 추천 중 오류가 발생했습니다.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (balance + totalPrice > CREDIT_LIMIT) {
      messageApi.error('신용 한도를 초과합니다.');
      return;
    }

    setSubmitLoading(true);
    try {
      const payload: OrderCreateRequest = {
        pharmacyId: pharmacyId,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotalPrice: item.subtotalPrice,
        })),
      };
      const res = await orderAPI.createOrder(payload);

      if (res.success) {
        messageApi.success('발주 요청이 완료되었습니다.');
        fetchOrders(statusFilter);
        updateProfile({ balance: balance + totalPrice });
        clearCart();
      }
    } catch (e: any) {
      console.error('발주 요청 실패:', e);
      messageApi.error(e.response?.data?.message || '발주 요청 중 오류가 발생했습니다.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleTableChange = (pagination: any, filters: any) => {
    const newStatus = filters.status ? filters.status[0] : undefined;
    const newPage = pagination.current;
    if (newStatus !== statusFilter) {
      setStatusFilter(newStatus);
      setOrdersCurrentPage(1);
      return;
    }
    if (newPage !== ordersCurrentPage) setOrdersCurrentPage(newPage);
  };

  const handleExpand = (expanded: boolean, record: OrderList) => {
    const orderId = record.orderId;
    if (expanded) fetchOrderDetail(orderId);
    setExpandedRowKeys(
      expanded ? [...expandedRowKeys, orderId] : expandedRowKeys.filter((key) => key !== orderId),
    );
  };

  // 발주카트 테이블
  const cartColumns: TableProps<OrderCartItem>['columns'] = [
    {
      title: '제품 이미지',
      dataIndex: 'productImgUrl',
      key: 'productImgUrl',
      render: (url) => <img src={url || PLACEHOLDER} alt="제품 이미지" style={{ width: '100%' }} />,
      align: 'center',
      width: '15%',
    },
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
    {
      title: <div style={{ textAlign: 'center' }}>단가</div>,
      dataIndex: 'unitPrice',
      render: (value) => `${Number(value ?? 0).toLocaleString()}원`,
      align: 'right',
      width: '15%',
    },
    {
      title: '수량',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (value, record) => (
        <InputNumber
          min={1}
          value={value}
          onChange={(newQuantity) => {
            if (newQuantity) updateQuantity(record.productId, newQuantity);
          }}
          onBlur={(e) => {
            const value = Number(e.target.value);
            if (value <= 0) updateQuantity(record.productId, 1);
          }}
          style={{ width: '100%' }}
        />
      ),
      align: 'center',
      width: '10%',
    },
    {
      title: <div style={{ textAlign: 'center' }}>소계</div>,
      dataIndex: 'subtotalPrice',
      key: 'subtotalPrice',
      render: (value) => `${Number(value ?? 0).toLocaleString()}원`,
      align: 'right',
      width: '15%',
    },
    {
      key: 'actions',
      render: (_, record) => (
        <Button danger onClick={() => removeItem(record.productId)}>
          삭제
        </Button>
      ),
      align: 'center',
      width: '10%',
    },
  ];

  // 제품목록 테이블
  const productsColumns: TableProps<ProductList>['columns'] = [
    {
      title: '제품 이미지',
      dataIndex: 'productImgUrl',
      key: 'productImgUrl',
      render: (url) => (
        <img src={url || PLACEHOLDER} alt="제품 이미지" style={{ width: 60, height: 60 }} />
      ),
      align: 'center',
      width: '20%',
    },
    {
      title: '제품명',
      dataIndex: 'productName',
      key: 'productName',
      align: 'center',
      width: '30%',
    },
    {
      title: '제조사',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      align: 'center',
      width: '20%',
    },
    {
      title: <div style={{ textAlign: 'center' }}>단가</div>,
      dataIndex: 'unitPrice',
      render: (value) => `${value.toLocaleString()}원`,
      align: 'right',
      width: '20%',
    },
    {
      key: 'actions',
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => {
            const newItem: OrderCartItem = {
              productId: record.productId,
              productName: record.productName,
              manufacturer: record.manufacturer,
              productImgUrl: record.productImgUrl ? record.productImgUrl : PLACEHOLDER,
              quantity: 1,
              unitPrice: record.unitPrice,
              subtotalPrice: record.unitPrice,
            };
            addItem(newItem);
            messageApi.success(`${record.productName}을(를) 장바구니에 추가했습니다.`);
          }}
        >
          담기
        </Button>
      ),
      align: 'center',
      width: '10%',
    },
  ];

  // 발주내역 테이블
  const ordersColumns: TableProps<OrderList>['columns'] = [
    { title: '번호', dataIndex: 'orderId', key: 'orderId', align: 'center', width: '10%' },
    {
      title: '일시',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value) => dayjs(value).format(DATE_FORMAT.DEFAULT),
      align: 'center',
      width: '30%',
    },
    {
      title: '요약',
      dataIndex: 'summary',
      key: 'summary',
      align: 'center',
      width: '30%',
    },
    {
      title: <div style={{ textAlign: 'center' }}>합계</div>,
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (value) => `${value.toLocaleString()}원`,
      align: 'right',
      width: '15%',
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      render: (value) => getStatusTag(value),
      filters: ORDER_STATUS_OPTIONS.map((option) => ({
        text: option.label,
        value: option.value,
      })),
      filterMultiple: false,
      align: 'center',
      width: '15%',
    },
  ];

  // 발주내역 테이블 상세
  const expandedRowRender = (record: OrderList) => {
    const detail = expandedRowData[record.orderId];
    const isLoading = expandedRowLoading[record.orderId];
    if (isLoading) return <Spin />;
    if (!detail) return null;
    return (
      <>
        <Table
          bordered={false}
          dataSource={detail.items}
          columns={[
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
            {
              title: '대분류',
              dataIndex: 'mainCategory',
              key: 'mainCategory',
              align: 'center',
              width: '15%',
            },
            {
              title: '소분류',
              dataIndex: 'subCategory',
              key: 'subCategory',
              align: 'center',
              width: '15%',
            },
            {
              title: '수량',
              dataIndex: 'quantity',
              key: 'quantity',
              align: 'center',
              width: '10%',
            },
            {
              title: <div style={{ textAlign: 'center' }}>단가</div>,
              dataIndex: 'unitPrice',
              key: 'unitPrice',
              render: (value) => `${value.toLocaleString()}원`,
              align: 'right',
              width: '10%',
            },
            {
              title: <div style={{ textAlign: 'center' }}>소계</div>,
              dataIndex: 'subtotalPrice',
              key: 'subtotalPrice',
              render: (value) => `${value.toLocaleString()}원`,
              align: 'right',
              width: '15%',
            },
          ]}
          pagination={false}
          rowKey="productId"
          size="small"
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={5} />
                <Table.Summary.Cell index={1} align="right">
                  합계
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} align="right">
                  {record.totalPrice.toLocaleString()}원
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
          style={{ marginBottom: 8 }}
        />
        <Typography.Text type="secondary">
          최근 상태 업데이트:{' '}
          {detail.updatedAt
            ? dayjs(detail.updatedAt).format(DATE_FORMAT.DEFAULT)
            : dayjs(detail.createdAt).format(DATE_FORMAT.DEFAULT)}
        </Typography.Text>
      </>
    );
  };

  return (
    <>
      {contextHolder}
      <Typography.Title level={3} style={{ marginBottom: 24 }}>
        발주 요청
      </Typography.Title>

      <Flex vertical gap={16}>
        <Descriptions column={3} bordered size="middle" styles={{ label: { textAlign: 'center' } }}>
          <Descriptions.Item label="약국명">{profile.pharmacyName}</Descriptions.Item>
          <Descriptions.Item label="주소">{`${profile.address} ${profile.detailAddress}`}</Descriptions.Item>
          <Descriptions.Item label="요청 일자">
            {dayjs().format(DATE_FORMAT.DATE)}
          </Descriptions.Item>
        </Descriptions>

        <Flex wrap justify="space-between">
          <Space wrap size="middle">
            <Button
              type="primary"
              onClick={() => {
                setIsModalVisible(true);
                setSearch({ keyword: '', appliedKeyword: '', field: '', appliedField: '' });
                setProductsCurrentPage(1);
                setActiveMainCategory('전문의약품');
                setActiveSubCategory('전체');
              }}
            >
              제품 검색
            </Button>
            <Button onClick={clearCart} disabled={items.length === 0}>
              장바구니 비우기
            </Button>
          </Space>
          <Space wrap size="middle">
            {fileList.length === 0 ? (
              <Upload
                accept=".csv"
                showUploadList={false}
                fileList={fileList}
                beforeUpload={() => false}
                onChange={handleUploadChange}
                maxCount={1}
              >
                <Button type="default" icon={<UploadOutlined />}>
                  업로드
                </Button>
              </Upload>
            ) : (
              <>
                <Upload
                  showUploadList={true}
                  fileList={fileList}
                  onRemove={() => setFileList([])}
                  beforeUpload={() => false}
                  style={{ display: 'none' }}
                />
                <Button
                  color="cyan"
                  variant="outlined"
                  onClick={handleAiSuggest}
                  loading={aiLoading}
                >
                  AI 발주 추천
                </Button>
              </>
            )}
            <Tooltip
              title={
                items.length === 0
                  ? '장바구니에 담긴 제품이 없습니다.'
                  : balance + totalPrice > CREDIT_LIMIT
                    ? '여신 한도를 초과합니다.'
                    : ''
              }
            >
              <Button
                type="primary"
                danger
                disabled={items.length === 0 || balance + totalPrice > CREDIT_LIMIT}
                onClick={handleSubmit}
                loading={submitLoading}
              >
                발주 요청
              </Button>
            </Tooltip>
          </Space>
        </Flex>

        <Table
          columns={cartColumns}
          dataSource={items.map((item) => ({
            ...item,
            subtotalPrice: item.unitPrice * item.quantity,
          }))}
          rowKey={(record) => record.productId}
          pagination={false}
        />

        <Row gutter={16} justify="center">
          <Col span={8} style={{ textAlign: 'center' }}>
            <Statistic title="현재 잔액" value={CREDIT_LIMIT - balance} suffix="원" />
          </Col>
          <Col span={8} style={{ textAlign: 'center' }}>
            <Statistic title="합계 금액" value={totalPrice.toLocaleString()} suffix="원" />
          </Col>
          <Col span={8} style={{ textAlign: 'center' }}>
            <Statistic
              title="주문 후 예상 잔액"
              value={CREDIT_LIMIT - (balance + totalPrice)}
              valueStyle={{
                color: CREDIT_LIMIT - (balance + totalPrice) < 0 ? '#f5222d' : '#52c41a',
              }}
              suffix="원"
            />
          </Col>
        </Row>
      </Flex>

      <Divider />

      <Typography.Title level={3} style={{ marginBottom: 24 }}>
        발주 내역
      </Typography.Title>

      <Table
        columns={ordersColumns}
        dataSource={orders}
        loading={ordersLoading}
        rowKey={(record) => record.orderId}
        onChange={handleTableChange}
        pagination={{
          position: ['bottomCenter'],
          pageSize: PAGE_SIZE,
          total: ordersTotal,
          current: ordersCurrentPage,
          onChange: (page) => setOrdersCurrentPage(page),
          showSizeChanger: false,
        }}
        expandable={{
          expandedRowRender,
          onExpand: handleExpand,
          expandedRowKeys,
          expandRowByClick: true,
        }}
      />

      <Modal
        title="제품 목록"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSearch({ keyword: '', appliedKeyword: '', field: '', appliedField: '' });
          setProductsCurrentPage(1);
          setActiveMainCategory('전문의약품');
          setActiveSubCategory('전체');
        }}
        footer={null}
        width={720}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space wrap>
            <Cascader
              options={cascaderOptions}
              onChange={handleCategoryChange}
              placeholder="카테고리를 선택해주세요"
              value={[
                activeMainCategory,
                activeSubCategory === '전체' ? '전체' : activeSubCategory,
              ]}
              style={{ width: 240 }}
            />

            <SearchBox
              searchField="productName"
              searchOptions={[{ label: '제품명', value: 'productName' }]}
              searchKeyword={search.keyword || ''}
              onSearchKeywordChange={(value) => setSearch((prev) => ({ ...prev, keyword: value }))}
              onSearch={() => {
                setSearch((prev) => ({
                  ...prev,
                  appliedField: prev.field,
                  appliedKeyword: prev.keyword,
                }));
                setProductsCurrentPage(1);
              }}
            />
          </Space>
          <Table
            columns={productsColumns}
            dataSource={products}
            loading={productsLoading}
            rowKey={(record) => record.productId}
            pagination={{
              position: ['bottomCenter'],
              pageSize: PAGE_SIZE,
              total: productsTotal,
              current: productsCurrentPage,
              onChange: (page) => setProductsCurrentPage(page),
              showSizeChanger: false,
              size: 'small',
            }}
          />
        </Space>
      </Modal>
    </>
  );
}
