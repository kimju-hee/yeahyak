import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Table,
  Tag,
  Typography,
  message,
  Descriptions // Descriptions import 추가
} from 'antd';
import React, { useState, useEffect, useCallback } from 'react';
import type { ColumnsType } from 'antd/es/table';
import { instance as api } from '../../api/api';
import { useAuthStore } from '../../stores/authStore';
import type { Pharmacy } from '../../types/profile.type';

const { Option } = Select;
const { Title } = Typography;

// --- 타입 정의 ---

// [수정] 백엔드 ReturnResponseDto에 맞춘 반품 내역 타입
interface ReturnResponse {
  returnId: number;
  pharmacyId: number;
  pharmacyName: string;
  orderId: number | null; // orderId가 null일 수 있음
  createdAt: string;
  updatedAt: string | null; // updatedAt이 null일 수 있음
  totalPrice: number;
  status: 'REQUESTED' | 'REJECTED' | 'APPROVED' | 'PROCESSING' | 'COMPLETED';
  items: ReturnItemResponse[];
}

// [수정] 백엔드 ReturnItemResponseDto에 맞춘 반품 품목 타입
interface ReturnItemResponse {
  productId: number;
  productName: string;
  manufacturer: string;
  reason: string;
  quantity: number;
  unitPrice: number;
  subtotalPrice: number;
}

// 상품 정보 타입
interface Product {
  productId: number | null;
  productName: string;
  productCode?: string;
  manufacturer?: string;
  unitPrice: number;
}

// 주문 품목 타입
interface OrderItem {
  productId: number | null;
  productName: string;
  productCode?: string; // 추가
  manufacturer?: string; // 추가
  quantity: number;
  unitPrice: number;
  subtotalPrice: number;
}

// 주문 정보 타입
interface Order {
  orderId: number;
  pharmacyName: string;
  createdAt: string;
  totalPrice: number;
  status: 'REQUESTED' | 'APPROVED' | 'PROCESSING' | 'SHIPPING' | 'COMPLETED' | 'CANCELED';
  items: OrderItem[];
}

// 장바구니에 담기는 반품 항목 타입
interface CartItem {
  key: string;
  orderId: number;
  productId: number;
  productName: string;
  productCode?: string;
  manufacturer?: string;
  quantity: number;
  unitPrice: number;
  reason: string;
  returnDate: string;
}

// [추가] 반품 상세 정보를 표시하는 모달 컴포넌트
interface ReturnDetailModalProps {
  open: boolean;
  onClose: () => void;
  returnDetail: ReturnResponse | null;
}

