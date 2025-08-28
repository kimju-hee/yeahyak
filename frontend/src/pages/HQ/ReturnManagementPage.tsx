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
import { returnAPI } from '../../api';
import {
  DATE_FORMAT,
  PAGE_SIZE,
  REGION_CASCADER_OPTIONS,
  RETURN_STATUS_COLORS,
  RETURN_STATUS_OPTIONS,
  RETURN_STATUS_TEXT,
} from '../../constants';
import {
  RETURN_STATUS,
  type Region,
  type ReturnDetail,
  type ReturnList,
  type ReturnStatus,
} from '../../types';

const getStatusTag = (status: ReturnStatus, isClickable: boolean) => {
  const color = RETURN_STATUS_COLORS[status];
  const text = RETURN_STATUS_TEXT[status];
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

export default function ReturnManagementPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  const [returns, setReturns] = useState<ReturnList[]>([]);
  const [expandedRowData, setExpandedRowData] = useState<Record<number, ReturnDetail>>({});
  const [expandedRowLoading, setExpandedRowLoading] = useState<Record<number, boolean>>({});
  const [filters, setFilters] = useState({
    status: undefined as ReturnStatus | undefined,
    region: undefined as Region | undefined,
    start: undefined as dayjs.Dayjs | undefined,
    end: undefined as dayjs.Dayjs | undefined,
  });
  const [statistics, setStatistics] = useState({
    totalReturns: 0,
    totalReceived: 0,
    totalAmount: 0,
  });

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchStatistics = async () => {
    try {
      const now = dayjs();
      const startOfMonth = now.startOf('month');
      const endOfMonth = now.endOf('month');

      const res = await returnAPI.getReturnsHq({
        start: startOfMonth.format('YYYY-MM-DD'),
        end: endOfMonth.format('YYYY-MM-DD'),
        page: 0,
        size: 9999,
      });

      if (res.success) {
        const totalReturns = res.data.length;
        const calculatedStatistics = res.data.reduce(
          (acc: any, ret: ReturnList) => {
            if (ret.status === RETURN_STATUS.RECEIVED) {
              acc.totalReceived += 1;
            }
            if (ret.status !== RETURN_STATUS.CANCELED) {
              acc.totalAmount += ret.totalPrice || 0;
            }
            return acc;
          },
          { totalReturns: 0, totalReceived: 0, totalAmount: 0 },
        );
        setStatistics({ ...calculatedStatistics, totalReturns: totalReturns });
      }
    } catch (e: any) {
      console.error('월간 반품 요청 통계 로딩 실패:', e);
      messageApi.error(
        e.response?.data?.message || '월간 반품 요청 통계 로딩 중 오류가 발생했습니다.',
      );
    }
  };

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const res = await returnAPI.getReturnsHq({
        status: filters.status,
        region: filters.region,
        start: filters.start?.format('YYYY-MM-DD'),
        end: filters.end?.format('YYYY-MM-DD'),
        page: currentPage - 1,
        size: PAGE_SIZE,
      });

      if (res.success) {
        const { data, page } = res;
        setReturns(data);
        setTotal(page.totalElements);
      }
    } catch (e: any) {
      console.error('반품 요청 목록 로딩 실패:', e);
      messageApi.error(e.response?.data?.message || '반품 요청 목록 로딩 중 오류가 발생했습니다.');
      setReturns([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  useEffect(() => {
    fetchReturns();
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

  const handleUpdate = async (returnId: number, action: string) => {
    try {
      let res: any;
      switch (action) {
        case 'APPROVE':
          res = await returnAPI.updateReturn(returnId, { status: RETURN_STATUS.APPROVED });
          break;
        case 'REJECT':
          res = await returnAPI.updateReturn(returnId, { status: RETURN_STATUS.CANCELED });
          break;
        case 'RECEIVE':
          res = await returnAPI.updateReturn(returnId, { status: RETURN_STATUS.RECEIVED });
          break;
        case 'COMPLETE':
          res = await returnAPI.updateReturn(returnId, { status: RETURN_STATUS.COMPLETED });
          break;
      }

      if (res.success) {
        messageApi.success('반품 상태가 변경되었습니다.');
        fetchStatistics();
        fetchReturns();
      }
    } catch (e: any) {
      console.error('반품 상태 변경 실패:', e);
      messageApi.error(e.response?.data?.message || '반품 상태 변경 중 오류가 발생했습니다.');
    }
  };

  const renderStatusTagWithActions = (record: ReturnList) => {
    if (record.status === RETURN_STATUS.REQUESTED) {
      return (
        <Popconfirm
          title="반품 승인 / 반려"
          description="반품을 승인 또는 반려하시겠습니까?"
          okText="승인"
          cancelText="반려"
          onConfirm={(e) => {
            e?.stopPropagation();
            handleUpdate(record.returnId, 'APPROVE');
          }}
          onCancel={(e) => {
            e?.stopPropagation();
            handleUpdate(record.returnId, 'REJECT');
          }}
        >
          <span onClick={(e) => e.stopPropagation()}>{getStatusTag(record.status, true)}</span>
        </Popconfirm>
      );
    }

    let nextAction = '';
    let confirmDescription = '';

    switch (record.status) {
      case RETURN_STATUS.APPROVED:
        nextAction = 'RECEIVE';
        confirmDescription = '처리중으로 변경하시겠습니까?';
        break;
      case RETURN_STATUS.RECEIVED:
        nextAction = 'COMPLETE';
        confirmDescription = '완료로 변경하시겠습니까?';
        break;
      default:
        return getStatusTag(record.status, false);
    }

    return (
      <Popconfirm
        title="반품 상태 변경"
        description={confirmDescription}
        onConfirm={(e) => {
          e?.stopPropagation();
          handleUpdate(record.returnId, nextAction);
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

  const tableColumns: TableProps<ReturnList>['columns'] = [
    { title: '반품 번호', dataIndex: 'returnId', key: 'returnId', align: 'center' },
    { title: '약국명', dataIndex: 'pharmacyName', key: 'pharmacyName', align: 'center' },
    {
      title: '반품 요약',
      dataIndex: 'summary',
      key: 'summary',
      align: 'center',
    },
    {
      title: '반품 금액',
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

  const handleExpand = (expanded: boolean, record: ReturnList) => {
    if (expanded && !expandedRowData[record.returnId]) {
      fetchReturnDetail(record.returnId);
    }
  };

  const expandedRowRender = (record: ReturnList) => {
    const detail = expandedRowData[record.returnId];
    const isLoading = expandedRowLoading[record.returnId];

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
        반품 요청 관리
      </Typography.Title>

      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={8}>
          <Card>
            <Statistic title="당월 반품 요청" value={statistics.totalReturns} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="처리중" value={statistics.totalReceived} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="당월 반품 총액" value={statistics.totalAmount} suffix="원" />
          </Card>
        </Col>
      </Row>

      <Form layout="vertical" form={form} onFinish={handleSearch}>
        <Space wrap align="end">
          <Form.Item label="지역" name="region">
            <Cascader options={REGION_CASCADER_OPTIONS} placeholder="지역 선택" />
          </Form.Item>
          <Form.Item label="상태" name="status">
            <Select allowClear options={[...RETURN_STATUS_OPTIONS]} placeholder="상태 선택" />
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
        dataSource={returns}
        loading={loading}
        rowKey={(record) => record.returnId}
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
          expandRowByClick: true,
          expandIcon: () => null,
        }}
      />
    </>
  );
}
