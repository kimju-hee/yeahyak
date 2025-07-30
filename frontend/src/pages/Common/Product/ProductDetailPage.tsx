// src/pages/Common/Product/ProductDetailPage.tsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Typography, Row, Col, Tag, Divider, Descriptions } from "antd";
import { productDetails, supplyDetails } from "../../../utils/productData";

const { Title, Text, Paragraph } = Typography;

export default function ProductDetailPage() {
  const params = useParams();
  // 1) 어떤 타입이 와도 문자열로 정규화
  const id = String(params.id ?? "");
  const navigate = useNavigate();

  // 2) 키 접근 + values 순회 fallback(어떤 형태의 id여도 안전)
  const medicine =
    productDetails[id] ??
    Object.values(productDetails).find((p) => String(p.id) === id);

  const supply =
    supplyDetails[id] ??
    Object.values(supplyDetails).find((s) => String(s.id) === id);

  if (!medicine && !supply) {
    return (
      <div style={{ padding: 32 }}>
        해당 제품을 찾을 수 없습니다.
        <Button type="link" onClick={() => navigate("/hq/products")} style={{ marginLeft: 8 }}>
          목록으로
        </Button>
      </div>
    );
  }

  const BackLink = (
    <div style={{ marginBottom: 24 }}>
      <Text
        style={{ fontSize: 18, color: "#1890ff", cursor: "pointer", fontWeight: 600 }}
        onClick={() => navigate("/hq/products")}
      >
        ← 의약품 목록
      </Text>
    </div>
  );

  // 공통 스타일: 상세 강조
  const labelStyle: React.CSSProperties = {
    fontWeight: 600,
    color: "#555",
    width: 120,
  };
  const valueStyle: React.CSSProperties = {
    fontSize: 16,
    fontWeight: 600,
    color: "#1f1f1f",
  };
  const priceStyle: React.CSSProperties = {
    ...valueStyle,
    fontSize: 18,
  };

  // ---------- 의약소모품 상세 ----------
  if (supply) {
    return (
      <div style={{ padding: 32, maxWidth: 1100, margin: "0 auto" }}>
        {BackLink}

        <Card style={{ borderRadius: 12, padding: 24 }}>
          <Row gutter={32} align="middle">
            <Col xs={24} md={8}>
              <img
                src={supply.image}
                alt={supply.name}
                style={{ width: "100%", maxHeight: 260, objectFit: "contain" }}
              />
            </Col>

            {/* 우측 정보영역: 카테고리 Tag를 우상단에 고정하도록 relative 컨테이너 */}
            <Col xs={24} md={16} style={{ position: "relative", paddingTop: 4 }}>
              {/* 카테고리: 우상단 고정 */}
              <Tag
                color="geekblue"
                style={{ position: "absolute", top: 0, right: 0, fontSize: 13 }}
              >
                {supply.category}
              </Tag>

              {/* 상품명 */}
              <Title level={3} style={{ margin: 0, paddingRight: 96 }}>
                {supply.name}
              </Title>

              {/* 상세 강조 영역 */}
              <Descriptions
                column={1}
                style={{ marginTop: 16 }}
                labelStyle={labelStyle}
                contentStyle={valueStyle}
              >
                <Descriptions.Item label="제조사">
                  {supply.manufacturer}
                </Descriptions.Item>

                <Descriptions.Item label="가격">
                  <Text strong style={priceStyle}>
                    {supply.price.toLocaleString()}원
                  </Text>
                </Descriptions.Item>

                <Descriptions.Item label="수량 단위">{supply.unit}</Descriptions.Item>
                <Descriptions.Item label="등록일시">{supply.registeredAt}</Descriptions.Item>
              </Descriptions>

              {/* 버튼: 정보 영역 아래 오른쪽 정렬 */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
                <Button>장바구니 추가</Button>
                <Button>발주목록에 추가</Button>
              </div>
            </Col>
          </Row>

          {/* ⬇ 카드(하얀 박스) 내부 우하단으로 이동한 '제품 수정' 버튼 */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <Button
              type="primary"
              size="large"                       // 크기 조금 키움
              style={{ borderRadius: 24, padding: "0 20px" }}
              onClick={() => navigate(`/hq/products/${id}/edit`)}
            >
              제품 수정
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ---------- 의약품 상세 ----------
  const p = medicine!;
  return (
    <div style={{ padding: 32, maxWidth: 1100, margin: "0 auto" }}>
      {BackLink}

      <Card style={{ borderRadius: 12, padding: 24 }}>
        <Row gutter={32} align="middle">
          <Col xs={24} md={8}>
            <img
              src={p.image}
              alt={p.name}
              style={{ width: "100%", maxHeight: 260, objectFit: "contain" }}
            />
          </Col>

          {/* 우측 정보영역: 카테고리 Tag를 우상단에 고정 */}
          <Col xs={24} md={16} style={{ position: "relative", paddingTop: 4 }}>
            <Tag
              color="geekblue"
              style={{ position: "absolute", top: 0, right: 0, fontSize: 13 }}
            >
              {p.category}
            </Tag>

            <Title level={3} style={{ margin: 0, paddingRight: 96 }}>
              {p.name}
            </Title>

            <Descriptions
              column={1}
              style={{ marginTop: 16 }}
              labelStyle={labelStyle}
              contentStyle={valueStyle}
            >
              <Descriptions.Item label="제조사">{p.manufacturer}</Descriptions.Item>

              <Descriptions.Item label="가격">
                <Text strong style={priceStyle}>
                  {p.price.toLocaleString()}원
                </Text>
              </Descriptions.Item>

              <Descriptions.Item label="전문의약품 구분">{p.rxType}</Descriptions.Item>
              <Descriptions.Item label="식약처 분류">{p.mfdsClass}</Descriptions.Item>
              <Descriptions.Item label="수량 단위">{p.unit}</Descriptions.Item>
              <Descriptions.Item label="등록일시">{p.registeredAt}</Descriptions.Item>
            </Descriptions>

            {/* ‘제품 상세 설명’ 바로 위, 오른쪽 정렬된 버튼 2개 */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
              <Button>장바구니 추가</Button>
              <Button>발주목록에 추가</Button>
            </div>
          </Col>
        </Row>

        {/* 제품 상세 설명 구역 */}
        <Divider style={{ marginTop: 16 }} />
        <Title level={4} style={{ marginBottom: 12 }}>제품 상세 설명</Title>

        {Object.entries(p.details).map(([section, content]) => (
          <div key={section} style={{ marginBottom: 24 }}>
            <Title level={5} style={{ marginBottom: 8 }}>{section}</Title>
            <Paragraph style={{ whiteSpace: "pre-line", fontSize: 15, lineHeight: 1.75, margin: 0 }}>
              {content}
            </Paragraph>
          </div>
        ))}

        {/* ⬇ 카드(하얀 박스) 내부 우하단으로 이동한 '제품 수정' 버튼 */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
          <Button
            type="primary"
            size="large"                       // 크기 조금 키움
            style={{ borderRadius: 24, padding: "0 20px" }}
            onClick={() => navigate(`/hq/products/${id}/edit`)}
          >
            제품 수정
          </Button>
        </div>
      </Card>
    </div>
  );
}
