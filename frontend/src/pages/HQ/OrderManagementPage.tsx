import {
  Button,
  Card,
  Cascader,
  Col,
  DatePicker,
  Form,
  Popconfirm,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
  Typography,
  message,
  type TableProps,
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { orderAPI } from '../../api';
import {
  DATE_FORMAT,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_OPTIONS,
  ORDER_STATUS_TEXT,
  PAGE_SIZE,
  REGION_CASCADER_OPTIONS,
} from '../../constants';
import {
  ORDER_STATUS,
  type OrderDetail,
  type OrderList,
  type OrderStatus,
  type Region,
} from '../../types';

const getStatusTag = (status: OrderStatus, isClickable: boolean) => {
  const color = ORDER_STATUS_COLORS[status];
  const text = ORDER_STATUS_TEXT[status];
  return (
    <Tag
      bordered={true}
      color={color}
      style={isClickable ? { cursor: 'pointer' } : { cursor: 'default' }}
    >
      {text}
    </Tag>
  );
};

export default function OrderManagementPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  const [orders, setOrders] = useState<OrderList[]>([]);
  const [expandedRowData, setExpandedRowData] = useState<Record<number, OrderDetail>>({});
  const [expandedRowLoading, setExpandedRowLoading] = useState<Record<number, boolean>>({});
  const [filters, setFilters] = useState({
    status: undefined as OrderStatus | undefined,
    region: undefined as Region | undefined,
    start: undefined as dayjs.Dayjs | undefined,
    end: undefined as dayjs.Dayjs | undefined,
  });
  const [statistics, setStatistics] = useState({
    totalOrders: 0,
    totalPreparing: 0,
    totalShipping: 0,
    totalAmount: 0,
  });

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchStatistics = async () => {
    try {
      // 현재 월의 시작과 끝 날짜 계산
      const now = dayjs();
      const startOfMonth = now.startOf('month');
      const endOfMonth = now.endOf('month');

      const res = await orderAPI.getOrdersHq({
        start: startOfMonth.format('YYYY-MM-DD'),
        end: endOfMonth.format('YYYY-MM-DD'),
        page: 0,
        size: 9999,
      });

      if (res.success) {
        const totalOrders = res.data.length;
        const calculatedStatistics = res.data.reduce(
          (acc: any, order: OrderList) => {
            if (order.status === ORDER_STATUS.PREPARING) {
              acc.totalPreparing += 1;
            } else if (order.status === ORDER_STATUS.SHIPPING) {
              acc.totalShipping += 1;
            }
            if (order.status !== ORDER_STATUS.CANCELED) {
              acc.totalAmount += order.totalPrice || 0;
            }
            return acc;
          },
          { totalOrders: 0, totalPreparing: 0, totalShipping: 0, totalAmount: 0 },
        );
        setStatistics({ ...calculatedStatistics, totalOrders: totalOrders });
      }
    } catch (e: any) {
      console.error('월간 발주 요청 통계 로딩 실패:', e);
      messageApi.error(
        e.response?.data?.message || '월간 발주 요청 통계 로딩 중 오류가 발생했습니다.',
      );
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderAPI.getOrdersHq({
        status: filters.status,
        region: filters.region,
        start: filters.start?.format('YYYY-MM-DD'),
        end: filters.end?.format('YYYY-MM-DD'),
        page: currentPage - 1,
        size: PAGE_SIZE,
      });

      if (res.success) {
        const { data, page } = res;
        setOrders(data);
        setTotal(page.totalElements);
      }
    } catch (e: any) {
      console.error('발주 요청 목록 로딩 실패:', e);
      messageApi.error(e.response?.data?.message || '발주 요청 목록 로딩 중 오류가 발생했습니다.');
      setOrders([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, filters]);

  const handleSearch = () => {
    const formValues = form.getFieldsValue();
    const [startDate, endDate] = formValues.date || [undefined, undefined];
    setFilters({
      region: formValues.region,
      status: formValues.status,
      start: startDate,
      end: endDate,
    });
    setCurrentPage(1);
  };

  const handleReset = () => {
    form.resetFields();
    setFilters({ region: undefined, status: undefined, start: undefined, end: undefined });
    setCurrentPage(1);
  };

  const handleUpdate = async (orderId: number, action: string) => {
    try {
      let res: any;
      switch (action) {
        case 'APPROVE':
          res = await orderAPI.updateOrder(orderId, { status: ORDER_STATUS.APPROVED });
          break;
        case 'REJECT':
          res = await orderAPI.updateOrder(orderId, { status: ORDER_STATUS.CANCELED });
          break;
        case 'PREPARE':
          res = await orderAPI.updateOrder(orderId, { status: ORDER_STATUS.PREPARING });
          break;
        case 'SHIP':
          res = await orderAPI.updateOrder(orderId, { status: ORDER_STATUS.SHIPPING });
          break;
        case 'COMPLETE':
          res = await orderAPI.updateOrder(orderId, { status: ORDER_STATUS.COMPLETED });
          break;
      }

      if (res.success) {
        messageApi.success('주문 상태가 변경되었습니다.');
        fetchStatistics();
        fetchOrders();
      }
    } catch (e: any) {
      console.error('주문 상태 변경 실패:', e);
      messageApi.error(e.response?.data?.message || '주문 상태 변경 중 오류가 발생했습니다.');
    }
  };

  const renderStatusTagWithActions = (record: OrderList) => {
    if (record.status === ORDER_STATUS.REQUESTED) {
      return (
        <Popconfirm
          title="주문 승인 / 반려"
          description="주문을 승인 또는 반려하시겠습니까?"
          okText="승인"
          cancelText="반려"
          onConfirm={(e) => {
            e?.stopPropagation();
            handleUpdate(record.orderId, 'APPROVE');
          }}
          onCancel={(e) => {
            e?.stopPropagation();
            handleUpdate(record.orderId, 'REJECT');
          }}
        >
          <span onClick={(e) => e.stopPropagation()}>{getStatusTag(record.status, true)}</span>
        </Popconfirm>
      );
    }

    let nextAction = '';
    let confirmDescription = '';

    switch (record.status) {
      case ORDER_STATUS.APPROVED:
        nextAction = 'PREPARE';
        confirmDescription = '처리중으로 변경하시겠습니까?';
        break;
      case ORDER_STATUS.PREPARING:
        nextAction = 'SHIP';
        confirmDescription = '배송중으로 변경하시겠습니까?';
        break;
      case ORDER_STATUS.SHIPPING:
        nextAction = 'COMPLETE';
        confirmDescription = '완료로 변경하시겠습니까?';
        break;
      default:
        return getStatusTag(record.status, false);
    }

    return (
      <Popconfirm
        title="주문 상태 변경"
        description={confirmDescription}
        onConfirm={(e) => {
          e?.stopPropagation();
          handleUpdate(record.orderId, nextAction);
        }}
        onCancel={(e) => {
          e?.stopPropagation();
        }}
        okText="변경"
        cancelText="취소"
      >
        <span onClick={(e) => e.stopPropagation()}>{getStatusTag(record.status, true)}</span>
      </Popconfirm>
    );
  };

  const tableColumns: TableProps<OrderList>['columns'] = [
    { title: '주문 번호', dataIndex: 'orderId', key: 'orderId', align: 'center' },
    { title: '약국명', dataIndex: 'pharmacyName', key: 'pharmacyName', align: 'center' },
    {
      title: '주문 요약',
      dataIndex: 'summary',
      key: 'summary',
      align: 'center',
    },
    {
      title: '주문 금액',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (value) => `${value.toLocaleString()}원`,
      align: 'center',
    },
    {
      title: '요청 일시',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value) => dayjs(value).format(DATE_FORMAT.DEFAULT),
      align: 'center',
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      render: (_, record) => renderStatusTagWithActions(record),
      align: 'center',
    },
  ];

  const fetchOrderDetail = async (orderId: number) => {
    setExpandedRowLoading((prev) => ({ ...prev, [orderId]: true }));
    try {
      const res = await orderAPI.getOrder(orderId);
      if (res.success) {
        setExpandedRowData((prev) => ({ ...prev, [orderId]: res.data }));
      }
    } catch (e: any) {
      console.error('발주 상세 로딩 실패:', e);
      messageApi.error(e.response?.data?.message || '발주 상세 로딩 중 오류가 발생했습니다.');
    } finally {
      setExpandedRowLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const handleExpand = (expanded: boolean, record: OrderList) => {
    if (expanded && !expandedRowData[record.orderId]) {
      fetchOrderDetail(record.orderId);
    }
  };

  const expandedRowRender = (record: OrderList) => {
    const detail = expandedRowData[record.orderId];
    const isLoading = expandedRowLoading[record.orderId];

    if (isLoading) {
      return <Spin />;
    }

    if (!detail) {
      return (
        <Typography.Text style={{ padding: '16px', textAlign: 'center' }}>
          상세 정보를 불러올 수 없습니다.
        </Typography.Text>
      );
    }

    return (
      <Table
        bordered={true}
        dataSource={detail.items}
        columns={[
          { title: '제품명', dataIndex: 'productName', key: 'productName' },
          { title: '제조사', dataIndex: 'manufacturer', key: 'manufacturer' },
          { title: '대분류', dataIndex: 'mainCategory', key: 'mainCategory' },
          { title: '소분류', dataIndex: 'subCategory', key: 'subCategory' },
          { title: '수량', dataIndex: 'quantity', key: 'quantity' },
          { title: '단위', dataIndex: 'unit', key: 'unit' },
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
        rowKey={(item) => item.productId}
        size="small"
        summary={() => (
          <Table.Summary fixed>
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={6} />
              <Table.Summary.Cell index={1}>합계</Table.Summary.Cell>
              <Table.Summary.Cell index={2}>
                {detail.totalPrice.toLocaleString()}원
              </Table.Summary.Cell>
            </Table.Summary.Row>
          </Table.Summary>
        )}
      />
    );
  };

  return (
    <>
      {contextHolder}
      <Typography.Title level={3} style={{ marginBottom: '24px' }}>
        발주 요청 관리
      </Typography.Title>

      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic title="당월 발주 요청" value={statistics.totalOrders} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="처리중" value={statistics.totalPreparing} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="배송중" value={statistics.totalShipping} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="당월 발주 총액" value={statistics.totalAmount} suffix="원" />
          </Card>
        </Col>
      </Row>

      <Form layout="vertical" form={form} onFinish={handleSearch}>
        <Space wrap align="end">
          <Form.Item label="지역" name="region">
            <Cascader options={REGION_CASCADER_OPTIONS} placeholder="지역 선택" />
          </Form.Item>
          <Form.Item label="상태" name="status">
            <Select allowClear options={[...ORDER_STATUS_OPTIONS]} placeholder="상태 선택" />
          </Form.Item>
          <Form.Item label="기간" name="date">
            <DatePicker.RangePicker placeholder={['시작일', '종료일']} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              조회
            </Button>
          </Form.Item>
          <Form.Item>
            <Button onClick={handleReset}>초기화</Button>
          </Form.Item>
        </Space>
      </Form>

      <Table
        columns={tableColumns}
        dataSource={orders}
        loading={loading}
        rowKey={(record) => record.orderId}
        pagination={{
          position: ['bottomCenter'],
          pageSize: PAGE_SIZE,
          total: total,
          current: currentPage,
          onChange: (page) => setCurrentPage(page),
          showSizeChanger: false,
        }}
        expandable={{
          expandedRowRender,
          onExpand: handleExpand,
          expandRowByClick: true,
          expandIcon: () => null,
        }}
      />
    </>
  );
}
