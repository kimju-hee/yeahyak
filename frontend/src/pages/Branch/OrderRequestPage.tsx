import { UploadOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  Descriptions,
  Divider,
  Flex,
  InputNumber,
  message,
  Modal,
  Row,
  Spin,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
  Upload,
  type TableProps,
  type UploadFile,
  type UploadProps,
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { orderAPI, productAPI } from '../../api';
import { SearchBox } from '../../components/SearchBox';
import {
  CREDIT_CONSTANTS,
  DATE_FORMAT,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_OPTIONS,
  ORDER_STATUS_TEXT,
  PAGE_SIZE,
} from '../../constants';
import { useAuthStore } from '../../stores/authStore';
import { useOrderCartStore } from '../../stores/orderCartStore';
import type {
  OrderCartItem,
  OrderCreateRequest,
  OrderDetail,
  OrderDetailResponse,
  OrderForecastRequest,
  OrderList,
  OrderStatus,
  Pharmacy,
  ProductList,
  User,
} from '../../types';
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

  const user = useAuthStore((state) => state.user) as User;
  const profile = useAuthStore((state) => state.profile) as Pharmacy;
  const updateUser = useAuthStore((state) => state.updateUser);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const balance = profile.outstandingBalance;
  const pharmacyId = profile.pharmacyId;
  const { items, addItem, removeItem, updateQuantity, clearCart, getTotalPrice } =
    useOrderCartStore();

  const [orders, setOrders] = useState<OrderList[]>([]);
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
  const [products, setProducts] = useState<ProductList[]>([]);
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
  const totalPrice = getTotalPrice();

  const fetchOrders = async (statusFilter: OrderStatus | undefined) => {
    setOrdersLoading(true);
    try {
      const res = await orderAPI.getOrdersBranch({
        pharmacyId: pharmacyId,
        page: ordersCurrentPage - 1,
        size: PAGE_SIZE,
        status: statusFilter,
      });

      if (res.success) {
        const { data, page } = res;
        setOrders(data);
        setOrdersTotal(page.totalElements);
      } else {
        setOrders([]);
        setOrdersTotal(0);
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
        setExpandedRowData((prev) => ({ ...prev, [orderId]: res }));
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
        page: productsCurrentPage - 1,
        size: PAGE_SIZE,
        keyword: search.appliedKeyword ? search.appliedKeyword : undefined,
      });

      if (res.success) {
        const { data, page } = res;
        setProducts(data);
        setProductsTotal(page.totalElements);
      } else {
        setProducts([]);
        setProductsTotal(0);
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
    fetchOrders(currentStatusFilter);
  }, [ordersCurrentPage, currentStatusFilter]);

  useEffect(() => {
    fetchProducts();
  }, [isModalVisible, productsCurrentPage, search.appliedKeyword]);

  const handleUploadChange: UploadProps['onChange'] = ({ fileList }) => {
    setFileList(fileList);
  };

  // FIXME: API response 수정 필요
  const handleAiSuggest = async () => {
    if (fileList.length === 0 || !fileList[0].originFileObj) {
      messageApi.warning('파일을 업로드 해주세요.');
      return;
    }
    setAiLoading(true);
    try {
      const payload: OrderForecastRequest = { file: fileList[0].originFileObj as File };
      const res = await orderAPI.forecastOrder(payload);

      if (res.success) {
        messageApi.success('AI 발주 추천이 완료되었습니다!');
        const recommendedItems: OrderCartItem[] = res.data.map((item: any) => ({
          productId: item.productId,
          productName: item.productName,
          productCode: item.productCode,
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
    if (balance + totalPrice > CREDIT_CONSTANTS.CREDIT_LIMIT) {
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
        fetchOrders(currentStatusFilter);
        updateProfile({ outstandingBalance: balance + res.data.totalPrice }); // FIXME: 우짜지/..
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
    if (newStatus !== currentStatusFilter) {
      setCurrentStatusFilter(newStatus);
      setOrdersCurrentPage(1);
      return;
    }
    if (newPage !== ordersCurrentPage) setOrdersCurrentPage(newPage);
  };

  const handleExpand = (expanded: boolean, record: OrderDetail) => {
    const orderId = record.orderId;
    if (expanded) fetchOrderDetail(orderId);
    setExpandedRowKeys(
      expanded ? [...expandedRowKeys, orderId] : expandedRowKeys.filter((key) => key !== orderId),
    );
  };

  // 발주카트 테이블
  const cartColumns: TableProps<OrderCartItem>['columns'] = [
    {
      title: '제품이미지',
      dataIndex: 'productImgUrl',
      key: 'productImgUrl',
      render: (url) => (
        <img src={url || PLACEHOLDER} alt="제품 이미지" style={{ width: '60px', height: '60px' }} />
      ),
    },
    { title: '제품명', dataIndex: 'productName', key: 'productName' },
    { title: '제조사', dataIndex: 'manufacturer', key: 'manufacturer' },
    { title: '단가', dataIndex: 'unitPrice', render: (value) => `${value.toLocaleString()}원` },
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
        />
      ),
    },
    {
      title: '소계',
      dataIndex: 'subtotalPrice',
      key: 'subtotalPrice',
      render: (value) => `${value.toLocaleString()}원`,
    },
    {
      key: 'actions',
      render: (_, record) => (
        <Button danger onClick={() => removeItem(record.productId)}>
          삭제
        </Button>
      ),
    },
  ];

  // 제품목록 테이블
  const productsColumns: TableProps<ProductList>['columns'] = [
    {
      title: '제품이미지',
      dataIndex: 'productImgUrl',
      key: 'productImgUrl',
      render: (url) => (
        <img src={url || PLACEHOLDER} alt="제품 이미지" style={{ width: '60px', height: '60px' }} />
      ),
    },
    { title: '제품명', dataIndex: 'productName', key: 'productName' },
    { title: '제조사', dataIndex: 'manufacturer', key: 'manufacturer' },
    { title: '단가', dataIndex: 'unitPrice', render: (value) => `${value.toLocaleString()}원` },
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
              unitPrice: record.unitPrice,
              quantity: 1,
              subtotalPrice: record.unitPrice,
              productImgUrl: record.productImgUrl ? record.productImgUrl : PLACEHOLDER,
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
  const ordersColumns: TableProps<OrderList>['columns'] = [
    { title: '주문번호', dataIndex: 'orderId', key: 'orderId' },
    {
      title: '일시',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value) => dayjs(value).format(DATE_FORMAT.DEFAULT),
    },
    {
      title: '요약',
      dataIndex: 'summary',
      key: 'summary',
    },
    {
      title: '합계',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (value) => `${value.toLocaleString()}원`,
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
    },
  ];

  // 발주내역 테이블 상세
  const expandedRowRender = (record: OrderDetail) => {
    const detailData = expandedRowData[record.orderId];
    const isLoading = expandedRowLoading[record.orderId];
    if (isLoading) return <Spin />;
    if (!detailData) return null;
    return (
      <>
        <Table
          bordered={true}
          dataSource={detailData.data.items}
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
              render: (value) => `${value.toLocaleString()}원`,
            },
            {
              title: '소계',
              dataIndex: 'subtotalPrice',
              key: 'subtotalPrice',
              render: (value) => `${value.toLocaleString()}원`,
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
          {detailData.data.updatedAt
            ? dayjs(detailData.data.updatedAt).format(DATE_FORMAT.DEFAULT)
            : dayjs(detailData.data.createdAt).format(DATE_FORMAT.DEFAULT)}
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
      <Descriptions column={3} bordered size="middle" style={{ marginBottom: '24px' }}>
        <Descriptions.Item label="지점명">{profile.pharmacyName}</Descriptions.Item>
        <Descriptions.Item label="주소">{`${profile.address} ${profile.detailAddress}`}</Descriptions.Item>
        <Descriptions.Item label="요청일자">{dayjs().format(DATE_FORMAT.DATE)}</Descriptions.Item>
      </Descriptions>

      <Typography.Title level={4} style={{ marginBottom: '16px' }}>
        상세 내역
      </Typography.Title>
      <Flex wrap gap="8px" style={{ marginBottom: '16px' }}>
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
        <Tooltip
          title={
            items.length === 0
              ? '장바구니에 담긴 제품이 없습니다.'
              : balance + totalPrice > CREDIT_CONSTANTS.CREDIT_LIMIT
                ? '신용 한도를 초과합니다.'
                : ''
          }
        >
          <Button
            type="primary"
            danger
            disabled={items.length === 0 || balance + totalPrice > CREDIT_CONSTANTS.CREDIT_LIMIT}
            onClick={handleSubmit}
            loading={submitLoading}
          >
            발주 요청
          </Button>
        </Tooltip>

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
            <Button onClick={handleAiSuggest} loading={aiLoading}>
              AI 발주 추천
            </Button>
            <Upload
              showUploadList={true}
              fileList={fileList}
              onRemove={() => setFileList([])}
              beforeUpload={() => false}
              style={{ display: 'none' }}
            />
          </>
        )}
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
        <SearchBox
          searchField="productName"
          searchOptions={[{ label: '제품명', value: 'productName' }]}
          searchKeyword={search.keyword || ''}
          onSearchFieldChange={() => {}}
          onSearchKeywordChange={(value) => setSearch((prev) => ({ ...prev, keyword: value }))}
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
            pageSize: PAGE_SIZE,
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
        pagination={false}
        style={{ marginBottom: '24px' }}
      />

      <Row gutter={16} justify="center" style={{ marginBottom: '24px' }}>
        <Col span={8} style={{ textAlign: 'center' }}>
          <Statistic title="현재 잔액" value={balance} suffix="원" />
        </Col>
        <Col span={8} style={{ textAlign: 'center' }}>
          <Statistic title="합계 금액" value={totalPrice.toLocaleString()} suffix="원" />
        </Col>
        <Col span={8} style={{ textAlign: 'center' }}>
          <Statistic
            title="주문 후 예상 잔액"
            value={balance + totalPrice}
            valueStyle={{
              color: balance + totalPrice > CREDIT_CONSTANTS.CREDIT_LIMIT ? '#f5222d' : '#52c41a',
            }}
            suffix="원"
          />
        </Col>
      </Row>

      <Divider />

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
          expandIcon: () => null,
        }}
      />
    </>
  );
}
