import { UploadOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Flex,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Spin,
  Statistic,
  Table,
  Tag,
  Typography,
  Upload,
  type TableProps,
  type UploadFile,
  type UploadProps,
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { aiInstance, instance } from '../../api/api';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import {
  ORDER_STATUS,
  type CartItem,
  type OrderDetailResponse,
  type OrderRequest,
  type OrderResponse,
  type OrderStatus,
} from '../../types/order.type';
import { CREDIT_LIMIT } from '../../types/point.type';
import type { ProductResponse } from '../../types/product.type';
import type { Pharmacy, User } from '../../types/profile.type';

const DEFAULT_IMG = 'https://via.placeholder.com/60x60.png?text=No+Image';

const statusOptions = [
  { value: ORDER_STATUS.REQUESTED, text: '대기' },
  { value: ORDER_STATUS.APPROVED, text: '승인' },
  { value: ORDER_STATUS.PROCESSING, text: '처리중' },
  { value: ORDER_STATUS.SHIPPING, text: '배송중' },
  { value: ORDER_STATUS.COMPLETED, text: '완료' },
  { value: ORDER_STATUS.REJECTED, text: '반려' },
];

const getStatusTag = (status: OrderStatus) => {
  const statusColorMap: Record<OrderStatus, { color: string; text: string }> = {
    [ORDER_STATUS.REQUESTED]: { color: 'orange', text: '대기' },
    [ORDER_STATUS.APPROVED]: { color: 'blue', text: '승인' },
    [ORDER_STATUS.PROCESSING]: { color: 'blue', text: '처리중' },
    [ORDER_STATUS.SHIPPING]: { color: 'cyan', text: '배송중' },
    [ORDER_STATUS.COMPLETED]: { color: 'green', text: '완료' },
    [ORDER_STATUS.REJECTED]: { color: 'default', text: '반려' },
  };
  const { color, text } = statusColorMap[status];
  return (
    <Tag bordered={true} color={color}>
      {text}
    </Tag>
  );
};

const CART_PAGE_SIZE = 10;
const PRODUCTS_PAGE_SIZE = 10;
const ORDERS_PAGE_SIZE = 10;

export default function OrderRequestPage() {
  const [messageApi, contextHolder] = message.useMessage();

  const user = useAuthStore((state) => state.user) as User;
  const profile = useAuthStore((state) => state.profile) as Pharmacy;
  const updateUser = useAuthStore((state) => state.updateUser);
  const credit = user.point;
  const pharmacyId = profile.pharmacyId;
  const { items, addItem, removeItem, updateQuantity, clearCart } = useCartStore();

  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [currentStatusFilter, setCurrentStatusFilter] = useState<OrderStatus | undefined>(
    undefined,
  );
  const [ordersCurrentPage, setOrdersCurrentPage] = useState<number>(1);
  const [ordersTotal, setOrdersTotal] = useState<number>(0);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(false);
  const [expandedRowData, setExpandedRowData] = useState<Record<number, OrderDetailResponse>>({});
  const [expandedRowLoading, setExpandedRowLoading] = useState<Record<number, boolean>>({});
  const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([]);

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [search, setSearch] = useState({
    keyword: undefined as string | undefined,
    appliedKeyword: undefined as string | undefined,
  });
  const [productsCurrentPage, setProductsCurrentPage] = useState<number>(1);
  const [productsTotal, setProductsTotal] = useState<number>(0);
  const [productsLoading, setProductsLoading] = useState<boolean>(false);

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const totalPrice = items.reduce((sum, item) => sum + item.subtotalPrice, 0);

  const fetchOrders = async (statusFilter: OrderStatus | undefined) => {
    setOrdersLoading(true);
    try {
      const res = await instance.get('/orders/branch/orders', {
        params: {
          pharmacyId: pharmacyId,
          page: ordersCurrentPage - 1,
          size: ORDERS_PAGE_SIZE,
          status: statusFilter,
        },
      });
      // LOG: 테스트용 로그
      console.log('✨ 주문 목록 로딩 응답:', res.data);
      if (res.data.success) {
        const { data, totalElements } = res.data;
        setOrders(data);
        setOrdersTotal(totalElements);
      }
    } catch (e: any) {
      console.error('주문 목록 로딩 실패:', e);
      messageApi.error(e.message || '주문 목록 로딩 중 오류가 발생했습니다.');
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchOrderDetail = async (orderId: number) => {
    setExpandedRowLoading((prev) => ({ ...prev, [orderId]: true }));
    try {
      const res = await instance.get(`/orders/${orderId}`);
      // LOG: 테스트용 로그
      console.log('✨ 주문 상세 로딩 응답:', res.data);
      if (res.data.success) {
        setExpandedRowData((prev) => ({ ...prev, [orderId]: res.data.data }));
      }
    } catch (e: any) {
      console.error('주문 상세 로딩 실패:', e);
      messageApi.error(e.message || '주문 상세 로딩 중 오류가 발생했습니다.');
    } finally {
      setExpandedRowLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const res = await instance.get('/products/filter', {
        params: {
          page: productsCurrentPage - 1,
          size: PRODUCTS_PAGE_SIZE,
          keyword: search.appliedKeyword,
        },
      });
      // LOG: 테스트용 로그
      console.log('✨ 상품 목록 로딩 응답:', res.data);
      if (res.data.success) {
        const { data, totalElements } = res.data;
        setProducts(data);
        setProductsTotal(totalElements);
      }
    } catch (e: any) {
      console.error('상품 목록 로딩 실패:', e);
      messageApi.error(e.message || '상품 목록 로딩 중 오류가 발생했습니다.');
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentStatusFilter);
  }, [ordersCurrentPage, currentStatusFilter]);

  useEffect(() => {
    fetchProducts();
  }, [isModalVisible, productsCurrentPage, search.appliedKeyword]);

  // FIXME: 원섭이꺼 보고 수정하기
  const handleUploadChange: UploadProps['onChange'] = ({ fileList }) => {
    setFileList(fileList);
  };

  // FIXME: API response 수정 필요 + 6개월 이상의 데이터가 필요한가요?
  const handleAiSuggest = async () => {
    if (fileList.length === 0 || !fileList[0].originFileObj) {
      messageApi.warning('파일을 업로드 해주세요.');
      return;
    }
    setAiLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', fileList[0].originFileObj as File);
      const res = await aiInstance.post('/forecast/order', formData);
      // LOG: 테스트용 로그
      console.log('✨ AI 발주 추천:', res.data);
      if (res.data.success) {
        messageApi.success('AI 발주 추천이 완료되었습니다!');
        const recommendedItems: CartItem[] = res.data.data.map((item: any) => ({
          productId: Math.floor(Math.random() * 1000000), // response에 없음
          productName: item.product_name,
          productCode: item.product_code,
          manufacturer: '더미 제조사', // response에 없음
          quantity: item.predicted_quantity,
          unitPrice: 15000, // response에 없음
          subtotalPrice: 15000 * item.predicted_quantity, // response에 없음
          productImgUrl: DEFAULT_IMG, // response에 없음
        }));
        addItem(recommendedItems);
      }
    } catch (e: any) {
      console.error('AI 발주 추천 실패:', e);
      messageApi.error(e.message || 'AI 발주 추천 중 오류가 발생했습니다.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (credit - totalPrice < CREDIT_LIMIT) {
      messageApi.error('잔액이 부족합니다.');
      return;
    }
    const payload: OrderRequest = {
      pharmacyId: pharmacyId,
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotalPrice: item.subtotalPrice,
      })),
    };
    setSubmitLoading(true);
    try {
      const res = await instance.post('/orders', payload);
      // LOG: 테스트용 로그
      console.log('✨ 발주 요청 응답:', res.data);
      if (res.data.success) {
        messageApi.success('발주 요청이 완료되었습니다.');
        fetchOrders(currentStatusFilter);
        updateUser({ point: credit - res.data.data.totalPrice });
        clearCart();
      }
    } catch (e: any) {
      console.error('발주 요청 실패:', e);
      messageApi.error(e.message || '발주 요청 중 오류가 발생했습니다.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // BUG: 필터링 된 데이터가 테이블에 안 보이는 문제 (API 응답은 정상적으로 옴)
  const handleTableChange = (pagination: any, filters: any) => {
    const newStatus = filters.status ? filters.status[0] : undefined;
    const newPage = pagination.current;
    if (newStatus !== currentStatusFilter) {
      setCurrentStatusFilter(newStatus);
      setOrdersCurrentPage(1);
      return;
    }
    if (newPage !== ordersCurrentPage) {
      setOrdersCurrentPage(newPage);
    }
  };

  const handleExpand = (expanded: boolean, record: OrderResponse) => {
    const orderId = record.orderId;
    if (expanded) {
      fetchOrderDetail(orderId);
    }
    setExpandedRowKeys(
      expanded ? [...expandedRowKeys, orderId] : expandedRowKeys.filter((key) => key !== orderId),
    );
  };

  // 발주카트 테이블
  const cartColumns: TableProps<CartItem>['columns'] = [
    {
      title: '제품이미지',
      dataIndex: 'productImgUrl',
      key: 'productImgUrl',
      render: (url) => (
        <img src={url || DEFAULT_IMG} alt="제품 이미지" style={{ width: '60px', height: '60px' }} />
      ),
    },
    { title: '제품코드', dataIndex: 'productCode', key: 'productCode' },
    { title: '제품명', dataIndex: 'productName', key: 'productName' },
    { title: '제조사', dataIndex: 'manufacturer', key: 'manufacturer' },
    { title: '단가', dataIndex: 'unitPrice', render: (v) => `${v.toLocaleString()}원` },
    {
      title: '수량',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (v, record) => (
        <InputNumber
          min={1}
          value={v}
          onChange={(newQuantity) => {
            if (newQuantity) {
              updateQuantity(record.productId, newQuantity);
            }
          }}
          onBlur={(e) => {
            const val = Number(e.target.value);
            if (val <= 0) {
              updateQuantity(record.productId, 1);
            }
          }}
        />
      ),
    },
    {
      title: '소계',
      dataIndex: 'subtotalPrice',
      key: 'subtotalPrice',
      render: (v) => `${v.toLocaleString()}원`,
    },
    {
      title: '관리',
      key: 'actions',
      render: (_, record) => (
        <Button danger onClick={() => removeItem(record.productId)}>
          삭제
        </Button>
      ),
    },
  ];

  // 제품목록 테이블
  const productsColumns: TableProps<ProductResponse>['columns'] = [
    {
      title: '제품이미지',
      dataIndex: 'productImgUrl',
      key: 'productImgUrl',
      render: (url) => (
        <img src={url || DEFAULT_IMG} alt="제품 이미지" style={{ width: '60px', height: '60px' }} />
      ),
    },
    { title: '제품코드', dataIndex: 'productCode', key: 'productCode' },
    { title: '제품명', dataIndex: 'productName', key: 'productName' },
    { title: '제조사', dataIndex: 'manufacturer', key: 'manufacturer' },
    { title: '단가', dataIndex: 'unitPrice', render: (v) => `${v.toLocaleString()}원` },
    {
      title: '관리',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => {
            const newItem: CartItem = {
              productId: record.productId,
              productName: record.productName,
              productCode: record.productCode,
              manufacturer: record.manufacturer,
              unitPrice: record.unitPrice,
              quantity: 1,
              subtotalPrice: record.unitPrice,
              productImgUrl: record.productImgUrl,
            };
            addItem(newItem);
            messageApi.success(`${record.productName}을(를) 장바구니에 추가했습니다.`);
          }}
        >
          담기
        </Button>
      ),
    },
  ];

  // 발주내역 테이블
  const ordersColumns: TableProps<OrderResponse>['columns'] = [
    { title: '번호', dataIndex: 'orderId', key: 'orderId' },
    {
      title: '일시',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v) => dayjs(v).format('YYYY. MM. DD. HH:mm'),
    },
    {
      title: '요약',
      key: 'orderSummary',
      render: (_, record) => {
        if (record.items.length > 1) {
          return `${record.items[0].productName} 외 ${record.items.length - 1}건`;
        } else {
          return `${record.items[0].productName}`;
        }
      },
    },
    {
      title: '합계',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (v) => `${v.toLocaleString()}원`,
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      render: (v) => getStatusTag(v),
      filters: statusOptions,
      filterMultiple: false,
    },
  ];

  // 발주내역 테이블 상세
  const expandedRowRender = (record: OrderResponse) => {
    const detailData = expandedRowData[record.orderId];
    const isLoading = expandedRowLoading[record.orderId];
    if (isLoading) return <Spin />;
    if (!detailData) return null;
    return (
      <>
        <Table
          bordered={true}
          dataSource={detailData.items}
          columns={[
            { title: '제품명', dataIndex: 'productName', key: 'productName' },
            { title: '제조사', dataIndex: 'manufacturer', key: 'manufacturer' },
            { title: '대분류', dataIndex: 'mainCategory', key: 'mainCategory' },
            { title: '소분류', dataIndex: 'subCategory', key: 'subCategory' },
            { title: '수량', dataIndex: 'quantity', key: 'quantity' },
            {
              title: '단가',
              dataIndex: 'unitPrice',
              key: 'unitPrice',
              render: (v) => `${v.toLocaleString()}원`,
            },
            {
              title: '소계',
              dataIndex: 'subtotalPrice',
              key: 'subtotalPrice',
              render: (v) => `${v.toLocaleString()}원`,
            },
          ]}
          pagination={false}
          rowKey="productId"
          size="small"
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={5} />
                <Table.Summary.Cell index={1}>합계</Table.Summary.Cell>
                <Table.Summary.Cell index={2}>
                  {record.totalPrice.toLocaleString()}원
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
        <Typography.Text>
          최근 상태 업데이트:{' '}
          {detailData.updatedAt
            ? dayjs(detailData.updatedAt).format('YYYY. MM. DD. HH:mm')
            : dayjs(detailData.createdAt).format('YYYY. MM. DD. HH:mm')}
        </Typography.Text>
      </>
    );
  };

  return (
    <>
      {contextHolder}
      <Typography.Title level={3} style={{ marginBottom: '24px' }}>
        발주 요청
      </Typography.Title>
      <Descriptions column={3} bordered size="middle">
        <Descriptions.Item label="지점명">{profile.pharmacyName}</Descriptions.Item>
        <Descriptions.Item label="주소">{`${profile.address} ${profile.detailAddress}`}</Descriptions.Item>
        <Descriptions.Item label="요청일자">{dayjs().format('YYYY. MM. DD.')}</Descriptions.Item>
      </Descriptions>

      <Typography.Title level={4} style={{ marginBottom: '24px' }}>
        상세 내역
      </Typography.Title>
      <Flex wrap>
        <Button
          type="primary"
          onClick={() => {
            setIsModalVisible(true);
            setSearch({ keyword: '', appliedKeyword: '' });
            setProductsCurrentPage(1);
          }}
        >
          제품 검색
        </Button>
        <Button onClick={clearCart} disabled={items.length === 0}>
          장바구니 비우기
        </Button>
        <Button
          type="primary"
          danger
          onClick={handleSubmit}
          disabled={items.length === 0 || credit - totalPrice < CREDIT_LIMIT}
          loading={submitLoading}
        >
          발주 요청
        </Button>
        <Upload
          listType="text"
          fileList={fileList}
          beforeUpload={() => false}
          onChange={handleUploadChange}
          onRemove={() => setFileList([])}
          maxCount={1}
        >
          {fileList.length >= 1 ? null : (
            <Button type="default" icon={<UploadOutlined />}>
              업로드
            </Button>
          )}
        </Upload>
        <Button onClick={handleAiSuggest} loading={aiLoading}>
          AI 발주 추천
        </Button>
      </Flex>
      <Modal
        title="제품 목록"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSearch({ keyword: '', appliedKeyword: '' });
          setProductsCurrentPage(1);
        }}
        footer={null}
        width={'800px'}
      >
        <Input.Search
          allowClear
          value={search.keyword}
          placeholder="제품명 검색"
          onChange={(e) => setSearch((prev) => ({ ...prev, keyword: e.target.value }))}
          onSearch={() => {
            setSearch((prev) => ({
              ...prev,
              appliedKeyword: prev.keyword,
            }));
            setProductsCurrentPage(1);
          }}
        />
        <Table
          columns={productsColumns}
          dataSource={products}
          loading={productsLoading}
          rowKey={(record) => record.productId}
          pagination={{
            position: ['bottomCenter'],
            pageSize: PRODUCTS_PAGE_SIZE,
            total: productsTotal,
            current: productsCurrentPage,
            onChange: (page) => setProductsCurrentPage(page),
            showSizeChanger: false,
          }}
        />
      </Modal>
      <Table
        columns={cartColumns}
        dataSource={items.map((item) => ({
          ...item,
          subtotalPrice: item.unitPrice * item.quantity,
        }))}
        rowKey={(record) => record.productId}
        pagination={{
          position: ['bottomCenter'],
          pageSize: CART_PAGE_SIZE,
          total: items.length,
        }}
      />

      <Row gutter={16} justify="space-around">
        <Col span={6}>
          <Card variant="borderless">
            <Statistic title="현재 잔액" value={credit} suffix="원" />
          </Card>
        </Col>
        <Col style={{ textAlign: 'center' }}>
          <Typography.Text>-</Typography.Text>
        </Col>
        <Col span={6}>
          <Card variant="borderless">
            <Statistic title="합계 금액" value={totalPrice.toLocaleString()} suffix="원" />
          </Card>
        </Col>
        <Col style={{ textAlign: 'center' }}>
          <Typography.Text>=</Typography.Text>
        </Col>
        <Col span={6}>
          <Card variant="borderless">
            <Statistic
              title="주문 후 예상 잔액"
              value={credit - totalPrice}
              valueStyle={{ color: credit - totalPrice < CREDIT_LIMIT ? '#f5222d' : '#52c41a' }}
              suffix="원"
            />
          </Card>
        </Col>
      </Row>

      <Typography.Title level={4} style={{ marginBottom: '24px' }}>
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
          pageSize: ORDERS_PAGE_SIZE,
          total: ordersTotal,
          current: ordersCurrentPage,
          onChange: (page) => setOrdersCurrentPage(page),
        }}
        expandable={{
          expandedRowRender,
          onExpand: handleExpand,
          expandedRowKeys,
          expandRowByClick: true,
          expandIcon: () => null,
        }}
      />
    </>
  );
}
