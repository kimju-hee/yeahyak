import { ReloadOutlined } from '@ant-design/icons';
import {
  Badge,
  Button,
  Cascader,
  Drawer,
  Flex,
  Form,
  Input,
  Popconfirm,
  Radio,
  Space,
  Spin,
  Switch,
  Table,
  Tag,
  Typography,
  message,
  type TableProps,
} from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import {
  BALANCE_TX_TYPE_COLORS,
  BALANCE_TX_TYPE_OPTIONS,
  BALANCE_TX_TYPE_TEXT,
  DATE_FORMAT,
  PAGE_SIZE,
  REGION_CASCADER_OPTIONS,
  REGION_TEXT,
} from '../../constants';
import { useBalanceTxs, usePharmacies, useSettlement } from '../../hooks';
import type { BalanceTxType, PharmacyList, Region } from '../../types';
import { calculateCreditInfo } from '../../utils';

// 외상 잔액에 따른 상태 뱃지 생성
const getBalanceStatusBadge = (balance: number) => {
  const creditInfo = calculateCreditInfo(balance);

  let status: 'success' | 'warning' | 'error';

  if (creditInfo.usagePercent <= 50) {
    status = 'success';
  } else if (creditInfo.usagePercent <= 80) {
    status = 'warning';
  } else {
    status = 'error';
  }

  return (
    <Badge
      status={status}
      text={`${balance.toLocaleString()}원 (${creditInfo.usagePercent.toFixed(1)}%)`}
    />
  );
};

