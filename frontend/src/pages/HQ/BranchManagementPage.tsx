import React, { useState } from "react";
import {
  Table,
  Button,
  Input,
  Modal,
  Space,
  Tag,
  Typography,
  Descriptions,
  Card,
  Row,
  Col,
  Statistic,
  message,
} from "antd";
import { EyeOutlined } from "@ant-design/icons";

const { Title } = Typography;

const dummyData = [
  {
    key: "1",
    branchCode: "BR001",
    branchName: "유성점",
    pharmacist: "김약사",
    contact: "010-1111-2222",
    balance: 150000,
    address: "대전 유성구 대학로 99",
    openedAt: "2023-01-15",
    lastCharged: "2025-07-20",
    status: "운영 중",
    manager: "박대리",
    businessHours: "09:00 ~ 18:00",
    bank: "농협 123-4567-8901",
    note: "거래 안정적",
  },
  {
    key: "2",
    branchCode: "BR002",
    branchName: "Kt점",
    pharmacist: "최진호",
    contact: "010-2222-3333",
    balance: 200000,
    address: "서울 강남구 테헤란로 123",
    openedAt: "2022-09-10",
    lastCharged: "2025-07-10",
    status: "휴점",
    manager: "이대리",
    businessHours: "10:00 ~ 17:00",
    bank: "신한 110-5555-1234",
    note: "리뉴얼 예정",
  },
  {
    key: "3",
    branchCode: "BR003",
    branchName: "신규점",
    pharmacist: "이약사",
    contact: "010-3333-4444",
    balance: 0,
    address: "부산 해운대구 센텀로 55",
    openedAt: "",
    lastCharged: "",
    status: "요청됨",
    manager: "",
    businessHours: "",
    bank: "",
    note: "",
  },
];

