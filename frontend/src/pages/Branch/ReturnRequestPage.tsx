import {
  Button,
  Card,
  Descriptions,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Spin,
  Table,
  Tag,
  Typography,
  message,
  type TableProps,
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { instance } from '../../api/api';
import { useAuthStore } from '../../stores/authStore';
import {
  ORDER_STATUS,
  type OrderDetailResponse,
  type OrderItemDetailResponse,
  type OrderResponse,
} from '../../types/order.type';
import type { Pharmacy, User } from '../../types/profile.type';
import {
  RETURN_STATUS,
  type ReturnCartItem,
  type ReturnDetailResponse,
  type ReturnRequest,
  type ReturnResponse,
  type ReturnStatus,
} from '../../types/return.type';

const statusOptions = [
  { value: RETURN_STATUS.REQUESTED, text: '대기' },
  { value: RETURN_STATUS.APPROVED, text: '승인' },
  { value: RETURN_STATUS.PROCESSING, text: '처리중' },
  { value: RETURN_STATUS.COMPLETED, text: '완료' },
  { value: RETURN_STATUS.REJECTED, text: '반려' },
];

const getStatusTag = (status: ReturnStatus) => {
  const statusColorMap: Record<ReturnStatus, { color: string; text: string }> = {
    [RETURN_STATUS.REQUESTED]: { color: 'orange', text: '대기' },
    [RETURN_STATUS.APPROVED]: { color: 'blue', text: '승인' },
    [RETURN_STATUS.PROCESSING]: { color: 'blue', text: '처리중' },
    [RETURN_STATUS.COMPLETED]: { color: 'green', text: '완료' },
    [RETURN_STATUS.REJECTED]: { color: 'default', text: '반려' },
  };
  const { color, text } = statusColorMap[status];
  return (
    <Tag bordered={true} color={color}>
      {text}
    </Tag>
  );
};

const CART_PAGE_SIZE = 10;
const ORDERS_PAGE_SIZE = 10;
const RETURNS_PAGE_SIZE = 10;

export default function ReturnRequestPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [returnForm] = Form.useForm();

  const user = useAuthStore((state) => state.user) as User;
  const profile = useAuthStore((state) => state.profile) as Pharmacy;
  const updateUser = useAuthStore((state) => state.updateUser);
  const credit = user.point;
  const pharmacyId = profile.pharmacyId;

  const [returns, setReturns] = useState<ReturnResponse[]>([]);
  const [currentStatusFilter, setCurrentStatusFilter] = useState<ReturnStatus | undefined>(
    undefined,
  );
  const [returnsCurrentPage, setReturnsCurrentPage] = useState<number>(1);
  const [returnsTotal, setReturnsTotal] = useState<number>(0);
  const [returnsLoading, setReturnsLoading] = useState<boolean>(false);
  const [expandedRowData, setExpandedRowData] = useState<Record<number, ReturnDetailResponse>>({});
  const [expandedRowLoading, setExpandedRowLoading] = useState<Record<number, boolean>>({});
  const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([]);

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [ordersCurrentPage, setOrdersCurrentPage] = useState<number>(1);
  const [ordersTotal, setOrdersTotal] = useState<number>(0);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | undefined>(undefined);
  const [orderDetail, setOrderDetail] = useState<OrderDetailResponse | undefined>(undefined);
  const [orderDetailLoading, setOrderDetailLoading] = useState<boolean>(false);
  const [orderItems, setOrderItems] = useState<OrderItemDetailResponse[]>([]);
  const [maxQuantity, setMaxQuantity] = useState<number>(0);

  const [items, setItems] = useState<ReturnCartItem[]>([]);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const totalPrice = items.reduce((sum, item) => sum + item.subtotalPrice, 0);

  const fetchReturns = async (statusFilter: ReturnStatus | undefined) => {
    setReturnsLoading(true);
    try {
      const res = await instance.get('/branch/returns', {
        params: {
          pharmacyId: pharmacyId,
          page: returnsCurrentPage - 1,
          size: RETURNS_PAGE_SIZE,
          status: statusFilter,
        },
      });
      // LOG: 테스트용 로그
      console.log('✨ 반품 목록 로딩 응답:', res.data);
      if (res.data.success) {
        const { data, totalElements } = res.data;
        setReturns(data);
        setReturnsTotal(totalElements);
      }
    } catch (e: any) {
      console.error('반품 목록 로딩 실패:', e);
      messageApi.error(e.message || '반품 목록 로딩 중 오류가 발생했습니다.');
    } finally {
      setReturnsLoading(false);
    }
  };

  const fetchReturnDetail = async (returnId: number) => {
    setExpandedRowLoading((prev) => ({ ...prev, [returnId]: true }));
    try {
      const res = await instance.get(`/branch/returns/${returnId}`);
      // LOG: 테스트용 로그
      console.log('✨ 반품 상세 로딩 응답:', res.data);
      if (res.data.success) {
        setExpandedRowData((prev) => ({ ...prev, [returnId]: res.data.data }));
      }
    } catch (e: any) {
      console.error('반품 상세 로딩 실패:', e);
      messageApi.error(e.message || '반품 상세 로딩 중 오류가 발생했습니다.');
    } finally {
      setExpandedRowLoading((prev) => ({ ...prev, [returnId]: false }));
    }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await instance.get('/orders/branch/orders', {
        params: {
          pharmacyId: pharmacyId,
          page: ordersCurrentPage - 1,
          size: ORDERS_PAGE_SIZE,
          status: ORDER_STATUS.COMPLETED,
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
    setOrderDetailLoading(true);
    try {
      const res = await instance.get(`/orders/${orderId}`);
      // LOG: 테스트용 로그
      console.log('✨ 주문 상세 로딩 응답:', res.data);
      if (res.data.success) {
        setOrderDetail(res.data.data);
        setOrderItems(res.data.data.items);
        form.setFieldsValue({
          productName: undefined,
          quantity: undefined,
          unitPrice: undefined,
        });
      }
    } catch (e: any) {
      console.error('주문 상세 로딩 실패:', e);
      messageApi.error(e.message || '주문 상세 로딩 중 오류가 발생했습니다.');
    } finally {
      setOrderDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns(currentStatusFilter);
  }, [returnsCurrentPage, currentStatusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [isModalVisible, ordersCurrentPage]);

  useEffect(() => {
    if (!orderDetail) setOrderItems([]);
  }, [orderDetail]);

  const handleItemChange = (productId: number) => {
    const selectedItem = orderItems.find((item) => item.productId === productId);
    if (selectedItem) {
      setMaxQuantity(selectedItem.quantity);
      form.setFieldsValue({
        productName: selectedItem.productId,
        unitPrice: selectedItem.unitPrice,
      });
    }
  };

  const handleAddItem = (values: { productName: number; quantity: number }) => {
    const { productName, quantity } = values;
    const selectedItem = orderItems.find((i) => i.productId === productName);
    if (selectedItem) {
      const newItem: ReturnCartItem = {
        productId: selectedItem.productId,
        productName: selectedItem.productName,
        manufacturer: selectedItem.manufacturer,
        mainCategory: selectedItem.mainCategory,
        subCategory: selectedItem.subCategory,
        quantity: quantity,
        unitPrice: selectedItem.unitPrice,
        subtotalPrice: selectedItem.unitPrice * quantity,
      };
      setItems((prevItems) => {
        const existingItem = prevItems.find((i) => i.productId === newItem.productId);
        if (existingItem) {
          messageApi.warning('이미 반품 목록에 있는 제품입니다.');
          return prevItems;
        }
        messageApi.success(`${newItem.productName}을(를) 반품 목록에 추가했습니다.`);
        return [...prevItems, newItem];
      });
      form.resetFields(['productName', 'quantity', 'unitPrice']);
    }
  };

  const handleRemoveItem = (productId: number) => {
    setItems((prevItems) => prevItems.filter((i) => i.productId !== productId));
  };

  const handleSubmit = async (values: { reason: string | string[] }) => {
    const { reason } = values;
    if (!selectedOrder || items.length === 0) {
      messageApi.error('주문을 선택하고 반품할 제품을 추가해주세요.');
      return;
    }
    const reasonText = Array.isArray(reason) ? reason.join(', ') : reason;
    const payload: ReturnRequest = {
      pharmacyId: pharmacyId,
      orderId: selectedOrder.orderId,
      reason: reasonText,
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    };
    setSubmitLoading(true);
    try {
      const res = await instance.post('/branch/returns', payload);
      // LOG: 테스트용 로그
      console.log('✨ 반품 요청 응답:', res.data);
      if (res.data.success) {
        messageApi.success('반품 요청이 완료되었습니다.');
        fetchReturns(currentStatusFilter);
        updateUser({ point: credit + res.data.data.totalPrice });
        setItems([]);
        setSelectedOrder(undefined);
        returnForm.resetFields(['reason']);
      }
    } catch (e: any) {
      console.error('반품 요청 실패:', e);
      messageApi.error(e.message || '반품 요청 중 오류가 발생했습니다.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleTableChange = (pagination: any, filters: any) => {
    const newStatus = filters.status ? filters.status[0] : undefined;
    const newPage = pagination.current;
    if (newStatus !== currentStatusFilter) {
      setCurrentStatusFilter(newStatus);
      setReturnsCurrentPage(1);
      return;
    }
    if (newPage !== returnsCurrentPage) {
      setReturnsCurrentPage(newPage);
    }
  };

  const handleExpand = (expanded: boolean, record: ReturnResponse) => {
    const returnId = record.returnId;
    if (expanded) {
      fetchReturnDetail(returnId);
    }
    setExpandedRowKeys(
      expanded ? [...expandedRowKeys, returnId] : expandedRowKeys.filter((key) => key !== returnId),
    );
  };

  // 반품카트 테이블
  const cartColumns: TableProps<ReturnCartItem>['columns'] = [
    { title: '제품명', dataIndex: 'productName', key: 'productName' },
    { title: '제조사', dataIndex: 'manufacturer', key: 'manufacturer' },
    { title: '대분류', dataIndex: 'mainCategory', key: 'mainCategory' },
    { title: '소분류', dataIndex: 'subCategory', key: 'subCategory' },
    { title: '단가', dataIndex: 'unitPrice', render: (v) => `${v.toLocaleString()}원` },
    { title: '수량', dataIndex: 'quantity', key: 'quantity' },
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
        <Button danger onClick={() => handleRemoveItem(record.productId)}>
          삭제
        </Button>
      ),
    },
  ];

  // 반품내역 테이블
  const returnsColumns: TableProps<ReturnResponse>['columns'] = [
    { title: '번호', dataIndex: 'returnId', key: 'returnId' },
    {
      title: '일시',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v) => dayjs(v).format('YYYY. MM. DD. HH:mm'),
    },
    {
      title: '요약',
      key: 'returnSummary',
      render: (_, record) => {
        if (record.items.length > 1) {
          return `${record.items[0].productName} 외 ${record.items.length - 1}건`;
        } else {
          return `${record.items[0].productName}`;
        }
      },
    },
    { title: '사유', dataIndex: 'reason', key: 'reason' },
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

  // 반품내역 테이블 상세
  const expandedRowRender = (record: ReturnResponse) => {
    const detailData = expandedRowData[record.returnId];
    const isLoading = expandedRowLoading[record.returnId];
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
                <Table.Summary.Cell index={0} colSpan={3} />
                <Table.Summary.Cell index={1}>합계</Table.Summary.Cell>
                <Table.Summary.Cell index={2}>
                  {detailData.totalPrice.toLocaleString()}원
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
        반품 요청
      </Typography.Title>

      <Form form={form} layout="vertical" onFinish={handleAddItem}>
        <Flex vertical>
          <Flex wrap>
            <Form.Item
              name="orderId"
              label="주문번호"
              rules={[{ required: true, message: '주문번호를 선택해주세요.' }]}
            >
              <Input readOnly onClick={() => setIsModalVisible(true)} placeholder="주문번호 선택" />
            </Form.Item>
          </Flex>
          <Flex wrap>
            <Form.Item
              name="productName"
              label="제품명"
              rules={[{ required: true, message: '제품을 선택해주세요.' }]}
            >
              <Select
                placeholder="제품 선택"
                onChange={handleItemChange}
                disabled={!selectedOrder || orderDetailLoading}
                options={
                  orderItems.length > 0
                    ? orderItems.map((item) => ({
                        value: item.productId,
                        label: item.productName,
                      }))
                    : []
                }
              />
            </Form.Item>
            <Form.Item
              name="quantity"
              label="반품 수량"
              rules={[
                { required: true, message: '반품 수량을 입력해주세요.' },
                () => ({
                  validator(_, value) {
                    if (!value || value <= maxQuantity) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error(`반품 수량은 주문 수량(${maxQuantity}개)을 초과할 수 없습니다.`),
                    );
                  },
                }),
              ]}
            >
              <InputNumber
                min={1}
                max={maxQuantity}
                style={{ width: '100%' }}
                placeholder={`주문 수량: ${maxQuantity}개`}
              />
            </Form.Item>
            <Form.Item name="unitPrice" label="단가">
              <Input readOnly suffix="원" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                항목 추가
              </Button>
            </Form.Item>
          </Flex>
        </Flex>
      </Form>

      <Modal
        title="발주 내역 선택"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setOrdersCurrentPage(1);
        }}
        footer={null}
        width={'400px'}
      >
        {orders.length > 0 ? (
          orders.map((order) => (
            <Card
              hoverable
              key={order.orderId}
              onClick={() => {
                setSelectedOrder(order);
                fetchOrderDetail(order.orderId);
                setIsModalVisible(false);
                form.setFieldsValue({
                  orderId: order.orderId,
                });
              }}
            >
              <Descriptions
                title={dayjs(order.createdAt).format('YYYY-MM-DD')}
                column={1}
                size="small"
              >
                <Descriptions.Item label="주문번호">{order.orderId}</Descriptions.Item>
                <Descriptions.Item label="요약">
                  {order.items.length > 1
                    ? `${order.items[0].productName} 외 ${order.items.length - 1}건`
                    : `${order.items[0].productName}`}
                </Descriptions.Item>
                <Descriptions.Item label="합계">
                  {order.totalPrice.toLocaleString()}원
                </Descriptions.Item>
              </Descriptions>
            </Card>
          ))
        ) : (
          <Typography.Text>발주 내역이 없습니다.</Typography.Text>
        )}
      </Modal>

      <Typography.Title level={4} style={{ marginBottom: '24px' }}>
        상세 내역
      </Typography.Title>
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
        summary={() => (
          <Table.Summary fixed>
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={5} />
              <Table.Summary.Cell index={1}>합계</Table.Summary.Cell>
              <Table.Summary.Cell index={2}>{totalPrice.toLocaleString()}원</Table.Summary.Cell>
            </Table.Summary.Row>
          </Table.Summary>
        )}
      />
      <Form form={returnForm} onFinish={handleSubmit}>
        <Flex align="flex-end">
          <Form.Item
            name="reason"
            label="반품 사유"
            rules={[{ required: true, message: '반품 사유를 입력해주세요.' }]}
          >
            <Select
              placeholder="반품 사유를 선택하세요. (직접 입력 가능)"
              options={[
                { value: '제품 불량', label: '제품 불량' },
                { value: '오배송', label: '오배송' },
                { value: '고객 단순 변심', label: '고객 단순 변심' },
                { value: '주문 실수', label: '주문 실수' },
              ]}
              mode="tags"
              optionFilterProp="label"
            />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            disabled={items.length === 0}
            loading={submitLoading}
          >
            반품 요청
          </Button>
        </Flex>
      </Form>

      <Typography.Title level={4} style={{ marginBottom: '24px' }}>
        반품 내역
      </Typography.Title>
      <Table
        columns={returnsColumns}
        dataSource={returns}
        loading={returnsLoading}
        rowKey={(record) => record.returnId}
        onChange={handleTableChange}
        pagination={{
          position: ['bottomCenter'],
          pageSize: RETURNS_PAGE_SIZE,
          total: returnsTotal,
          current: returnsCurrentPage,
          onChange: (page) => setReturnsCurrentPage(page),
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
