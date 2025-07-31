// src/pages/HQ/HqProductEditPage.tsx
import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Typography,
  Row,
  Col,
  Divider,
  message,
  Upload,
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import { PlusOutlined } from "@ant-design/icons";
import { productDetails, supplyDetails } from "../../utils/productData";

const { Title, Text } = Typography;
const { TextArea } = Input;

function getBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = (err) => reject(err);
  });
}

export default function HqProductEditPage() {
  const { id: rawId } = useParams();
  const id = String(rawId ?? "");
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // 편집 대상(의약품/의약소모품) 조회
  const medicine =
    productDetails[id] ??
    Object.values(productDetails).find((p: any) => String(p.id) === id);

  const supply =
    supplyDetails[id] ??
    Object.values(supplyDetails).find((s: any) => String(s.id) === id);

  const target: any = medicine ?? supply;
  const isMedicine = !!medicine;

  // 의약품은 details의 키를 그대로 폼 필드화
  const medicineDetailKeys = useMemo(() => {
    if (!isMedicine || !target) return [];
    return Object.keys(target.details || {});
  }, [isMedicine, target]);

  // 업로드(미리보기) 상태
  const [fileList, setFileList] = useState<UploadFile[]>(
    target?.image
      ? [{ uid: "-1", name: "image", status: "done", url: target.image }]
      : []
  );

  // 초기값
  const initialValues = useMemo(() => {
    if (!target) return {};
    const common = {
      name: target.name,
      manufacturer: target.manufacturer,
      price: target.price,
      unit: target.unit,
      registeredAt: target.registeredAt,
      category: target.category,
      image: target.image ?? "", // hidden 필드에 보관
    };

    if (isMedicine) {
      const detailFields: Record<string, string> = {};
      medicineDetailKeys.forEach((k) => {
        detailFields[`detail_${k}`] = target.details?.[k] ?? "";
        // 빈 키도 폼에 채워 UI에서 모두 보이게
      });
      return {
        ...common,
        rxType: target.rxType,
        mfdsClass: target.mfdsClass,
        ...detailFields,
      };
    }

    // ⬇ 의약소모품: 단일 텍스트 영역만 사용
    return {
      ...common,
      supplyDescription: target.details?.["제품 상세 설명"] ?? "",
    };
  }, [target, isMedicine, medicineDetailKeys]);

  if (!target) {
    return (
      <div style={{ padding: 32 }}>
        해당 제품을 찾을 수 없습니다.{" "}
        <Button type="link" onClick={() => navigate("/hq/products")}>
          목록으로
        </Button>
      </div>
    );
  }

  // 업로드 핸들러 (실제 업로드 없이 로컬에서 base64로 변환)
  const handleUploadChange = async (info: { file: UploadFile; fileList: UploadFile[] }) => {
    const { fileList: newList } = info;
    setFileList(newList);

    const first = newList[0];
    if (first?.originFileObj) {
      const base64 = await getBase64(first.originFileObj as File);
      form.setFieldsValue({ image: base64 });
    } else if (first?.url) {
      form.setFieldsValue({ image: first.url });
    } else {
      // ✅ 사용자가 "삭제"를 눌러 파일이 비면, 빈 문자열을 저장하도록 명시
      form.setFieldsValue({ image: "" });
    }
  };

  const onFinish = (values: any) => {
    try {
      // ✅ undefined일 때만 기존 값 사용, 빈 문자열("")이면 그대로 저장(즉, 이미지 제거)
      const imageToSave = values.image !== undefined ? values.image : target.image;

      const updated: any = {
        ...target,
        name: values.name,
        manufacturer: values.manufacturer,
        price: Number(values.price) || 0,
        unit: values.unit,
        registeredAt: values.registeredAt,
        category: values.category,
        image: imageToSave,
      };

      if (isMedicine) {
        // 의약품: 섹션별 details 재구성
        const nextDetails: Record<string, string> = {};
        Object.keys(values).forEach((k) => {
          if (k.startsWith("detail_")) {
            const key = k.replace("detail_", "");
            nextDetails[key] = values[k] ?? "";
          }
        });
        updated.rxType = values.rxType;
        updated.mfdsClass = values.mfdsClass;
        updated.details = nextDetails;

        // @ts-ignore - 데모 데이터 업데이트
        productDetails[updated.id] = updated;
      } else {
        // ⬇ 의약소모품: 단일 "제품 상세 설명"만 저장
        updated.details = { "제품 상세 설명": values.supplyDescription || "" };

        // @ts-ignore - 데모 데이터 업데이트
        supplyDetails[updated.id] = updated;
      }

      message.success("수정 사항을 저장했어요.");
      navigate(`/hq/products/${target.id}`);
    } catch (e) {
      message.error("저장 중 오류가 발생했어요.");
    }
  };

  return (
    <div style={{ padding: 32, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: 16 }}>
        <Text
          style={{ fontSize: 18, color: "#1890ff", cursor: "pointer", fontWeight: 600 }}
          onClick={() => navigate(`/hq/products/${target.id}`)}
        >
          ← 의약품 상세로
        </Text>
      </div>

      <Card style={{ borderRadius: 12, padding: 24 }}>
        <Row justify="space-between" align="middle">
          <Title level={3} style={{ margin: 0 }}>
            의약품 수정
          </Title>
          <Text type="secondary">ID: {target.id}</Text>
        </Row>

        <Divider />

        <Form form={form} layout="vertical" initialValues={initialValues} onFinish={onFinish}>
          <Row gutter={[24, 8]}>
            <Col xs={24} md={12}>
              <Form.Item
                label="제품명"
                name="name"
                rules={[{ required: true, message: "제품명을 입력하세요." }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="제조사"
                name="manufacturer"
                rules={[{ required: true, message: "제조사를 입력하세요." }]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="가격(원)"
                name="price"
                rules={[{ required: true, message: "가격을 입력하세요." }]}
              >
                <InputNumber min={0} style={{ width: "100%" }} placeholder="예: 6900" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="수량 단위"
                name="unit"
                rules={[{ required: true, message: "수량 단위를 입력하세요." }]}
              >
                <Input placeholder="예: 정, 팩, 박스" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="등록일시"
                name="registeredAt"
                rules={[{ required: true, message: "등록일시를 입력하세요." }]}
              >
                <Input placeholder="YYYY-MM-DD" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="카테고리"
                name="category"
                rules={[{ required: true, message: "카테고리를 입력하세요." }]}
              >
                <Input placeholder="예: 프로바이오틱스제 / 주사용품·주사기·주사침 등" />
              </Form.Item>
            </Col>

            {/* ⬇ 이미지 업로드(로컬 미리보기, 실제 업로드 없음) */}
            <Col xs={24} md={12}>
              <Form.Item label="이미지 업로드">
                <Upload
                  listType="picture-card"
                  fileList={fileList}
                  beforeUpload={() => false} // 실제 업로드 막고 로컬에서만 처리
                  onChange={handleUploadChange}
                  maxCount={1}
                >
                  {fileList.length >= 1 ? null : (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>업로드</div>
                    </div>
                  )}
                </Upload>
                {/* 저장에 사용할 hidden 필드 */}
                <Form.Item name="image" noStyle>
                  <Input type="hidden" />
                </Form.Item>
              </Form.Item>
            </Col>

            {/* 의약품 전용 필드 */}
            {isMedicine && (
              <>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="전문의약품 구분"
                    name="rxType"
                    rules={[{ required: true, message: "전문의약품 구분을 입력하세요." }]}
                  >
                    <Input placeholder="예: 일반의약품 / 전문의약품" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="식약처 분류"
                    name="mfdsClass"
                    rules={[{ required: true, message: "식약처 분류를 입력하세요." }]}
                  >
                    <Input placeholder="예: 프로바이오틱스제" />
                  </Form.Item>
                </Col>
              </>
            )}

            {/* 상세 설명 영역 */}
            <Col span={24}>
              <Divider />
              <Title level={4} style={{ marginBottom: 12 }}>
                제품 상세 설명
              </Title>
            </Col>

            {isMedicine ? (
              // 의약품: 섹션별 TextArea
              medicineDetailKeys.map((section) => (
                <Col span={24} key={section}>
                  <Form.Item label={section} name={`detail_${section}`}>
                    <TextArea rows={4} placeholder={`${section} 내용을 입력하세요.`} />
                  </Form.Item>
                </Col>
              ))
            ) : (
              // ⬇ 의약소모품: 단일 TextArea만 노출
              <Col span={24}>
                <Form.Item label="제품 상세 설명" name="supplyDescription">
                  <TextArea rows={6} placeholder="제품 상세 설명을 입력하세요." />
                </Form.Item>
              </Col>
            )}
          </Row>

          {/* 하단 버튼 */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
            <Button onClick={() => navigate(`/hq/products/${target.id}`)}>취소</Button>
            <Button type="primary" htmlType="submit">
              저장
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