const ReturnDetailModal: React.FC<ReturnDetailModalProps> = ({ open, onClose, returnDetail }) => {
  if (!returnDetail) return null;

  // 상태 한글 번역 매핑 (모달 내에서 사용)
  const statusTranslations: Record<ReturnResponse['status'], string> = {
    'REQUESTED': '요청됨',
    'REJECTED': '거절됨',
    'APPROVED': '승인됨',
    'PROCESSING': '처리 중',
    'COMPLETED': '완료됨',
  };

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

// [추가] 상태에 따른 태그 색상 반환 함수 (모달과 페이지에서 공통 사용)
const getStatusColor = (status: ReturnResponse['status']) => {
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

export default function ReturnRequestPage() {
  const { profile } = useAuthStore();
  const pharmacyProfile = profile as Pharmacy;
  const [form] = Form.useForm();
  const [items, setItems] = useState<CartItem[]>([]);
  const [returnHistory, setReturnHistory] = useState<ReturnResponse[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [productList, setProductList] = useState<Product[]>([]);
  const [currentMaxReturnQuantity, setCurrentMaxReturnQuantity] = useState<number>(1);
  
  const [modalVisible, setModalVisible] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  // [추가] 상세 정보 모달 관련 상태
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedReturnDetail, setSelectedReturnDetail] = useState<ReturnResponse | null>(null);


  // [수정] 반품 내역을 가져오는 함수 (API 연동 및 응답 구조 변경 반영)
  const fetchReturnHistory = useCallback(async () => {
    if (!pharmacyProfile?.pharmacyId) {
      return;
    }
    try {
      // /api/branch/returns 엔드포인트 사용
      const response = await api.get(`/branch/returns?pharmacyId=${pharmacyProfile.pharmacyId}`);
      if (response.data.success) {
        // 백엔드 응답 구조에 맞춰 response.data.data를 직접 사용
        if (response.data.data) { // data 필드가 존재하는지 확인
          setReturnHistory(response.data.data); // data 필드가 직접 배열을 포함
        } else {
          setReturnHistory([]);
        }
      } else {
        message.error(response.data.message || '반품 내역을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('반품 내역 불러오기 실패:', error);
      message.error('반품 내역을 불러오는 중 오류가 발생했습니다.');
    }
  }, [pharmacyProfile]);

  
  // [수정] 주문 목록을 가져오는 함수 (API 연동 및 응답 구조 변경 반영)
  const fetchOrders = useCallback(async () => {
    if (!pharmacyProfile?.pharmacyId) {
      return;
    }
    try {
      const url = `/orders/branch/orders?pharmacyId=${pharmacyProfile.pharmacyId}`;

      const response = await api.get(url);
      if (response.data.success) {
        const fetchedOrders = response.data.data;
        setOrdersForModal(fetchedOrders || []);
      } else {
        message.error(response.data.message || '주문 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('주문 목록 불러오기 실패:', error);
      message.error('주문 목록을 불러오는 중 오류가 발생했습니다.');
    }
  }, [pharmacyProfile]);

  const [ordersForModal, setOrdersForModal] = useState<Order[]>([]);

  // [정리] 불필요한 useEffect 제거 (ordersForModal 상태 변화 감지)
  // useEffect(() => {
  //   if (modalVisible) {
  //   }
  // }, [ordersForModal, modalVisible]);

  // [수정] 컴포넌트 마운트 시 주문 및 반품 내역 조회
  useEffect(() => {
    if (pharmacyProfile?.pharmacyId) {
      fetchOrders();
      fetchReturnHistory();
    }
  }, [pharmacyProfile, fetchOrders, fetchReturnHistory]);

  // [정리] 선택된 주문 변경 시 폼 필드 초기화
  useEffect(() => {
    if (!selectedOrder) {
      form.setFieldValue('maxReturnQuantity', 1);
    }
    form.resetFields(['product', 'quantity', 'reason']);
  }, [selectedOrder, form]);

  // [정리] 주문번호 선택 모달 열기
  const handleOrderClick = () => {
    setModalVisible(true);
    fetchOrders();
  };

  // [정리] 주문 선택 핸들러
  const handleOrderSelect = (order: Order) => {
    form.setFieldValue('orderNumber', order.orderId);
    form.validateFields(['orderNumber']);
    setSelectedOrder(order);
    setProductList(order.items.filter(item => item.productId !== null).map(item => {
      const product = {
        productId: item.productId as number,
        productName: item.productName,
        productCode: item.productCode,
        manufacturer: item.manufacturer,
        unitPrice: item.unitPrice,
      };
      return product;
    }));
    form.resetFields(['product', 'quantity', 'reason']);
    setModalVisible(false);
  };

  // [정리] 제품 변경 핸들러
  const handleProductChange = (productId: number) => {
    const product = productList.find((p) => p.productId === productId) || null;
    let calculatedMaxQuantity = 1;
    if (selectedOrder) {
      const orderedItem = selectedOrder.items.find(item => item.productId === productId);
      if (orderedItem) {
        calculatedMaxQuantity = orderedItem.quantity;
      }
    }
    setCurrentMaxReturnQuantity(calculatedMaxQuantity);
    form.setFieldsValue({
      unitPrice: product?.unitPrice || '',
      quantity: null,
      maxReturnQuantity: calculatedMaxQuantity,
    });
  };

  // [정리] 장바구니에 항목 추가
  const handleAddItem = () => {
    form.validateFields(['product', 'quantity', 'reason', 'orderNumber'])
      .then((values) => {
        if (!selectedOrder) {
          message.error('주문번호를 먼저 선택해주세요.');
          return;
        }
        const selectedProductInForm = productList.find((p) => p.productId === values.product);
        if (!selectedProductInForm) {
          message.error('선택된 제품 정보를 찾을 수 없습니다.');
          return;
        }
        const isDuplicate = items.some(
          (item) =>
            item.orderId === selectedOrder.orderId &&
            item.productId === selectedProductInForm.productId
        );
        if (isDuplicate) {
          message.warning('이미 추가된 반품 항목입니다.');
          return;
        }

        const newItem: CartItem = {
          key: `${selectedOrder.orderId}-${selectedProductInForm.productId}-${Date.now()}`,
          orderId: selectedOrder.orderId,
          productId: selectedProductInForm.productId,
          productName: selectedProductInForm.productName,
          productCode: selectedProductInForm.productCode,
          manufacturer: selectedProductInForm.manufacturer,
          quantity: values.quantity,
          unitPrice: selectedProductInForm.unitPrice,
          reason: values.reason,
          returnDate: today,
        };
        setItems([...items, newItem]);
        message.success('항목이 성공적으로 추가되었습니다.');
        form.resetFields(['product', 'quantity', 'reason']);
      })
      .catch(() => {
        message.error('필수 입력 항목을 모두 채워주세요.');
      });
  };

  // [정리] 장바구니 항목 삭제
  const handleRemoveItem = (key: string) => {
    setItems(items.filter((item) => item.key !== key));
  };

  // [수정] 반품 신청 제출 (API 연동 및 반품 내역 새로고침)
  const handleSubmit = async () => {
    if (items.length === 0 || !selectedOrder) {
      message.warning('반품할 항목을 추가하고 주문을 선택해주세요.');
      return;
    }

    try {
      const returnRequestData = {
        pharmacyId: pharmacyProfile.pharmacyId,
        orderId: selectedOrder.orderId,
        reason: items[0]?.reason || '단순 변심',
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      };

      const response = await api.post('/branch/returns', returnRequestData);

      if (response.data.success) {
        message.success('반품 요청이 성공적으로 제출되었습니다.');
        setItems([]);
        form.resetFields();
        setSelectedOrder(null);
        fetchReturnHistory();
      } else {
        message.error(response.data.message || '반품 요청에 실패했습니다.');
      }
    } catch (error) {
      console.error('반품 요청 실패:', error);
      const errorMessage = (error as any).response?.data?.message || '반품 요청 중 오류가 발생했습니다.';
      message.error(errorMessage);
    }
  };

  // [추가] 반품 내역 테이블 행 클릭 핸들러 (상세 모달 표시)
  const handleReturnHistoryRowClick = async (record: ReturnResponse) => {
    try {
      const response = await api.get(`/branch/returns/${record.returnId}`);
      if (response.data.success) {
        setSelectedReturnDetail(response.data.data);
        setIsDetailModalOpen(true);
      } else {
        message.error(response.data.message || '반품 상세 정보를 불러오는 데 실패했습니다.');
      }
    } catch (error) {
      console.error('Error fetching return detail:', error);
      message.error('반품 상세 정보를 불러오는 중 오류가 발생했습니다.');
    }
  };

  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  // [정리] 장바구니 테이블 컬럼 정의
  const columns: ColumnsType<CartItem> = [
    { title: '신청일', dataIndex: 'returnDate' },
    { title: '제품명', dataIndex: 'productName' },
    { title: '제품번호', dataIndex: 'productCode' },
    { title: '제조사', dataIndex: 'manufacturer' },
    { title: '반품 수량', dataIndex: 'quantity' },
    { title: '단가', dataIndex: 'unitPrice', render: (val) => `${val.toLocaleString()}원` },
    {
      title: '반품 금액',
      render: (_, record) => `${(record.quantity * record.unitPrice).toLocaleString()}원`,
    },
    { title: '반품 사유', dataIndex: 'reason' },
    {
      title: '관리',
      render: (_, record) => (
        <Button danger onClick={() => handleRemoveItem(record.key)}>
          삭제
        </Button>
      ),
    },
  ];

  // [수정] 반품 내역 테이블 컬럼 정의 (API 응답 구조에 맞춤)
  const historyColumns: ColumnsType<ReturnResponse> = [
    { title: '신청일', dataIndex: 'createdAt', render: (text) => new Date(text).toLocaleDateString() },
    { title: '반품번호', dataIndex: 'returnId' },
    {
      title: '총 반품 금액',
      dataIndex: 'totalPrice',
      render: (val) => `${val.toLocaleString()}원`,
    },
    {
      title: '상태',
      dataIndex: 'status',
      render: (status) => <Tag color={getStatusColor(status)}>{statusTranslations[status] || status}</Tag>,
    },
    {
      title: '처리일',
      dataIndex: 'updatedAt',
      render: (text) => (text ? new Date(text).toLocaleDateString() : '-'),
    },
  ];

  // [정리] 상태 한글 번역 매핑
  const statusTranslations: Record<ReturnResponse['status'], string> = {
    'REQUESTED': '요청됨',
    'REJECTED': '거절됨',
    'APPROVED': '승인됨',
    'PROCESSING': '처리 중',
    'COMPLETED': '완료됨',
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>반품 요청</Title>
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item
              name="orderNumber"
              label={<span style={{ color: 'red' }}>* 주문번호</span>}
              rules={[{ required: true, message: '주문번호를 선택해주세요.' }]}
            >
              <Input readOnly onClick={handleOrderClick} placeholder="주문번호 선택" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16} align="bottom">
          <Col span={4}>
            <Form.Item
              name="product"
              label={<span style={{ color: 'red' }}>* 제품명</span>}
              rules={[{ required: true, message: '제품을 선택해주세요.' }]}
            >
              <Select
                placeholder="제품 선택"
                onChange={(value) => {
                  form.setFieldValue('product', value);
                  handleProductChange(value);
                }}
                value={form.getFieldValue('product')}
                disabled={!productList.length}
              >
                {productList.map((p) => (
                  <Option key={p.productId} value={p.productId}>
                    {p.productName || '이름 없음'}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item
              name="quantity"
              label={<span style={{ color: 'red' }}>* 반품 수량</span>}
              rules={[
                { required: true, message: '반품 수량 입력.' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || value <= currentMaxReturnQuantity) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error(`반품 수량은 주문 수량(${currentMaxReturnQuantity}개)을 초과할 수 없습니다.`));
                  },
                }),
              ]}
            >
              <InputNumber
                min={1}
                max={currentMaxReturnQuantity}
                style={{ width: '100%' }}
                placeholder={form.getFieldValue('product') ? `주문 수량: ${currentMaxReturnQuantity || 0}개` : '반품 수량 입력'}
              />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="단가">
              <Input
                disabled
                value={
                  productList.find(p => p.productId === form.getFieldValue('product'))?.unitPrice
                    ? `${productList.find(p => p.productId === form.getFieldValue('product'))?.unitPrice.toLocaleString()}원`
                    : ''
                }
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="reason"
              label={<span style={{ color: 'red' }}>* 반품 사유</span>}
              rules={[{ required: true, message: '반품 사유 입력.' }]}
            >
              <Input.TextArea placeholder="반품 사유 입력" autoSize={{ minRows: 1, maxRows: 4 }} />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item>
              <Button type="primary" onClick={handleAddItem} style={{ marginTop: 30 }}>
                항목 추가
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <Table
        columns={columns}
        dataSource={items}
        pagination={false}
        style={{ marginTop: 16 }}
        rowKey="key"
      />
      <div style={{ textAlign: 'right', marginTop: 12 }}>
        총 반품 금액: <strong>{totalAmount.toLocaleString()}원</strong>
      </div>
      <div style={{ textAlign: 'right', marginTop: 12 }}>
        <Button type="primary" onClick={handleSubmit}>
          반품 신청
        </Button>
      </div>

      <Card title="반품 진행 현황" style={{ marginTop: 48 }}>
        <Table
          columns={historyColumns}
          dataSource={returnHistory}
          pagination={{ pageSize: 5 }}
          rowKey={(record) => record.returnId !== null && record.returnId !== undefined ? record.returnId : `return-${record.createdAt}-${record.pharmacyId}`}
          onRow={(record) => {
            return {
              onClick: () => {
                handleReturnHistoryRowClick(record);
              },
            };
          }}
        />
      </Card>

      <Modal
        title="주문번호 선택"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        {ordersForModal.length > 0 ? (
          ordersForModal.map((order, index) => (
            <Card
              key={
                order.orderId !== null && order.orderId !== undefined
                  ? order.orderId
                  : `order-${index}`
              }
              hoverable
              onClick={() => handleOrderSelect(order)}
              style={{ marginBottom: 16 }}
            >
              <p>
                <strong>주문번호:</strong> {order.orderId}
              </p>
              <p>
                <strong>지점명:</strong> {order.pharmacyName || '이름 없음'}
              </p>
              <p>
                <strong>요청일자:</strong> {new Date(order.createdAt).toLocaleDateString()}
              </p>
              <p>
                <strong>총 금액:</strong> {order.totalPrice.toLocaleString()}원
              </p>
            </Card>
          ))
        ) : (
          <p>주문 내역이 없습니다.</p>
        )}
      </Modal>

      <ReturnDetailModal
        open={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        returnDetail={selectedReturnDetail}
      />
    </div>
  );
}
