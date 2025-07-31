// src/pages/Common/Product/ProductListPage.tsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "antd";
import { PlusOutlined } from "@ant-design/icons";

// ✅ 전역(데모) 스토어에서 현재 값을 읽어옵니다.
import { productDetails, supplyDetails } from "../../../utils/productData";

const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

/** 상단 데모 섹션(신제품/베스트셀러) 카드 데이터 — 하단 그리드와는 분리 유지 */
const newProducts = [
  { id: 1, name: "속엔쿨정", manufacturer: "GC녹십자", price: 10000, category: "내복제", image: "/images/SoknCool.jpg" },
  { id: 2, name: "에스마린350연질캡슐", manufacturer: "대웅제약", price: 9200, category: "내복제", image: "/images/S_marin.png" },
  { id: 3, name: "리어스탑캡슐", manufacturer: "한미약품", price: 8900, category: "내복제", image: "/images/lierstop.jpg" },
  { id: 4, name: "세미론정", manufacturer: "삼진제약", price: 8500, category: "내복제", image: "/images/semiron.jpg" },
];

const bestSellers = [
  { id: 6, name: "메이킨큐장용정", manufacturer: "종근당제약", price: 6900, category: "내복제", image: "/images/Maken_Q.jpg" },
  { id: 7, name: "훼스탈플러스정", manufacturer: "한독", price: 7600, category: "내복제", image: "/images/FestalPlusTablets.jpg" },
  { id: 8, name: "까스활명수큐액", manufacturer: "동화약품", price: 7800, category: "내복제", image: "/images/Cass_active_water.jpg" },
  { id: 9, name: "세미론정", manufacturer: "삼진제약", price: 8500, category: "내복제", image: "/images/semiron.jpg" },
];

// 카테고리(버튼) 정의
const categories = {
  의약품: ["전체보기", "주사제", "백신", "흡입제", "내복제", "외용제", "기타"],
  의약소모품: [
    "전체보기",
    "주사용품/주사기/주사침",
    "거즈/탈지면/붕대/솜/면봉",
    "반창고/밴드/부직/테이프드레싱",
    "소독/세척",
    "봉합사/봉합침",
    "마스크/모자/장갑",
    "진단키트",
  ],
} as const;
type TabKey = keyof typeof categories;

