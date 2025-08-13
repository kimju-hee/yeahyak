import type { TableProps } from 'antd';
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
  Statistic,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { instance } from '../../api/api';
import { ORDER_STATUS, type OrderListResponse, type OrderStatus } from '../../types/order.type';

// TODO: 지역이나 기간으로 필터링 기능 추가? 고민중

const regionOptions = [
  {
    value: '수도권',
    label: '수도권',
    children: [
      { value: '서울', label: '서울' },
      { value: '인천', label: '인천' },
      { value: '경기', label: '경기' },
    ],
  },
  { value: '강원', label: '강원' },
  {
    value: '충청',
    label: '충청',
    children: [
      { value: '대전', label: '대전' },
      { value: '세종', label: '세종' },
      { value: '충북', label: '충북' },
      { value: '충남', label: '충남' },
    ],
  },
  {
    value: '영남',
    label: '영남',
    children: [
      { value: '부산', label: '부산' },
      { value: '대구', label: '대구' },
      { value: '울산', label: '울산' },
      { value: '경북', label: '경북' },
      { value: '경남', label: '경남' },
    ],
  },
  {
    value: '호남',
    label: '호남',
    children: [
      { value: '광주', label: '광주' },
      { value: '전북', label: '전북' },
      { value: '전남', label: '전남' },
    ],
  },
  { value: '제주', label: '제주' },
];

const statusOptions = [
  { value: ORDER_STATUS.REQUESTED, label: '대기' },
  { value: ORDER_STATUS.APPROVED, label: '승인' },
  { value: ORDER_STATUS.PROCESSING, label: '처리중' },
  { value: ORDER_STATUS.SHIPPING, label: '배송중' },
  { value: ORDER_STATUS.COMPLETED, label: '완료' },
  { value: ORDER_STATUS.REJECTED, label: '반려' },
];

const getStatusTag = (status: OrderStatus, isClickable: boolean) => {
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
    <Tag bordered={true} color={color} style={isClickable ? { cursor: 'pointer' } : {}}>
      {text}
    </Tag>
  );
};

const PAGE_SIZE = 10;

