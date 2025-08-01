// src/pages/Common/Product/ProductDetailPage.tsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Typography,
  Row,
  Col,
  Tag,
  Divider,
  Descriptions,
  Popconfirm,
  message,
} from "antd";
import { productDetails, supplyDetails } from "../../../utils/productData";

const { Title, Text, Paragraph } = Typography;

export default function ProductDetailPage() {
  const { id: rawId } = useParams();
  const id = String(rawId ?? "");
  const navigate = useNavigate();

  // 현재 상세 대상
  const medicine = Object.values(productDetails).find((p: any) => String(p.id) === id);
  const supply = Object.values(supplyDetails).find((s: any) => String(s.id) === id);

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

  const labelStyle: React.CSSProperties = { fontWeight: 600, color: "#555", width: 120 };
  const valueStyle: React.CSSProperties = { fontSize: 16, fontWeight: 600, color: "#1f1f1f" };
  const priceStyle: React.CSSProperties = { ...valueStyle, fontSize: 18 };

  /** 공통: 삭제 핸들러 */
  const handleDeleteMedicine = (pid: string | number) => {
    // id 키로 바로 삭제(문자/숫자 모두 시도)
    // @ts-ignore
    delete productDetails[pid as any];
    // 혹시 키가 문자열로만 저장되어 있을 경우 대비
    const key = Object.keys(productDetails).find((k) => String(k) === String(pid));
    if (key) {
      // @ts-ignore
      delete productDetails[key];
    }
    message.success("제품을 삭제했습니다.");
    navigate("/hq/products");
  };

  const handleDeleteSupply = (sid: string | number) => {
    // @ts-ignore
    delete supplyDetails[sid as any];
    const key = Object.keys(supplyDetails).find((k) => String(k) === String(sid));
    if (key) {
      // @ts-ignore
      delete supplyDetails[key];
    }
    message.success("제품을 삭제했습니다.");
    navigate("/hq/products");
  };

  // ---------- 의약소모품 ----------
  if (supply) {
    const supplyDesc = (supply as any)?.details?.["제품 상세 설명"] as string | undefined;

    return (
      <div style={{ padding: 32, maxWidth: 1100, margin: "0 auto" }}>
        {BackLink}

        <Card style={{ borderRadius: 12, padding: 24 }}>
          <Row gutter={32} align="middle">
            <Col xs={24} md={8}>
              {supply.image ? (
                <img
                  src={supply.image}
                  alt={supply.name}
                  style={{ width: "100%", maxHeight: 260, objectFit: "contain" }}
                />
              ) : null}
            </Col>
            <Col xs={24} md={16} style={{ position: "relative", paddingTop: 4 }}>
              <Tag color="geekblue" style={{ position: "absolute", top: 0, right: 0 }}>
                {supply.category}
              </Tag>
              <Title level={3} style={{ margin: 0, paddingRight: 96 }}>
                {supply.name}
              </Title>
              <Descriptions column={1} style={{ marginTop: 16 }} labelStyle={labelStyle} contentStyle={valueStyle}>
                <Descriptions.Item label="제조사">{supply.manufacturer}</Descriptions.Item>
                <Descriptions.Item label="가격">
                  <Text strong style={priceStyle}>{supply.price.toLocaleString()}원</Text>
                </Descriptions.Item>
                <Descriptions.Item label="수량 단위">{supply.unit}</Descriptions.Item>
                <Descriptions.Item label="등록일시">{supply.registeredAt}</Descriptions.Item>
              </Descriptions>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
                <Button>장바구니 추가</Button>
                <Button>발주목록에 추가</Button>
              </div>
            </Col>
          </Row>

          {supplyDesc && (
            <>
              <Divider />
              <Title level={4}>제품 상세 설명</Title>
              <Paragraph style={{ whiteSpace: "pre-line", fontSize: 15 }}>{supplyDesc}</Paragraph>
            </>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
            {/* 🔴 삭제 버튼(확인 팝업) */}
            <Popconfirm
              title="제품을 삭제하겠습니까?"
              okText="예"
              cancelText="아니오"
              okButtonProps={{ danger: true }}
              onConfirm={() => handleDeleteSupply(supply.id)}
            >
              <Button danger>제품 삭제</Button>
            </Popconfirm>

            <Button
              type="primary"
              size="large"
              style={{ borderRadius: 24, padding: "0 20px" }}
              onClick={() => navigate(`/hq/products/${supply.id}/edit`)}
            >
              제품 수정
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ---------- 의약품 ----------
  const p = medicine!;
  return (
    <div style={{ padding: 32, maxWidth: 1100, margin: "0 auto" }}>
      {BackLink}

      <Card style={{ borderRadius: 12, padding: 24 }}>
        <Row gutter={32} align="middle">
          <Col xs={24} md={8}>
            {p.image ? (
              <img
                src={p.image}
                alt={p.name}
                style={{ width: "100%", maxHeight: 260, objectFit: "contain" }}
              />
            ) : null}
          </Col>
          <Col xs={24} md={16} style={{ position: "relative", paddingTop: 4 }}>
            <Tag color="geekblue" style={{ position: "absolute", top: 0, right: 0 }}>
              {p.category}
            </Tag>
            <Title level={3} style={{ margin: 0, paddingRight: 96 }}>
              {p.name}
            </Title>
            <Descriptions column={1} style={{ marginTop: 16 }} labelStyle={labelStyle} contentStyle={valueStyle}>
              <Descriptions.Item label="제조사">{p.manufacturer}</Descriptions.Item>
              <Descriptions.Item label="가격">
                <Text strong style={priceStyle}>{p.price.toLocaleString()}원</Text>
              </Descriptions.Item>
              <Descriptions.Item label="전문의약품 구분">{p.rxType}</Descriptions.Item>
              <Descriptions.Item label="식약처 분류">{p.mfdsClass}</Descriptions.Item>
              <Descriptions.Item label="수량 단위">{p.unit}</Descriptions.Item>
              <Descriptions.Item label="등록일시">{p.registeredAt}</Descriptions.Item>
            </Descriptions>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
              <Button>장바구니 추가</Button>
              <Button>발주목록에 추가</Button>
            </div>
          </Col>
        </Row>

        <Divider />
        <Title level={4}>제품 상세 설명</Title>
        {Object.entries(p.details).map(([section, content]) => (
          <div key={section} style={{ marginBottom: 24 }}>
            <Title level={5}>{section}</Title>
            <Paragraph style={{ whiteSpace: "pre-line", fontSize: 15 }}>{content as any}</Paragraph>
          </div>
        ))}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
          {/* 🔴 삭제 버튼(확인 팝업) */}
          <Popconfirm
            title="제품을 삭제하겠습니까?"
            okText="예"
            cancelText="아니오"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDeleteMedicine(p.id)}
          >
            <Button danger>제품 삭제</Button>
          </Popconfirm>

          <Button
            type="primary"
            size="large"
            style={{ borderRadius: 24, padding: "0 20px" }}
            onClick={() => navigate(`/hq/products/${p.id}/edit`)}
          >
            제품 수정
          </Button>
        </div>
      </Card>
    </div>
  );
}
