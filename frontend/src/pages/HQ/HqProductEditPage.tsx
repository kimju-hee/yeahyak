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
  Select,
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import { PlusOutlined } from "@ant-design/icons";
import { productDetails, supplyDetails } from "../../utils/productData";

const { Title, Text } = Typography;
const { TextArea } = Input;

/** 의약품(상단 탭)의 카테고리 */
const CATEGORY_OPTIONS = ["주사제", "백신", "흡입제", "내복제", "외용제", "기타"] as const;
/** 의약소모품의 카테고리 */
const SUPPLY_CATEGORY_OPTIONS = [
  "주사용품/주사기/주사침",
  "거즈/탈지면/붕대/솜/면봉",
  "반창고/밴드/부직/테이프드레싱",
  "소독/세척",
  "봉합사/봉합침",
  "마스크/모자/장갑",
  "진단키트",
] as const;

/** 의약품 전용 옵션 */
const RX_TYPE_OPTIONS = ["일반의약품", "전문의약품"] as const;
const MFDS_OPTIONS = [
  "프로바이오틱스제",
  "소화효소제",
  "소화기계용제",
  "제산제",
  "해열제",
  "진해거담제",
  "항히스타민제",
  "진통제",
  "지사제",
  "진경제",
  "기타",
] as const;

/** 수량 단위 + 직접입력 공통 */
const UNIT_OPTIONS = ["정", "캡슐", "팩", "박스", "EA", "앰플", "바이알", "튜브", "병", "개"] as const;
const UNIT_CUSTOM_VALUE = "__UNIT_CUSTOM__";
const MFDS_CUSTOM_VALUE = "__MFDS_CUSTOM__";

