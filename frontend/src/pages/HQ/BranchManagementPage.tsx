import {
  Button,
  Cascader,
  Descriptions,
  Flex,
  Form,
  Input,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  message,
  type TableProps,
} from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import { pharmacyRequestAPI } from '../../api';
import {
  DATE_FORMAT,
  PAGE_SIZE,
  PHARMACY_REQUEST_STATUS_COLORS,
  PHARMACY_REQUEST_STATUS_OPTIONS,
  PHARMACY_REQUEST_STATUS_TEXT,
  REGION_CASCADER_OPTIONS,
} from '../../constants';
import {
  useApprovePharmacyRequest,
  usePharmacyRequests,
  useRejectPharmacyRequest,
} from '../../hooks';
import type {
  PharmacyRequestDetail,
  PharmacyRequestList,
  PharmacyRequestStatus,
  Region,
} from '../../types';

const getStatusTag = (status: PharmacyRequestStatus) => {
  const color = PHARMACY_REQUEST_STATUS_COLORS[status];
  const text = PHARMACY_REQUEST_STATUS_TEXT[status];
  return (
    <Tag bordered={true} color={color} style={{ cursor: 'default' }}>
      {text}
    </Tag>
  );
};

export default function BranchManagementPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  const [expandedRowData, setExpandedRowData] = useState<Record<number, PharmacyRequestDetail>>({});
  const [expandedRowLoading, setExpandedRowLoading] = useState<Record<number, boolean>>({});
  const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([]);
  const [filters, setFilters] = useState({
    status: undefined as PharmacyRequestStatus | undefined,
    region: undefined as Region | undefined,
    pharmacyName: undefined as string | undefined,
  });

  const [currentPage, setCurrentPage] = useState<number>(1);

  // TanStack Query로 약국 등록 요청 목록 조회
  const { data: requestsResponse, isLoading: loading } = usePharmacyRequests({
    status: filters.status,
    region: filters.region,
    keyword: filters.pharmacyName,
    page: currentPage - 1,
    size: PAGE_SIZE,
  });

  const requests = requestsResponse?.data || [];
  const total = requestsResponse?.page?.totalElements || 0;

  // Mutations
  const approveMutation = useApprovePharmacyRequest();
  const rejectMutation = useRejectPharmacyRequest();

  // 상세 조회 (확장된 행용)
  const fetchRequestDetail = async (pharmacyRequestId: number) => {
    setExpandedRowLoading((prev) => ({ ...prev, [pharmacyRequestId]: true }));
    try {
      const res = await pharmacyRequestAPI.getPharmacyRequest(pharmacyRequestId);

      if (res.success) {
        setExpandedRowData((prev) => ({ ...prev, [pharmacyRequestId]: res.data }));
      }
    } catch (e: any) {
      console.error('약국 등록 요청 상세 로딩 실패:', e);
      messageApi.error(
        e.response?.data?.message || '약국 등록 요청 상세 로딩 중 오류가 발생했습니다.',
      );
    } finally {
      setExpandedRowLoading((prev) => ({ ...prev, [pharmacyRequestId]: false }));
    }
  };

  const handleSearch = () => {
    const formValues = form.getFieldsValue();
    setFilters({
      region: Array.isArray(formValues.region)
        ? formValues.region[formValues.region.length - 1]
        : formValues.region,
      status: formValues.status,
      pharmacyName: formValues.pharmacyName,
    });
    setCurrentPage(1);
  };

  const handleReset = () => {
    form.resetFields();
    setFilters({ region: undefined, status: undefined, pharmacyName: undefined });
    setCurrentPage(1);
  };

  const handleApprove = (pharmacyId: number) => {
    approveMutation.mutate(pharmacyId);
  };

  const handleReject = (pharmacyId: number) => {
    rejectMutation.mutate(pharmacyId);
  };

  const handleExpand = (expanded: boolean, record: PharmacyRequestList) => {
    const pharmacyRequestId = record.pharmacyRequestId;
    if (expanded) fetchRequestDetail(pharmacyRequestId);
    setExpandedRowKeys(
      expanded
        ? [...expandedRowKeys, pharmacyRequestId]
        : expandedRowKeys.filter((key) => key !== pharmacyRequestId),
    );
  };

  const tableColumns: TableProps<PharmacyRequestList>['columns'] = [
    {
      title: '요청코드',
      dataIndex: 'pharmacyRequestId',
      key: 'pharmacyRequestId',
      align: 'center',
      width: '10%',
    },
    {
      title: '이메일',
      dataIndex: 'email',
      key: 'email',
      align: 'center',
      width: '20%',
    },
    {
      title: '약국명',
      dataIndex: 'pharmacyName',
      key: 'pharmacyName',
      align: 'center',
      width: '15%',
    },
    {
      title: '사업자등록번호',
      dataIndex: 'bizRegNo',
      key: 'bizRegNo',
      align: 'center',
      width: '20%',
    },
    { title: '연락처', dataIndex: 'contact', key: 'contact', align: 'center', width: '20%' },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      render: (_, record) => getStatusTag(record.status),
      align: 'center',
      width: '15%',
    },
  ];

  const expandedRowRender = (record: PharmacyRequestList) => {
    const detail = expandedRowData[record.pharmacyRequestId];
    const isLoading = expandedRowLoading[record.pharmacyRequestId];
    if (isLoading) return <Spin />;
    if (!detail) return null;
    return (
      <>
        <Descriptions bordered column={2} size="middle" styles={{ label: { textAlign: 'center' } }}>
          <Descriptions.Item label="대표자명">{detail.representativeName}</Descriptions.Item>
          <Descriptions.Item label="주소">
            {`${detail.address} ${detail.detailAddress}`}
          </Descriptions.Item>
          <Descriptions.Item label="요청 일시">
            {dayjs(detail.createdAt).format(DATE_FORMAT.KR_DEFAULT)}
          </Descriptions.Item>
          <Descriptions.Item label="연락처"> {detail.contact}</Descriptions.Item>
          <Descriptions.Item label="검토 일시">
            {detail.updatedAt ? dayjs(detail.updatedAt).format(DATE_FORMAT.KR_DEFAULT) : '미검토'}
          </Descriptions.Item>
          <Descriptions.Item label="상태">
            <Flex wrap justify="space-between" align="center">
              {getStatusTag(record.status)}
              {record.status === 'PENDING' && (
                <Space>
                  <Button
                    type="primary"
                    size="small"
                    loading={approveMutation.isPending}
                    onClick={() => handleApprove(record.pharmacyRequestId)}
                  >
                    승인
                  </Button>
                  <Button
                    danger
                    size="small"
                    loading={rejectMutation.isPending}
                    onClick={() => handleReject(record.pharmacyRequestId)}
                  >
                    거절
                  </Button>
                </Space>
              )}
            </Flex>
          </Descriptions.Item>
        </Descriptions>
      </>
    );
  };

  return (
    <>
      {contextHolder}
      <Typography.Title level={3} style={{ marginBottom: 24 }}>
        등록 요청 관리
      </Typography.Title>

      <Form layout="vertical" form={form} onFinish={handleSearch}>
        <Space wrap align="end">
          <Form.Item label="지역" name="region">
            <Cascader options={REGION_CASCADER_OPTIONS} placeholder="지역 선택" />
          </Form.Item>
          <Form.Item label="상태" name="status">
            <Select
              allowClear
              options={[...PHARMACY_REQUEST_STATUS_OPTIONS]}
              placeholder="상태 선택"
            />
          </Form.Item>
          <Form.Item label="약국명" name="pharmacyName">
            <Input placeholder="약국명 검색" allowClear />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              조회
            </Button>
          </Form.Item>
          <Form.Item>
            <Button type="default" onClick={handleReset}>
              초기화
            </Button>
          </Form.Item>
        </Space>
      </Form>

      <Table
        columns={tableColumns}
        dataSource={requests}
        loading={loading}
        rowKey={(record) => record.pharmacyRequestId}
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
          expandedRowKeys,
          expandRowByClick: true,
        }}
      />
    </>
  );
}
