import { SearchOutlined } from '@ant-design/icons';
import { Button, Card, Col, Input, Modal, Row, Statistic, Table, Tag, Typography, Descriptions, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState, useEffect, useCallback } from 'react';
import { instance as api } from '../../api/api'; // axios 대신 api 인스턴스 사용

// 백엔드 ReturnItemResponseDto에 맞춰 인터페이스 정의
interface ReturnItemResponseDto {
  productId: number;
  productName: string;
  manufacturer: string;
  reason: string;
  quantity: number;
  unitPrice: number;
  subtotalPrice: number;
}

// 백엔드 ReturnResponseDto에 맞춰 인터페이스 정의
interface ReturnResponseDto {
  returnId: number;
  pharmacyId: number;
  pharmacyName: string;
  orderId: number | null;
  createdAt: string;
  updatedAt: string | null;
  totalPrice: number;
  status: 'REQUESTED' | 'REJECTED' | 'APPROVED' | 'PROCESSING' | 'COMPLETED';
  items: ReturnItemResponseDto[];
}

interface ReturnDetailModalProps {
  open: boolean;
  onClose: () => void;
  returnDetail: ReturnResponseDto | null;
}

// 상태에 따른 태그 색상 반환 함수 (모달과 페이지에서 공통 사용)
const getStatusColor = (status: ReturnResponseDto['status']) => {
  switch (status) {
    case 'REQUESTED':
      return 'blue';
    case 'APPROVED':
      return 'cyan';
    case 'PROCESSING':
      return 'gold';
    case 'COMPLETED':
      return 'green';
    case 'REJECTED':
      return 'red';
    default:
      return 'default';
  }
};

// 상태 한글 번역 매핑 (모달과 페이지에서 공통 사용)
const statusTranslations: Record<ReturnResponseDto['status'], string> = {
  'REQUESTED': '요청됨',
  'REJECTED': '거절됨',
  'APPROVED': '승인됨',
  'PROCESSING': '처리 중',
  'COMPLETED': '완료됨',
};

const ReturnDetailModal: React.FC<ReturnDetailModalProps> = ({ open, onClose, returnDetail }) => {
  if (!returnDetail) return null;

  return (
    <Modal
      title="반품 상세 정보"
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      {/* [수정] Descriptions 컴포넌트를 사용하여 상세 정보 깔끔하게 표시 */}
      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="반품 ID">{returnDetail.returnId}</Descriptions.Item>
        <Descriptions.Item label="약국명">{returnDetail.pharmacyName}</Descriptions.Item>
        <Descriptions.Item label="주문 ID">{returnDetail.orderId || 'N/A'}</Descriptions.Item>
        <Descriptions.Item label="신청일">{new Date(returnDetail.createdAt).toLocaleString()}</Descriptions.Item>
        <Descriptions.Item label="처리일">{returnDetail.updatedAt ? new Date(returnDetail.updatedAt).toLocaleString() : '-'}</Descriptions.Item>
        <Descriptions.Item label="총 반품 금액">{returnDetail.totalPrice.toLocaleString()}원</Descriptions.Item>
        <Descriptions.Item label="상태">
          <Tag color={getStatusColor(returnDetail.status)}>{statusTranslations[returnDetail.status] || returnDetail.status}</Tag>
        </Descriptions.Item>
      </Descriptions>

      <Typography.Title level={4} style={{ marginTop: 24, marginBottom: 16 }}>반품 품목</Typography.Title>
      <Table
        dataSource={returnDetail.items}
        columns={[
          { title: '제품명', dataIndex: 'productName', key: 'productName' },
          { title: '제조사', dataIndex: 'manufacturer', key: 'manufacturer' },
          { title: '수량', dataIndex: 'quantity', key: 'quantity' },
          { title: '단가', dataIndex: 'unitPrice', key: 'unitPrice', render: (val) => `${val.toLocaleString()}원` },
          { title: '소계', dataIndex: 'subtotalPrice', key: 'subtotalPrice', render: (val) => `${val.toLocaleString()}원` },
          { title: '반품 사유', dataIndex: 'reason', key: 'reason' },
        ]}
        pagination={false}
        rowKey="productId"
        size="small"
      />
    </Modal>
  );
};

