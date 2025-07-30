import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Tabs,
  Input,
  Select,
  Button,
  Row,
  Col,
  Card,
  Typography,
  Pagination,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const newProducts = [
  { id: 1, name: '속엔쿨정', manufacturer: 'GC녹십자', price: 10000, category: '내복제', image: '/images/SoknCool.jpg' },
  { id: 2, name: '에스마린350연질캡슐', manufacturer: '대웅제약', price: 9200, category: '내복제', image: '/images/S_marin.png' },
  { id: 3, name: '리어스탑캡슐', manufacturer: '한미약품', price: 8900, category: '내복제', image: '/images/lierstop.jpg' },
  { id: 4, name: '세미론정', manufacturer: '삼진제약', price: 8500, category: '내복제', image: '/images/semiron.jpg' },
];

const bestSellers = [
  { id: 6, name: '메이킨큐장용정', manufacturer: '종근당제약', price: 6900, category: '내복제', image: '/images/Maken_Q.jpg' },
  { id: 7, name: '훼스탈플러스정', manufacturer: '한독', price: 7600, category: '내복제', image: '/images/FestalPlusTablets.jpg' },
  { id: 8, name: '까스활명수큐액', manufacturer: '동화약품', price: 7800, category: '내복제', image: '/images/Cass_active_water.jpg' },
  { id: 9, name: '세미론정', manufacturer: '삼진제약', price: 8500, category: '내복제', image: '/images/semiron.jpg' },
];

const allProducts = [...newProducts, ...bestSellers];

const medicalSupplies = [
  { id: 101, name: '시지바이오_이지덤플러스씬상처습윤밴드(10x10cm)', manufacturer: '시지바이오', price: 17800, category: '반창고/밴드/부직/테이프드레싱', image: '/images/이지덤플러스씬.jpg' },
  { id: 102, name: '부광 일회용주사기 무침 20ml 50개입', manufacturer: '부광메디칼', price: 6840, category: '주사용품/주사기/주사침', image: '/images/부광_일회용주사기.jpg' },
  { id: 103, name: '래피젠 CoviFlu 듀오 진단키트 20T', manufacturer: '래피젠', price: 153600, category: '진단키트', image: '/images/래피젠키트.png' },
  { id: 104, name: '수성위재_외과패드/써지칼패드(Surgical Pad)', manufacturer: '수성위재', price: 7680, category: '거즈/탈지면/붕대/솜/면봉', image: '/images/외과패드.jpg' },
  { id: 105, name: '퓨로메디 500ml', manufacturer: '더가넷', price: 12000, category: '소독/세척', image: '/images/퓨로메디.jpg' },
  { id: 106, name: '외과용각침 10호 53mm 3/8Circle 10개입', manufacturer: '아이리', price: 7800, category: '봉합사/봉합침', image: '/images/외과용각침.jpg' },
  { id: 107, name: '폴리글러브 일회용비닐장갑200매/박스', manufacturer: '건강누리', price: 2250, category: '마스크/모자/장갑', image: '/images/폴리글러브.jpg' },
];

// 타입 안전을 위한 카테고리 상수 정의
const categories = {
  의약품: ['전체보기', '주사제', '백신', '흡입제', '내복제', '외용제', '기타'],
  의약소모품: [
    '전체보기',
    '주사용품/주사기/주사침',
    '거즈/탈지면/붕대/솜/면봉',
    '반창고/밴드/부직/테이프드레싱',
    '소독/세척',
    '봉합사/봉합침',
    '마스크/모자/장갑',
    '진단키트',
  ],
} as const;

type TabKey = keyof typeof categories; // '의약품' | '의약소모품'

