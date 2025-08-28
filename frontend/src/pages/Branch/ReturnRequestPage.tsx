import {
  Button,
  Card,
  Descriptions,
  Divider,
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
import { orderAPI, returnAPI } from '../../api';
import {
  DATE_FORMAT,
  PAGE_SIZE,
  RETURN_REASON_OPTIONS,
  RETURN_STATUS_COLORS,
  RETURN_STATUS_OPTIONS,
  RETURN_STATUS_TEXT,
} from '../../constants';
import { useAuthStore } from '../../stores/authStore';
import { useReturnCartStore } from '../../stores/returnCartStore';
import {
  ORDER_STATUS,
  type OrderDetail,
  type OrderDetailItem,
  type OrderList,
  type Pharmacy,
  type ReturnCartItem,
  type ReturnCreateRequest,
  type ReturnDetail,
  type ReturnList,
  type ReturnStatus,
} from '../../types';
import { PLACEHOLDER } from '../../utils';

const getStatusTag = (status: ReturnStatus) => {
  const color = RETURN_STATUS_COLORS[status];
  const text = RETURN_STATUS_TEXT[status];
  return (
    <Tag bordered={true} color={color} style={{ cursor: 'default' }}>
      {text}
    </Tag>
  );
};

export default function ReturnRequestPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [returnForm] = Form.useForm();

  const profile = useAuthStore((state) => state.profile) as Pharmacy;
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const pharmacyId = profile.pharmacyId;
  const balance = profile.outstandingBalance;
  const { items, addItem, removeItem, clearCart, getTotalPrice } = useReturnCartStore();

  const [returns, setReturns] = useState<ReturnList[]>([]);
  const [statusFilter, setStatusFilter] = useState<ReturnStatus | undefined>(undefined);
  const [returnsCurrentPage, setReturnsCurrentPage] = useState<number>(1);
  const [returnsTotal, setReturnsTotal] = useState<number>(0);
  const [returnsLoading, setReturnsLoading] = useState<boolean>(false);
  const [expandedRowData, setExpandedRowData] = useState<Record<number, ReturnDetail>>({});
  const [expandedRowLoading, setExpandedRowLoading] = useState<Record<number, boolean>>({});
  const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([]);

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [orders, setOrders] = useState<OrderList[]>([]);
  const [ordersCurrentPage, setOrdersCurrentPage] = useState<number>(1);
  const [ordersTotal, setOrdersTotal] = useState<number>(0);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(false);

  const [selectedOrder, setSelectedOrder] = useState<OrderList | undefined>(undefined);
  const [orderDetail, setOrderDetail] = useState<OrderDetail | undefined>(undefined);
  const [orderItems, setOrderItems] = useState<OrderDetailItem[]>([]);
  const [orderItemsLoading, setOrderItemsLoading] = useState<boolean>(false);
  const [maxQuantity, setMaxQuantity] = useState<number>(0);

  const [submitLoading, setSubmitLoading] = useState<boolean>(false);

  const totalPrice = getTotalPrice();

  const fetchReturns = async (statusFilter: ReturnStatus | undefined) => {
    setReturnsLoading(true);
    try {
      const res = await returnAPI.getReturnsBranch({
        pharmacyId: pharmacyId,
        status: statusFilter,
        page: returnsCurrentPage - 1,
        size: PAGE_SIZE,
      });

      if (res.success) {
        const { data, page } = res;
        setReturns(data);
        setReturnsTotal(page.totalElements);
      }
    } catch (e: any) {
      console.error('반품 목록 로딩 실패:', e);
      messageApi.error(e.response?.data?.message || '반품 목록 로딩 중 오류가 발생했습니다.');
      setReturns([]);
      setReturnsTotal(0);
    } finally {
      setReturnsLoading(false);
    }
  };

  const fetchReturnDetail = async (returnId: number) => {
    setExpandedRowLoading((prev) => ({ ...prev, [returnId]: true }));
    try {
      const res = await returnAPI.getReturn(returnId);

      if (res.success) {
        setExpandedRowData((prev) => ({ ...prev, [returnId]: res.data }));
      }
    } catch (e: any) {
      console.error('반품 상세 로딩 실패:', e);
      messageApi.error(e.response?.data?.message || '반품 상세 로딩 중 오류가 발생했습니다.');
    } finally {
      setExpandedRowLoading((prev) => ({ ...prev, [returnId]: false }));
    }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await orderAPI.getOrdersBranch({
        pharmacyId: pharmacyId,
        status: ORDER_STATUS.COMPLETED, // 완료된 주문만 조회
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
    setOrderItemsLoading(true);
    try {
      const res = await orderAPI.getOrder(orderId);

      if (res.success) {
        setOrderDetail(res.data);
        setOrderItems(res.data.items as OrderDetailItem[]);
        form.setFieldsValue({
          productName: undefined,
          quantity: undefined,
          unitPrice: undefined,
        });
      }
    } catch (e: any) {
      console.error('주문 상세 로딩 실패:', e);
      messageApi.error(e.response?.data?.message || '주문 상세 로딩 중 오류가 발생했습니다.');
    } finally {
      setOrderItemsLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns(statusFilter);
  }, [returnsCurrentPage, statusFilter]);

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
        productName: selectedItem.productName,
        quantity: undefined,
        unit: selectedItem.unit,
        unitPrice: selectedItem.unitPrice,
      });
    }
  };

  const handleAddItem = (values: { productId: number; quantity: number; unitPrice: number }) => {
    const selectedItem = orderItems.find((item) => item.productId === values.productId);
    if (!selectedItem) {
      messageApi.error('선택한 제품을 찾을 수 없습니다.');
      return;
    }
    addItem({
      productId: selectedItem.productId,
      productName: selectedItem.productName,
      manufacturer: selectedItem.manufacturer,
      quantity: values.quantity,
      unitPrice: selectedItem.unitPrice,
      subtotalPrice: values.unitPrice * values.quantity,
      productImgUrl: selectedItem.productImgUrl || PLACEHOLDER,
    });
    messageApi.success(`${selectedItem.productName}이(가) 반품 카트에 추가되었습니다.`);
    form.resetFields(['productId', 'quantity', 'unitPrice']);
  };

  const handleSubmit = async (values: { reason: string | string[] }) => {
    if (!selectedOrder || items.length === 0) {
      messageApi.error('주문을 선택하고 반품할 제품을 추가해주세요.');
      return;
    }

    setSubmitLoading(true);
    try {
      const { reason } = values;
      const reasonText = Array.isArray(reason) ? reason.join(', ') : reason;
      const payload: ReturnCreateRequest = {
        pharmacyId: pharmacyId,
        orderId: selectedOrder.orderId,
        reason: reasonText,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotalPrice: item.unitPrice * item.quantity,
        })),
      };
      const res = await returnAPI.createReturn(payload);

      if (res.success) {
        messageApi.success('반품 요청이 완료되었습니다.');
        fetchReturns(statusFilter);
        updateProfile({ outstandingBalance: balance + totalPrice });
        clearCart();
        setSelectedOrder(undefined);
        form.resetFields(['orderId', 'productId', 'quantity', 'unitPrice']);
        setOrderItems([]);
        setMaxQuantity(0);
        returnForm.resetFields(['reason']);
      }
    } catch (e: any) {
      console.error('반품 요청 실패:', e);
      messageApi.error(e.response?.data?.message || '반품 요청 중 오류가 발생했습니다.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleTableChange = (pagination: any, filters: any) => {
    const newStatus = filters.status ? filters.status[0] : undefined;
    const newPage = pagination.current;
    if (newStatus !== statusFilter) {
      setStatusFilter(newStatus);
      setReturnsCurrentPage(1);
      return;
    }
    if (newPage !== returnsCurrentPage) setReturnsCurrentPage(newPage);
  };

  const handleExpand = (expanded: boolean, record: ReturnList) => {
    const returnId = record.returnId;
    if (expanded) fetchReturnDetail(returnId);
    setExpandedRowKeys(
      expanded ? [...expandedRowKeys, returnId] : expandedRowKeys.filter((key) => key !== returnId),
    );
  };

  // 반품카트 테이블
  const cartColumns: TableProps<ReturnCartItem>['columns'] = [
    {
      title: '제품 이미지',
      dataIndex: 'productImgUrl',
      key: 'productImgUrl',
      render: (url) => (
        <img src={url || PLACEHOLDER} alt="제품 이미지" style={{ width: '60px', height: '60px' }} />
      ),
      align: 'center',
    },
    { title: '제품명', dataIndex: 'productName', key: 'productName', align: 'center' },
    { title: '제조사', dataIndex: 'manufacturer', key: 'manufacturer', align: 'center' },
    {
      title: '단가',
      dataIndex: 'unitPrice',
      render: (value) => `${value.toLocaleString()}원`,
      align: 'center',
    },
    { title: '수량', dataIndex: 'quantity', key: 'quantity', align: 'center' },
    {
      title: '소계',
      dataIndex: 'subtotalPrice',
      key: 'subtotalPrice',
      render: (value) => `${value.toLocaleString()}원`,
      align: 'center',
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

  // 반품내역 테이블
  const returnsColumns: TableProps<ReturnList>['columns'] = [
    { title: '번호', dataIndex: 'returnId', key: 'returnId', align: 'center' },
    {
      title: '일시',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value) => dayjs(value).format(DATE_FORMAT.DEFAULT),
      align: 'center',
    },
    {
      title: '요약',
      dataIndex: 'summary',
      key: 'summary',
      align: 'center',
    },
    { title: '사유', dataIndex: 'reason', key: 'reason', align: 'center' },
    {
      title: '합계',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (value) => `${value.toLocaleString()}원`,
      align: 'center',
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      render: (value) => getStatusTag(value),
      filters: RETURN_STATUS_OPTIONS.map((option) => ({
        text: option.label,
        value: option.value,
      })),
      filterMultiple: false,
      align: 'center',
    },
  ];

  // 반품내역 테이블 상세
  const expandedRowRender = (record: ReturnList) => {
    const detail = expandedRowData[record.returnId];
    const isLoading = expandedRowLoading[record.returnId];
    if (isLoading) return <Spin />;
    if (!detail) return null;
    return (
      <>
        <Table
          bordered={true}
          dataSource={detail.items}
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
                  {detail.totalPrice.toLocaleString()}원
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
        <Typography.Text>
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
              style={{ minWidth: '180px' }}
            >
              <Input
                readOnly
                onClick={() => setIsModalVisible(true)}
                placeholder="주문번호 선택"
                style={{ cursor: 'pointer' }}
              />
            </Form.Item>
          </Flex>

          <Flex wrap gap={8} align="end">
            <Form.Item
              name="productId"
              label="제품명"
              rules={[{ required: true, message: '제품을 선택해주세요.' }]}
              style={{ minWidth: '180px' }}
            >
              <Select
                placeholder="제품 선택"
                onChange={handleItemChange}
                disabled={!selectedOrder || orderItemsLoading}
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
              dependencies={['productId']}
              rules={[
                { required: true, message: '반품 수량을 입력해주세요.' },
                () => ({
                  validator(_, value) {
                    if (!value) return Promise.resolve();
                    const inCartQuantity =
                      items.find((item) => item.productId === form.getFieldValue('productId'))
                        ?.quantity ?? 0;
                    return value + inCartQuantity <= maxQuantity
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error(
                            `반품 수량은 주문 수량(${maxQuantity}개)을 초과할 수 없습니다.`,
                          ),
                        );
                  },
                }),
              ]}
              style={{ width: '180px' }}
            >
              <InputNumber
                min={1}
                max={maxQuantity}
                style={{ width: '100%' }}
                placeholder={`주문 수량: ${maxQuantity}개`}
              />
            </Form.Item>
            <Form.Item name="unit" label="단위" style={{ width: '180px' }}>
              <Input readOnly />
            </Form.Item>
            <Form.Item name="unitPrice" label="단가" style={{ width: '180px' }}>
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
        centered
      >
        <Spin spinning={ordersLoading}>
          {orders.length > 0 ? (
            <>
              {orders.map((order) => (
                <Card
                  hoverable
                  key={order.orderId}
                  onClick={() => {
                    setSelectedOrder(order);
                    fetchOrderDetail(order.orderId);
                    clearCart();
                    setIsModalVisible(false);
                    form.setFieldsValue({
                      orderId: order.orderId,
                    });
                  }}
                >
                  <Descriptions
                    title={dayjs(order.createdAt).format(DATE_FORMAT.DATE)}
                    column={1}
                    size="small"
                  >
                    <Descriptions.Item label="주문번호">{order.orderId}</Descriptions.Item>
                    <Descriptions.Item label="요약">{order.summary}</Descriptions.Item>
                    <Descriptions.Item label="합계">
                      {order.totalPrice.toLocaleString()}원
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              ))}
              {ordersTotal > PAGE_SIZE && (
                <Flex justify="space-between" style={{ marginTop: '8px' }}>
                  <Button
                    disabled={ordersCurrentPage <= 1}
                    onClick={() => setOrdersCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    이전
                  </Button>
                  <Typography.Text type="secondary">
                    {ordersCurrentPage} / {Math.ceil(ordersTotal / PAGE_SIZE)} 페이지
                  </Typography.Text>
                  <Button
                    disabled={ordersCurrentPage >= Math.ceil(ordersTotal / PAGE_SIZE)}
                    onClick={() =>
                      setOrdersCurrentPage((p) =>
                        Math.min(Math.ceil(ordersTotal / PAGE_SIZE), p + 1),
                      )
                    }
                  >
                    다음
                  </Button>
                </Flex>
              )}
            </>
          ) : (
            <Typography.Text>발주 내역이 없습니다.</Typography.Text>
          )}
        </Spin>
      </Modal>

      <Typography.Title level={4} style={{ marginBottom: '16px' }}>
        상세 내역
      </Typography.Title>
      <Table
        columns={cartColumns}
        dataSource={items.map((item) => ({
          ...item,
          subtotalPrice: item.unitPrice * item.quantity,
        }))}
        rowKey={(record) => record.productId}
        pagination={false}
        summary={() => (
          <Table.Summary fixed>
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={5} />
              <Table.Summary.Cell index={1}>합계</Table.Summary.Cell>
              <Table.Summary.Cell index={2}>{totalPrice.toLocaleString()}원</Table.Summary.Cell>
            </Table.Summary.Row>
          </Table.Summary>
        )}
        style={{ marginBottom: '16px' }}
      />
      <Form form={returnForm} onFinish={handleSubmit}>
        <Flex wrap gap={8} align="start">
          <Form.Item
            name="reason"
            label="반품 사유"
            rules={[{ required: true, message: '반품 사유를 입력해주세요.' }]}
            style={{ flex: 1 }}
          >
            <Select
              placeholder="반품 사유를 선택하세요. (직접 입력 가능)"
              options={[...RETURN_REASON_OPTIONS]}
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

      <Divider />

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
          pageSize: PAGE_SIZE,
          total: returnsTotal,
          current: returnsCurrentPage,
          onChange: (page) => setReturnsCurrentPage(page),
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