export default function ReturnManagementPage() {
  const [returns, setReturns] = useState<ReturnResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTargetReturnId, setRejectTargetReturnId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedReturnDetail, setSelectedReturnDetail] = useState<ReturnResponseDto | null>(null);

  // [수정] 반품 목록을 가져오는 함수 (API 연동 및 응답 구조 변경 반영)
  const fetchReturns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: 0, // 페이지네이션 필요 시 동적으로 변경
        size: 100, // 한 페이지에 보여줄 항목 수
        status: statusFilter,
        pharmacyName: search || undefined,
      };
      const response = await api.get('/admin/returns', { params }); // api 인스턴스 사용
      // 백엔드 응답 구조에 맞춰 response.data.data를 직접 사용
      if (response.data.data) {
        setReturns(response.data.data);
      } else {
        setReturns([]);
      }
    } catch (err) {
      setError('반품 목록을 불러오는 데 실패했습니다.');
      console.error('Error fetching returns:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  // [정리] 컴포넌트 마운트 및 필터 변경 시 반품 목록 조회
  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  // [수정] 반품 승인 처리 (API 연동)
  const handleApprove = async (returnId: number) => {
    try {
      // 백엔드 관리자용 API가 명확하지 않아 지점용 API 사용. 필요시 백엔드 수정 필요.
      await api.post(`/branch/returns/approve/${returnId}`);
      alert('반품이 승인되었습니다.');
      fetchReturns(); // 목록 새로고침
    } catch (error) {
      alert('반품 승인에 실패했습니다.');
      console.error('Error approving return:', error);
    }
  };

  // [정리] 반품 거절 모달 열기
  const handleRejectClick = (returnId: number) => {
    setRejectTargetReturnId(returnId);
    setRejectModalOpen(true);
  };

  // [수정] 반품 거절 처리 (API 연동)
  const handleRejectConfirm = async () => {
    if (!rejectTargetReturnId || !rejectReason) return;
    try {
      // 백엔드에 거절 사유를 전달하는 API가 필요합니다. 현재는 updateStatus만 있으므로,
      // 거절 사유를 업데이트하는 별도의 API가 없으면 백엔드 수정이 필요합니다.
      // 여기서는 임시로 updateStatus를 사용하고, 실제 구현에서는 백엔드 API에 맞춰야 합니다.
      // 백엔드 관리자용 API가 명확하지 않아 지점용 API 사용. 필요시 백엔드 수정 필요.
      await api.post(`/branch/returns/reject/${rejectTargetReturnId}`, { reason: rejectReason });
      alert('반품이 거절되었습니다.');
      setRejectModalOpen(false);
      setRejectReason('');
      setRejectTargetReturnId(null);
      fetchReturns(); // 목록 새로고침
    } catch (error) {
      alert('반품 거절에 실패했습니다.');
      console.error('Error rejecting return:', error);
    }
  };

  // [수정] 테이블 행 클릭 시 상세 정보 모달 열기 (API 연동)
  const handleRowClick = async (record: ReturnResponseDto) => {
    try {
      const response = await api.get(`/admin/returns/${record.returnId}`);
      setSelectedReturnDetail(response.data);
      setIsDetailModalOpen(true);
    } catch (error) {
      alert('반품 상세 정보를 불러오는 데 실패했습니다.');
      console.error('Error fetching return detail:', error);
    }
  };

  // [정리] 통계 계산
  const totalRequested = returns.length;
  const totalApproved = returns.filter((i) => i.status === 'APPROVED').length;
  const totalRejected = returns.filter((i) => i.status === 'REJECTED').length;
  const totalAmount = returns.reduce(
    (sum, item) => (item.status === 'APPROVED' ? sum + item.totalPrice : sum),
    0,
  );

  // [정리] 테이블 컬럼 정의
  const columns: ColumnsType<ReturnResponseDto> = [
    { title: '신청일', dataIndex: 'createdAt', render: (text) => new Date(text).toLocaleDateString(), sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() },
    { title: '가맹점명', dataIndex: 'pharmacyName' },
    { title: '주문번호', dataIndex: 'orderId', render: (text) => text || 'N/A' },
    { title: '총 반품 금액', dataIndex: 'totalPrice', render: (val) => `${val.toLocaleString()}원` },
    {
      title: '상태',
      dataIndex: 'status',
      render: (text: ReturnResponseDto['status']) => {
        return (
          <Tag color={getStatusColor(text)}>{statusTranslations[text] || text}</Tag>
        );
      },
    },
    {
      title: '관리',
      render: (_, record) =>
        record.status === 'REQUESTED' ? (
          <>
            <Button type="primary" size="small" onClick={(e) => { e.stopPropagation(); handleApprove(record.returnId); }}>
              승인
            </Button>
            <Button
              danger
              size="small"
              onClick={(e) => { e.stopPropagation(); handleRejectClick(record.returnId); }}
              style={{ marginLeft: 8 }}
            >
              거절
            </Button>
          </>
        ) : (
          '-'
        ),
    },
  ];

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error}</div>;

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="총 요청" value={totalRequested} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="승인 완료" value={totalApproved} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="반품 거절" value={totalRejected} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="총 반품 금액" value={totalAmount} suffix="원" />
          </Card>
        </Col>
      </Row>

      <Row justify="end" style={{ marginBottom: 16 }}>
        <Col>
          <Input
            prefix={<SearchOutlined />}
            placeholder="가맹점명 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 200, marginRight: 8 }}
          />
          <Select
            value={statusFilter || ''}
            onChange={(value) => setStatusFilter(value || null)}
            style={{ width: 120 }}
          >
            <Select.Option value="">모든 상태</Select.Option>
            <Select.Option value="REQUESTED">요청됨</Select.Option>
            <Select.Option value="APPROVED">승인됨</Select.Option>
            <Select.Option value="REJECTED">거절됨</Select.Option>
            <Select.Option value="PROCESSING">처리 중</Select.Option>
            <Select.Option value="COMPLETED">완료됨</Select.Option>
          </Select>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={returns}
        pagination={{ pageSize: 10 }}
        rowKey="returnId"
        onRow={(record) => {
          return {
            onClick: () => {
              handleRowClick(record);
            },
          };
        }}
      />

      <Modal
        title="반품 거절 사유 입력"
        open={rejectModalOpen}
        onOk={handleRejectConfirm}
        onCancel={() => setRejectModalOpen(false)}
        okText="거절"
        cancelText="취소"
      >
        <Input.TextArea
          placeholder="거절 사유를 입력하세요"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          autoSize={{ minRows: 3 }}
        />
      </Modal>

      <ReturnDetailModal
        open={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        returnDetail={selectedReturnDetail}
      />
    </div>
  );
}