export default function ProductListPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('의약품');
  const [activeCategory, setActiveCategory] = useState('전체보기');
  const [searchName, setSearchName] = useState('');
  const [searchManufacturer, setSearchManufacturer] = useState('');
  const [sortOrder, setSortOrder] = useState('낮은 가격순');
  const [currentPage, setCurrentPage] = useState(1);

  const PAGE_SIZE = 8;

  const getFilteredProducts = () => {
    const source = activeTab === '의약품' ? allProducts : medicalSupplies;
    let filtered = [...source];

    if (activeCategory !== '전체보기') {
      filtered = filtered.filter(item => item.category === activeCategory);
    }
    if (searchName) {
      filtered = filtered.filter(item => item.name.includes(searchName));
    }
    if (searchManufacturer) {
      filtered = filtered.filter(item => item.manufacturer.includes(searchManufacturer));
    }
    if (sortOrder === '낮은 가격순') {
      filtered.sort((a, b) => a.price - b.price);
    } else {
      filtered.sort((a, b) => b.price - a.price);
    }

    return filtered;
  };

  const paginated = getFilteredProducts().slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div style={{ padding: 24, position: 'relative' }}>
      <Title level={3}>의약품 목록</Title>

      <Tabs defaultActiveKey="신제품" style={{ marginBottom: 16 }}>
        <TabPane tab="신제품" key="신제품">
          <Row gutter={[16, 16]}>
            {newProducts.map((item, idx) => (
              <Col key={idx} xs={24} sm={12} md={6}>
                <Card
                  hoverable
                  onClick={() => navigate(`/hq/products/${item.id}`)}
                  cover={<img src={item.image} alt={item.name} style={{ height: 150, objectFit: 'contain' }} />}
                >
                  <Card.Meta title={item.name} description={`${item.manufacturer} ${item.price.toLocaleString()}원`} />
                </Card>
              </Col>
            ))}
          </Row>
        </TabPane>
        <TabPane tab="베스트셀러" key="베스트셀러">
          <Row gutter={[16, 16]}>
            {bestSellers.map((item, idx) => (
              <Col key={idx} xs={24} sm={12} md={6}>
                <Card
                  hoverable
                  onClick={() => navigate(`/hq/products/${item.id}`)}
                  cover={<img src={item.image} alt={item.name} style={{ height: 150, objectFit: 'contain' }} />}
                >
                  <Card.Meta title={item.name} description={`${item.manufacturer} ${item.price.toLocaleString()}원`} />
                </Card>
              </Col>
            ))}
          </Row>
        </TabPane>
      </Tabs>

      <Tabs activeKey={activeTab} onChange={key => {
        setActiveTab(key as TabKey);
        setActiveCategory('전체보기');
      }} style={{ marginBottom: 16 }}>
        <TabPane tab="의약품" key="의약품" />
        <TabPane tab="의약소모품" key="의약소모품" />
      </Tabs>

      <Row gutter={8} style={{ marginBottom: 16 }}>
        <Col span={6}><label>의약품 이름 검색</label><Input placeholder="예: 훼스탈" onChange={e => setSearchName(e.target.value)} /></Col>
        <Col span={6}><label>제조사 검색</label><Input placeholder="예: 한미약품" onChange={e => setSearchManufacturer(e.target.value)} /></Col>
        <Col span={6}><label>정렬 기준</label>
          <Select value={sortOrder} onChange={value => setSortOrder(value)} style={{ width: '100%' }}>
            <Option value="낮은 가격순">낮은 가격순</Option>
            <Option value="높은 가격순">높은 가격순</Option>
          </Select>
        </Col>
      </Row>

      {/* ✅ 빨간줄 해결된 카테고리 버튼 */}
      <div style={{ marginBottom: 16 }}>
        {categories[activeTab].map(cat => (
          <Button
            key={cat}
            type={cat === activeCategory ? 'primary' : 'default'}
            style={{ marginRight: 8, marginBottom: 8 }}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      <Row gutter={[16, 16]}>
        {paginated.map((item, idx) => (
          <Col key={idx} xs={24} sm={12} md={6}>
            <Card
              hoverable
              onClick={() => navigate(`/hq/products/${item.id}`)}
              cover={<img src={item.image} alt={item.name} style={{ height: 150, objectFit: 'contain' }} />}
            >
              <Card.Meta title={item.name} description={`${item.manufacturer} ${item.price.toLocaleString()}원`} />
            </Card>
          </Col>
        ))}
      </Row>

      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <Pagination
          current={currentPage}
          total={getFilteredProducts().length}
          pageSize={PAGE_SIZE}
          onChange={page => setCurrentPage(page)}
        />
      </div>

      <Button
        type="primary"
        icon={<PlusOutlined />}
        size="large"
        style={{
          position: 'fixed',
          bottom: 40,
          right: 40,
          zIndex: 1000,
          borderRadius: '24px'
        }}
      >
        의약품 등록
      </Button>
    </div>
  );
}