export default function BranchManagementPage() {
  const [data, setData] = useState(dummyData);
  const [searchText, setSearchText] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedRejectBranch, setSelectedRejectBranch] = useState<any>(null);

  // 상태별 통계
  const totalCount = data.length;
  const activeCount = data.filter((b) => b.status === "운영 중").length;
  const pausedCount = data.filter((b) => b.status === "휴점").length;
  const requestedCount = data.filter((b) => b.status === "요청됨").length;

  const filteredData = data.filter(
    (item) =>
      item.branchName.includes(searchText) ||
      item.pharmacist.includes(searchText) ||
      item.branchCode.includes(searchText)
  );

  const getStatusTag = (status: string) => {
    const color = status === "운영 중"
      ? "green"
      : status === "휴점"
      ? "orange"
      : status === "요청됨"
      ? "blue"
      : "default";
    return <Tag color={color}>{status}</Tag>;
  };

  const openDetailModal = (record: any) => {
    setSelectedBranch(record);
    setModalVisible(true);
  };

  const handleApprove = (branch: any) => {
    const updated = data.map((b) =>
      b.key === branch.key ? { ...b, status: "운영 중" } : b
    );
    setData(updated);
    message.success("가맹점 승인 완료");
  };

  const showRejectModal = (branch: any) => {
    setSelectedRejectBranch(branch);
    setRejectReason("");
    setIsRejectModalVisible(true);
  };

  const handleRejectConfirm = () => {
    if (!rejectReason.trim()) {
      message.error("거절 사유를 입력해주세요.");
      return;
    }

    const updated = data.map((b) =>
      b.key === selectedRejectBranch.key
        ? { ...b, status: "거절됨", note: rejectReason }
        : b
    );
    setData(updated);
    setIsRejectModalVisible(false);
    message.success("거절 처리 완료");
  };

  const handleRejectCancel = () => {
    setIsRejectModalVisible(false);
    setRejectReason("");
  };

  const columns = [
    {
      title: "지점코드",
      dataIndex: "branchCode",
      key: "branchCode",
    },
    {
      title: "지점명",
      dataIndex: "branchName",
      key: "branchName",
      render: (text: string, record: any) => (
        <Button type="link" icon={<EyeOutlined />} onClick={() => openDetailModal(record)}>
          {text}
        </Button>
      ),
    },
    { title: "약사명", dataIndex: "pharmacist", key: "pharmacist" },
    { title: "연락처", dataIndex: "contact", key: "contact" },
    {
      title: "보유금액",
      dataIndex: "balance",
      key: "balance",
      render: (val: number) => `${val.toLocaleString()}원`,
      sorter: (a: any, b: any) => a.balance - b.balance,
    },
    {
      title: "상태",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "운영 중", value: "운영 중" },
        { text: "휴점", value: "휴점" },
        { text: "요청됨", value: "요청됨" },
        { text: "거절됨", value: "거절됨" },
      ],
      onFilter: (value: any, record: any) => record.status === value,
      render: getStatusTag,
    },
    {
      title: "최근 충전일",
      dataIndex: "lastCharged",
      key: "lastCharged",
      sorter: (a: any, b: any) =>
        new Date(a.lastCharged).getTime() - new Date(b.lastCharged).getTime(),
    },
    {
      title: "충전",
      key: "charge",
      render: (_: any, record: any) =>
        record.status === "운영 중" || record.status === "휴점" ? (
          <Button type="primary">충전</Button>
        ) : null,
    },
    {
      title: "관리",
      key: "actions",
      render: (_: any, record: any) =>
        record.status === "요청됨" ? (
          <Space>
            <Button onClick={() => handleApprove(record)}>승인</Button>
            <Button danger onClick={() => showRejectModal(record)}>
              거절
            </Button>
          </Space>
        ) : null,
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2}>가맹점 관리</Title>

      {/* 카드 대시보드 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card><Statistic title="총 가맹점 수" value={totalCount} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="운영 중" value={activeCount} valueStyle={{ color: "green" }} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="휴점" value={pausedCount} valueStyle={{ color: "orange" }} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="요청됨" value={requestedCount} valueStyle={{ color: "blue" }} /></Card>
        </Col>
      </Row>

      {/* 검색창 */}
      <Input.Search
        placeholder="지점명, 약사명, 지점코드로 검색"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ width: 350, marginBottom: 16 }}
        allowClear
      />

      {/* 테이블 */}
      <Table
        columns={columns}
        dataSource={filteredData}
        pagination={{ pageSize: 5 }}
        rowKey="branchCode"
      />

      {/* 상세 모달 */}
      <Modal
        title={`${selectedBranch?.branchName} 상세 정보`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        {selectedBranch && (
          <Descriptions bordered column={1} size="middle">
            <Descriptions.Item label="약사명">{selectedBranch.pharmacist}</Descriptions.Item>
            <Descriptions.Item label="연락처">{selectedBranch.contact}</Descriptions.Item>
            <Descriptions.Item label="주소">{selectedBranch.address}</Descriptions.Item>
            <Descriptions.Item label="개설일">{selectedBranch.openedAt}</Descriptions.Item>
            <Descriptions.Item label="운영시간">{selectedBranch.businessHours}</Descriptions.Item>
            <Descriptions.Item label="계좌정보">{selectedBranch.bank}</Descriptions.Item>
            <Descriptions.Item label="보유금액">{selectedBranch.balance.toLocaleString()}원</Descriptions.Item>
            <Descriptions.Item label="최근 충전일">{selectedBranch.lastCharged}</Descriptions.Item>
            <Descriptions.Item label="상태">{getStatusTag(selectedBranch.status)}</Descriptions.Item>
            <Descriptions.Item label="비고">{selectedBranch.note}</Descriptions.Item>
            <Descriptions.Item label="본사 담당자">{selectedBranch.manager}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* 거절 사유 입력 모달 */}
      <Modal
        title="거절 사유 입력"
        open={isRejectModalVisible}
        onOk={handleRejectConfirm}
        onCancel={handleRejectCancel}
        okText="확인"
        cancelText="취소"
      >
        <Input.TextArea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="거절 사유를 입력해주세요"
          rows={4}
        />
      </Modal>
    </div>
  );
}