export default function ProductListPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>("의약품");
  const [activeCategory, setActiveCategory] = useState("전체보기");
  const [searchName, setSearchName] = useState("");
  const [searchManufacturer, setSearchManufacturer] = useState("");
  const [sortOrder, setSortOrder] = useState<"낮은 가격순" | "높은 가격순">("낮은 가격순");
  const [currentPage, setCurrentPage] = useState(1);

  const PAGE_SIZE = 8;

  /** ✅ 스토어에서 읽은 목록을 ‘항상 새 배열’로 만들고, id 기준으로 dedupe */
  const medicinesFromStore = useMemo(() => {
    const list = Object.values(productDetails).map((p: any) => ({
      id: String(p.id),
      name: p.name,
      manufacturer: p.manufacturer,
      price: Number(p.price) || 0,
      category: p.mfdsClass || p.category || "", // 의약품은 보통 mfdsClass가 분류
      image: p.image,
    }));
    // id 기준 dedupe
    const map = new Map<string, typeof list[number]>();
    list.forEach((item) => map.set(item.id, item));
    return Array.from(map.values());
    // 의도적으로 dependency 없음: productDetails는 전역 객체이고,
    // 라우팅/상태 변화로 컴포넌트가 다시 렌더되면 최신 값이 반영됩니다.
  }, []);

  const suppliesFromStore = useMemo(() => {
    const list = Object.values(supplyDetails).map((s: any) => ({
      id: String(s.id),
      name: s.name,
      manufacturer: s.manufacturer,
      price: Number(s.price) || 0,
      category: s.category || "",
      image: s.image,
    }));
    const map = new Map<string, typeof list[number]>();
    list.forEach((item) => map.set(item.id, item));
    return Array.from(map.values());
  }, []);

  /** 🔎 필터링 */
  const filtered = useMemo(() => {
    // 하단 그리드의 **단일 소스**
    const source = activeTab === "의약품" ? medicinesFromStore : suppliesFromStore;
    let result = [...source];

    if (activeCategory !== "전체보기") {
      result = result.filter((i) => (i.category || "") === activeCategory);
    }
    if (searchName.trim()) {
      result = result.filter((i) => i.name.includes(searchName.trim()));
    }
    if (searchManufacturer.trim()) {
      result = result.filter((i) => i.manufacturer.includes(searchManufacturer.trim()));
    }
    result.sort((a, b) => (sortOrder === "낮은 가격순" ? a.price - b.price : b.price - a.price));
    return result;
  }, [activeTab, activeCategory, searchName, searchManufacturer, sortOrder, medicinesFromStore, suppliesFromStore]);

  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage]
  );

  /** 탭/필터 바뀌면 페이지 1로 리셋 */
  const resetPage = () => setCurrentPage(1);

  return (
    <div style={{ padding: 24, position: "relative" }}>
      <Title level={3}>의약품 목록</Title>

      {/* 상단 데모 섹션 (실제 목록 그리드에 합치지 않습니다) */}
      <Tabs defaultActiveKey="신제품" style={{ marginBottom: 16 }}>
        <TabPane tab="신제품" key="신제품">
          <Row gutter={[16, 16]}>
            {newProducts.map((item) => (
              <Col key={item.id} xs={24} sm={12} md={6}>
                <Card
                  hoverable
                  onClick={() => navigate(`/hq/products/${item.id}`)}
                  cover={<img src={item.image} alt={item.name} style={{ height: 150, objectFit: "contain" }} />}
                >
                  <Card.Meta title={item.name} description={`${item.manufacturer} ${item.price.toLocaleString()}원`} />
                </Card>
              </Col>
            ))}
          </Row>
        </TabPane>
        <TabPane tab="베스트셀러" key="베스트셀러">
          <Row gutter={[16, 16]}>
            {bestSellers.map((item) => (
              <Col key={item.id} xs={24} sm={12} md={6}>
                <Card
                  hoverable
                  onClick={() => navigate(`/hq/products/${item.id}`)}
                  cover={<img src={item.image} alt={item.name} style={{ height: 150, objectFit: "contain" }} />}
                >
                  <Card.Meta title={item.name} description={`${item.manufacturer} ${item.price.toLocaleString()}원`} />
                </Card>
              </Col>
            ))}
          </Row>
        </TabPane>
      </Tabs>

      {/* 하단 실제 목록 탭 */}
      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key as TabKey);
          setActiveCategory("전체보기");
          resetPage();
        }}
        style={{ marginBottom: 16 }}
      >
        <TabPane tab="의약품" key="의약품" />
        <TabPane tab="의약소모품" key="의약소모품" />
      </Tabs>

      {/* 검색/정렬 */}
      <Row gutter={8} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <label>의약품 이름 검색</label>
          <Input
            placeholder="예: 훼스탈"
            value={searchName}
            onChange={(e) => {
              setSearchName(e.target.value);
              resetPage();
            }}
          />
        </Col>
        <Col span={6}>
          <label>제조사 검색</label>
          <Input
            placeholder="예: 한미약품"
            value={searchManufacturer}
            onChange={(e) => {
              setSearchManufacturer(e.target.value);
              resetPage();
            }}
          />
        </Col>
        <Col span={6}>
          <label>정렬 기준</label>
          <Select
            value={sortOrder}
            onChange={(v) => {
              setSortOrder(v);
              resetPage();
            }}
            style={{ width: "100%" }}
          >
            <Option value="낮은 가격순">낮은 가격순</Option>
            <Option value="높은 가격순">높은 가격순</Option>
          </Select>
        </Col>
      </Row>

      {/* 카테고리 버튼 */}
      <div style={{ marginBottom: 16 }}>
        {categories[activeTab].map((cat) => (
          <Button
            key={cat}
            type={cat === activeCategory ? "primary" : "default"}
            style={{ marginRight: 8, marginBottom: 8 }}
            onClick={() => {
              setActiveCategory(cat);
              resetPage();
            }}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* 실제 제품 그리드 — key는 반드시 item.id */}
      <Row gutter={[16, 16]}>
        {paginated.map((item) => (
          <Col key={item.id} xs={24} sm={12} md={6}>
            <Card
              hoverable
              onClick={() => navigate(`/hq/products/${item.id}`)}
              cover={<img src={item.image} alt={item.name} style={{ height: 150, objectFit: "contain" }} />}
            >
              <Card.Meta title={item.name} description={`${item.manufacturer} ${item.price.toLocaleString()}원`} />
            </Card>
          </Col>
        ))}
      </Row>

      <div style={{ marginTop: 24, textAlign: "center" }}>
        <Pagination
          current={currentPage}
          total={filtered.length}
          pageSize={PAGE_SIZE}
          onChange={(page) => setCurrentPage(page)}
        />
      </div>

      <Button
        type="primary"
        icon={<PlusOutlined />}
        size="large"
        style={{
          position: "fixed",
          bottom: 40,
          right: 40,
          zIndex: 1000,
          borderRadius: 24,
        }}
      >
        의약품 등록
      </Button>
    </div>
  );
}