export default function CreditManagementPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  const [filters, setFilters] = useState({
    unsettled: undefined as boolean | undefined,
    region: undefined as Region | undefined,
    pharmacyName: undefined as string | undefined,
  });

  const [currentPage, setCurrentPage] = useState<number>(1);

  // 약국 목록 조회
  const {
    data: pharmaciesResponse,
    error: pharmaciesError,
    isLoading: pharmaciesLoading,
  } = usePharmacies({
    unsettled: filters.unsettled || undefined,
    page: currentPage - 1,
    size: PAGE_SIZE,
    keyword: filters.pharmacyName || undefined,
    region: filters.region || undefined,
  });

  const pharmacies = pharmaciesResponse?.success ? pharmaciesResponse.data : [];
  const total = pharmaciesResponse?.success ? pharmaciesResponse.page.totalElements : 0;

  // 사이드바 관련 상태
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState<PharmacyList | null>(null);

  // 거래내역 필터 상태 (타입만 사용)
  const [balanceFilter, setBalanceFilter] = useState<{
    type?: BalanceTxType;
  }>({});

  // 거래내역 조회
  const {
    data: balanceTxsResponse,
    error: balanceTxsError,
    isLoading: balanceTxsLoading,
  } = useBalanceTxs(
    selectedPharmacy?.pharmacyId || 0,
    {
      type: balanceFilter.type,
      start: undefined,
      end: undefined,
    },
    !!selectedPharmacy,
  );

  const sidebarTransactions = balanceTxsResponse?.success ? balanceTxsResponse.data : [];

  // 정산 처리 mutation
  const settlementMutation = useSettlement();

  // 에러 처리
  if (pharmaciesError) {
    messageApi.error('약국 목록을 불러오는데 실패했습니다.');
  }

  if (balanceTxsError) {
    messageApi.error('거래내역 조회 중 오류가 발생했습니다.');
  }

  // 약국별 거래내역 조회 (사이드바용)
  const handleShowTransactions = (pharmacy: PharmacyList) => {
    setSelectedPharmacy(pharmacy);
    setSidebarOpen(true);
  };

  // 사이드바 닫기
  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    setSelectedPharmacy(null);
    setBalanceFilter({});
  };

  const handleSearch = () => {
    const formValues = form.getFieldsValue();
    setFilters({
      region: Array.isArray(formValues.region)
        ? formValues.region[formValues.region.length - 1]
        : formValues.region,
      unsettled: formValues.unsettled,
      pharmacyName: formValues.pharmacyName,
    });
    setCurrentPage(1);
  };

  const handleReset = () => {
    form.resetFields();
    setFilters({ region: undefined, unsettled: undefined, pharmacyName: undefined });
    setCurrentPage(1);
  };

  const tableColumns: TableProps<PharmacyList>['columns'] = [
    {
      title: '약국코드',
      dataIndex: 'pharmacyId',
      key: 'pharmacyId',
      align: 'center',
      width: '10%',
    },
    {
      title: '약국명',
      dataIndex: 'pharmacyName',
      key: 'pharmacyName',
      align: 'center',
      width: '10%',
    },
    {
      title: '사업자등록번호',
      dataIndex: 'bizRegNo',
      key: 'bizRegNo',
      align: 'center',
      width: '15%',
    },
    {
      title: '지역',
      dataIndex: 'region',
      key: 'region',
      render: (region: Region) => REGION_TEXT[region],
      align: 'center',
      width: '10%',
    },
    {
      title: <div style={{ textAlign: 'center' }}>외상 잔액</div>,
      dataIndex: 'balance',
      key: 'balance',
      render: (value) => (
        <Flex align="center" justify="end">
          {getBalanceStatusBadge(value)}
        </Flex>
      ),
      align: 'right',
      width: '15%',
    },
    {
      title: '최근 정산일',
      dataIndex: 'latestSettlementAt',
      key: 'latestSettlementAt',
      render: (value) => (value ? dayjs(value).format(DATE_FORMAT.KR_DATE) : '-'),
      align: 'center',
      width: '20%',
    },
    {
      title: '거래 내역',
      key: 'transactions',
      render: (_, record) => (
        <Button type="default" size="small" onClick={() => handleShowTransactions(record)}>
          거래내역
        </Button>
      ),
      align: 'center',
      width: '10%',
    },
    {
      title: '정산',
      key: 'settlement',
      render: (_, record) => (
        <Popconfirm
          title="정산 처리"
          description={`${record.pharmacyName}의 외상잔액 ${record.balance.toLocaleString()}원을 정산하시겠습니까?`}
          onConfirm={() => settlementMutation.mutate(record.pharmacyId)}
          okText="정산"
          cancelText="취소"
          disabled={record.balance <= 0}
        >
          <Button
            type="primary"
            size="small"
            disabled={record.balance <= 0}
            loading={settlementMutation.isPending}
          >
            정산
          </Button>
        </Popconfirm>
      ),
      align: 'center',
      width: '10%',
    },
  ];

  return (
    <>
      {contextHolder}
      <Typography.Title level={3} style={{ marginBottom: 24 }}>
        정산 관리
      </Typography.Title>

      <Form layout="vertical" form={form} onFinish={handleSearch}>
        <Space wrap align="end">
          <Form.Item label="미정산" name="unsettled">
            <Switch
              checked={filters.unsettled}
              onChange={(checked) => setFilters((prev) => ({ ...prev, unsettled: checked }))}
            />
          </Form.Item>
          <Form.Item label="지역" name="region">
            <Cascader options={REGION_CASCADER_OPTIONS} placeholder="지역 선택" />
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
        dataSource={pharmacies}
        loading={pharmaciesLoading}
        rowKey={(record) => record.pharmacyId}
        pagination={{
          position: ['bottomCenter'],
          pageSize: PAGE_SIZE,
          total: total,
          current: currentPage,
          onChange: (page) => setCurrentPage(page),
          showSizeChanger: false,
        }}
      />

      <Drawer
        title={selectedPharmacy ? `${selectedPharmacy.pharmacyName} 거래 내역` : '거래 내역'}
        placement="right"
        width={720}
        open={sidebarOpen}
        onClose={handleCloseSidebar}
        extra={
          <Button
            type="primary"
            shape="circle"
            icon={<ReloadOutlined />}
            onClick={() => {
              // 거래내역 쿼리 새로고침 - 필터를 다시 설정해서 리페치 유도
              setBalanceFilter((prev) => ({ ...prev }));
            }}
          />
        }
      >
        {selectedPharmacy && (
          <>
            <Flex vertical gap="middle" style={{ marginBottom: 16 }}>
              <Typography.Text strong>거래 유형</Typography.Text>
              <Radio.Group
                value={balanceFilter.type}
                onChange={(e) => {
                  setBalanceFilter((prev) => ({ ...prev, type: e.target.value }));
                }}
                optionType="button"
                buttonStyle="solid"
                style={{ width: '100%' }}
              >
                <Radio.Button value={undefined} style={{ width: '20%' }}>
                  전체
                </Radio.Button>
                {BALANCE_TX_TYPE_OPTIONS.map((option) => (
                  <Radio.Button key={option.value} value={option.value} style={{ width: '20%' }}>
                    {option.label}
                  </Radio.Button>
                ))}
              </Radio.Group>
            </Flex>

            <Spin spinning={balanceTxsLoading}>
              <Table
                size="small"
                columns={[
                  {
                    title: '날짜',
                    dataIndex: 'createdAt',
                    key: 'createdAt',
                    render: (value) => dayjs(value).format(DATE_FORMAT.KR_DEFAULT),
                    align: 'center',
                    width: '30%',
                  },
                  {
                    title: '유형',
                    dataIndex: 'type',
                    key: 'type',
                    render: (type: BalanceTxType) => (
                      <Tag color={BALANCE_TX_TYPE_COLORS[type]}>{BALANCE_TX_TYPE_TEXT[type]}</Tag>
                    ),
                    align: 'center',
                    width: '20%',
                  },
                  {
                    title: <div style={{ textAlign: 'center' }}>금액</div>,
                    dataIndex: 'amount',
                    key: 'amount',
                    render: (value, record) => {
                      const isPositive = record.type === 'RETURN' || record.type === 'ORDER_CANCEL';
                      return (
                        <span style={{ color: isPositive ? '#52c41a' : '#f5222d' }}>
                          {isPositive ? '+' : '-'}
                          {Math.abs(value).toLocaleString()}원
                        </span>
                      );
                    },
                    align: 'right',
                    width: '25%',
                  },
                  {
                    title: '잔액',
                    dataIndex: 'balanceAfter',
                    key: 'balanceAfter',
                    render: (value) => (
                      <Typography.Text strong>{value.toLocaleString()}원</Typography.Text>
                    ),
                    align: 'right',
                    width: '25%',
                  },
                ]}
                dataSource={sidebarTransactions}
                rowKey="balanceTxId"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: false,
                }}
              />
            </Spin>
          </>
        )}
      </Drawer>
    </>
  );
}