export default function OrderManagementPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  const [orders, setOrders] = useState<OrderListResponse[]>([]);
  const [filters, setFilters] = useState({
    region: undefined as string | undefined,
    status: undefined as OrderStatus | undefined,
    startDate: undefined as dayjs.Dayjs | undefined,
    endDate: undefined as dayjs.Dayjs | undefined,
  });
  const [statistics, setStatistics] = useState({
    totalOrders: 0,
    totalProcessing: 0,
    totalShipping: 0,
    totalAmount: 0,
  });

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchStatistics = async () => {
    try {
      const res = await instance.get('/orders/admin/orders');
      // LOG: 테스트용 로그
      console.log('✨ 전체 발주 요청 목록 로딩 응답:', res.data);

      if (res.data.success) {
        const totalOrders = res.data.data.length;
        const calculatedStatistics = res.data.data.reduce(
          (acc: any, order: OrderListResponse) => {
            if (order.status === ORDER_STATUS.PROCESSING) {
              acc.totalProcessing += 1;
            } else if (order.status === ORDER_STATUS.SHIPPING) {
              acc.totalShipping += 1;
            }
            if (order.status !== ORDER_STATUS.REJECTED) {
              acc.totalAmount += order.totalPrice || 0;
            }
            return acc;
          },
          { totalOrders: 0, totalProcessing: 0, totalShipping: 0, totalAmount: 0 },
        );
        setStatistics({ ...calculatedStatistics, totalOrders: totalOrders });
      }
    } catch (e: any) {
      console.error('전체 발주 요청 목록 로딩 실패:', e);
      messageApi.error(e.message || '전체 발주 요청 목록 로딩 중 오류가 발생했습니다.');
    }
  };

  const fetchFilteredOrders = async () => {
    setLoading(true);
    try {
      const res = await instance.get('/orders/admin/orders', {
        params: {
          page: currentPage - 1,
          size: PAGE_SIZE,
          region: filters.region,
          status: filters.status,
          startDate: filters.startDate,
          endDate: filters.endDate,
        },
      });
      // LOG: 테스트용 로그
      console.log('✨ 발주 요청 목록 로딩 응답:', res.data);

      if (res.data.success) {
        const { data, totalElements } = res.data;
        setOrders(data);
        setTotal(totalElements);
      }
    } catch (e: any) {
      console.error('발주 요청 목록 로딩 실패:', e);
      messageApi.error(e.message || '발주 요청 목록 로딩 중 오류가 발생했습니다.');
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
    fetchFilteredOrders();
  }, [currentPage, filters]);

  const handleSearch = () => {
    const formValues = form.getFieldsValue();
    const [startDate, endDate] = formValues.date || [undefined, undefined];
    setFilters({
      region: formValues.region,
      status: formValues.status,
      startDate,
      endDate,
    });
    setCurrentPage(1);
  };

  const handleReset = () => {
    form.resetFields();
    setFilters({ region: undefined, status: undefined, startDate: undefined, endDate: undefined });
    setCurrentPage(1);
  };

  const handleUpdate = async (orderId: number, action: string) => {
    try {
      let res: any;
      switch (action) {
        case 'APPROVE':
          res = await instance.post(`/orders/${orderId}/approve`);
          break;
        case 'REJECT':
          res = await instance.post(`/orders/${orderId}/reject`);
          break;
        case 'PROCESS':
          res = await instance.patch(`/orders/${orderId}`, { status: 'PROCESSING' });
          break;
        case 'SHIP':
          res = await instance.patch(`/orders/${orderId}`, { status: 'SHIPPING' });
          break;
        case 'COMPLETE':
          res = await instance.patch(`/orders/${orderId}`, { status: 'COMPLETED' });
          break;
      }
      // LOG: 테스트용 로그
      console.log('✨ 주문 상태 업데이트 응답:', res.data);

      if (res.data.success) {
        messageApi.success('주문 상태가 변경되었습니다.');
        fetchStatistics();
        fetchFilteredOrders();
      }
    } catch (e: any) {
      console.error('주문 상태 변경 실패:', e);
      messageApi.error(e.message || '주문 상태 변경 중 오류가 발생했습니다.');
    }
  };

  const renderStatusTagWithActions = (record: OrderListResponse) => {
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
        nextAction = 'PROCESS';
        confirmDescription = '처리중으로 변경하시겠습니까?';
        break;
      case ORDER_STATUS.PROCESSING:
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

  const tableColumns: TableProps<OrderListResponse>['columns'] = [
    { title: '주문번호', dataIndex: 'orderId', key: 'orderId' },
    { title: '지점명', dataIndex: 'pharmacyName', key: 'pharmacyName' },
    {
      title: '주문요약',
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
      title: '주문금액',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (value) => `${value.toLocaleString()}원`,
    },
    {
      title: '요청일시',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value) => dayjs(value).format('YYYY. MM. DD. HH:mm'),
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      render: (_, record) => renderStatusTagWithActions(record),
    },
  ];

  const expandedRowRender = (record: OrderListResponse) => {
    return (
      <>
        <Table
          bordered={true}
          dataSource={record.items}
          columns={[
            { title: '제품명', dataIndex: 'productName', key: 'productName' },
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
          rowKey={(item) => item.productName}
          size="small"
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={2} />
                <Table.Summary.Cell index={1}>합계</Table.Summary.Cell>
                <Table.Summary.Cell index={2}>
                  {record.totalPrice.toLocaleString()}원
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </>
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
            <Statistic title="처리중" value={statistics.totalProcessing} />
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
            <Cascader options={regionOptions} placeholder="지역 선택" />
          </Form.Item>
          <Form.Item label="상태" name="status">
            <Select allowClear options={statusOptions} placeholder="상태 선택" />
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
        }}
        expandable={{
          expandedRowRender,
          expandRowByClick: true,
          expandIcon: () => null,
        }}
      />
    </>
  );
}