// 이미지 파일을 base64 데이터로 변환
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
    (productDetails as any)[id] ??
    Object.values(productDetails).find((p: any) => String(p.id) === id);

  const supply =
    (supplyDetails as any)[id] ??
    Object.values(supplyDetails).find((s: any) => String(s.id) === id);

  const target: any = medicine ?? supply;
  const isMedicine = !!medicine;

  // 의약품 상세 키
  const medicineDetailKeys = useMemo(() => {
    if (!isMedicine || !target) return [];
    return Object.keys(target.details || {});
  }, [isMedicine, target]);

  // 업로드(미리보기) 상태
  const [fileList, setFileList] = useState<UploadFile[]>(
    target?.image ? [{ uid: "-1", name: "image", status: "done", url: target.image }] : []
  );

  // 초기값 구성
  const initialValues = useMemo(() => {
    if (!target) return {};

    // 수량단위: 옵션에 없으면 "직접입력" 모드
    const unitIsCustom = !!target.unit && !UNIT_OPTIONS.includes(target.unit);

    const common: any = {
      name: target.name,
      manufacturer: target.manufacturer,
      price: target.price,
      registeredAt: target.registeredAt,
      image: target.image ?? "",
      // 수량 단위(의약품/소모품 모두 동일 UI 사용)
      unitSelect: unitIsCustom ? UNIT_CUSTOM_VALUE : target.unit,
      unitCustom: unitIsCustom ? target.unit : undefined,
      // 카테고리
      category: target.category,
    };

    if (isMedicine) {
      const detailFields: Record<string, string> = {};
      medicineDetailKeys.forEach((k) => {
        detailFields[`detail_${k}`] = target.details?.[k] ?? "";
      });
      // 식약처 분류 초기값
      const mfdsIsCustom = !!target.mfdsClass && !MFDS_OPTIONS.includes(target.mfdsClass);
      return {
        ...common,
        rxType: target.rxType,
        mfdsSelect: mfdsIsCustom ? MFDS_CUSTOM_VALUE : target.mfdsClass,
        mfdsCustom: mfdsIsCustom ? target.mfdsClass : undefined,
        ...detailFields,
      };
    }

    // 의약소모품: 상세 설명 1개 필드
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

  // 이미지 업로드 핸들러
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
      // 삭제한 경우
      form.setFieldsValue({ image: "" });
    }
  };

  const onFinish = (values: any) => {
    try {
      // 이미지: undefined면 기존 유지, ""면 삭제
      const imageToSave = values.image !== undefined ? values.image : target.image;

      // 수량 단위(의약품/소모품 공통) 선택/직접입력 처리
      const unitToSave =
        values.unitSelect === UNIT_CUSTOM_VALUE
          ? (values.unitCustom ?? "").trim()
          : values.unitSelect;

      const updated: any = {
        ...target,
        name: values.name,
        manufacturer: values.manufacturer,
        price: Number(values.price) || 0,
        unit: unitToSave,
        registeredAt: values.registeredAt,
        category: values.category, // 선택한 카테고리 저장 → 목록에서 자동 분류
        image: imageToSave,
      };

      if (isMedicine) {
        // 식약처 분류(선택/직접입력)
        const mfdsToSave =
          values.mfdsSelect === MFDS_CUSTOM_VALUE
            ? (values.mfdsCustom ?? "").trim()
            : values.mfdsSelect;

        // 상세 설명
        const nextDetails: Record<string, string> = {};
        Object.keys(values).forEach((k) => {
          if (k.startsWith("detail_")) {
            const key = k.replace("detail_", "");
            nextDetails[key] = values[k] ?? "";
          }
        });

        updated.rxType = values.rxType;
        updated.mfdsClass = mfdsToSave;
        updated.details = nextDetails;

        (productDetails as any)[updated.id] = updated; // 저장
      } else {
        // 의약소모품
        updated.details = { "제품 상세 설명": values.supplyDescription || "" };
        (supplyDetails as any)[updated.id] = updated; // 저장
      }

      message.success("수정 사항을 저장했어요.");
      navigate(`/hq/products/${target.id}`);
    } catch (e) {
      console.error(e);
      message.error("저장 중 오류가 발생했어요.");
    }
  };

  // ‘직접입력’이 선택되었을 때만 필수로 만드는 유효성
  const requireIfCustom = (depName: string, customValue: string, messageText: string) => ({
    validator(_: any, value: any) {
      const dep = form.getFieldValue(depName);
      if (dep === customValue && (!value || !String(value).trim())) {
        return Promise.reject(new Error(messageText));
      }
      return Promise.resolve();
    },
  });

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

            {/* 수량 단위 (의약품/소모품 공통 – 드롭다운 + 직접입력) */}
            <Col xs={24} md={8}>
              <Form.Item
                label="수량 단위"
                name="unitSelect"
                rules={[{ required: true, message: "수량 단위를 선택하세요." }]}
              >
                <Select placeholder="수량 단위 선택">
                  {UNIT_OPTIONS.map((opt) => (
                    <Select.Option key={opt} value={opt}>
                      {opt}
                    </Select.Option>
                  ))}
                  <Select.Option value={UNIT_CUSTOM_VALUE}>직접 입력</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="수량 단위(직접 입력)"
                name="unitCustom"
                rules={[requireIfCustom("unitSelect", UNIT_CUSTOM_VALUE, "수량 단위를 입력하세요.")]}
              >
                <Input placeholder="예: 포, 시럽병 등" />
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

            {/* 카테고리 */}
            {isMedicine ? (
              <Col xs={24} md={12}>
                <Form.Item
                  label="카테고리"
                  name="category"
                  rules={[{ required: true, message: "카테고리를 선택하세요." }]}
                >
                  <Select placeholder="카테고리 선택">
                    {CATEGORY_OPTIONS.map((opt) => (
                      <Select.Option key={opt} value={opt}>
                        {opt}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            ) : (
              <Col xs={24} md={12}>
                <Form.Item
                  label="카테고리"
                  name="category"
                  rules={[{ required: true, message: "카테고리를 선택하세요." }]}
                >
                  <Select placeholder="카테고리 선택">
                    {SUPPLY_CATEGORY_OPTIONS.map((opt) => (
                      <Select.Option key={opt} value={opt}>
                        {opt}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            )}

            {/* 이미지 업로드 */}
            <Col xs={24} md={12}>
              <Form.Item label="이미지 업로드">
                <Upload
                  listType="picture-card"
                  fileList={fileList}
                  beforeUpload={() => false}
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
                    rules={[{ required: true, message: "전문의약품 구분을 선택하세요." }]}
                  >
                    <Select placeholder="선택">
                      {RX_TYPE_OPTIONS.map((opt) => (
                        <Select.Option key={opt} value={opt}>
                          {opt}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label="식약처 분류"
                    name="mfdsSelect"
                    rules={[{ required: true, message: "식약처 분류를 선택하세요." }]}
                  >
                    <Select placeholder="선택">
                      {MFDS_OPTIONS.map((opt) => (
                        <Select.Option key={opt} value={opt}>
                          {opt}
                        </Select.Option>
                      ))}
                      <Select.Option value={MFDS_CUSTOM_VALUE}>직접 입력</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label="식약처 분류(직접 입력)"
                    name="mfdsCustom"
                    rules={[requireIfCustom("mfdsSelect", MFDS_CUSTOM_VALUE, "식약처 분류를 입력하세요.")]}
                  >
                    <Input placeholder="예: 사용자가 직접 입력" />
                  </Form.Item>
                </Col>
              </>
            )}

            {/* 상세 설명 */}
            <Col span={24}>
              <Divider />
              <Title level={4} style={{ marginBottom: 12 }}>
                제품 상세 설명
              </Title>
            </Col>

            {isMedicine ? (
              medicineDetailKeys.map((section) => (
                <Col span={24} key={section}>
                  <Form.Item label={section} name={`detail_${section}`}>
                    <TextArea rows={4} placeholder={`${section} 내용을 입력하세요.`} />
                  </Form.Item>
                </Col>
              ))
            ) : (
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
