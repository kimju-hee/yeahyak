// src/pages/HQ/HqProductRegisterPage.tsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  message,
  Row,
  Typography,
  Upload,
  Select,
  Tabs,
} from "antd";
import type { UploadFile, UploadProps } from "antd/es/upload/interface";
import { InboxOutlined, PlusOutlined } from "@ant-design/icons";
import { productDetails, supplyDetails } from "../../utils/productData";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;
const { TabPane } = Tabs;

/** 파일 → base64 (미리보기/데모 저장용) */
function getBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = (err) => reject(err);
  });
}

/** 공통 드롭다운 옵션들 */
const DRUG_CATEGORY_OPTIONS = ["주사제", "백신", "흡입제", "내복제", "외용제", "기타"];
const SUPPLY_CATEGORY_OPTIONS = [
  "주사용품/주사기/주사침",
  "거즈/탈지면/붕대/솜/면봉",
  "반창고/밴드/부직/테이프드레싱",
  "소독/세척",
  "봉합사/봉합침",
  "마스크/모자/장갑",
  "진단키트",
];

const RX_TYPE_OPTIONS = ["일반의약품", "전문의약품"];

/** 식약처 분류(의약품) + 직접입력 */
const MFDS_OPTIONS = [
  "프로바이오틱스제",
  "소화효소제",
  "소화기계용제",
  "해열제",
  "진해거담제",
  "항히스타민제",
  "진통제",
  "비타민제",
  "무기질제",
  "소화성궤양용제",
  "해독제",
  "기타",
];

/** 수량 단위(공통) + 직접입력 */
const UNIT_OPTIONS = ["정", "캡슐", "포", "병", "팩", "박스", "EA", "mL", "g"];

/** ‘직접 입력’ 선택 값을 나타내는 토큰 */
const CUSTOM_VALUE = "__custom__";

type RegisterType = "의약품" | "의약소모품";

export default function HqProductRegisterPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  /** 상단 탭: 의약품/의약소모품 */
  const [registerType, setRegisterType] = useState<RegisterType>("의약품");

  // 이미지 / PDF 업로드 상태(데모)
  const [imageList, setImageList] = useState<UploadFile[]>([]);
  const [pdfList, setPdfList] = useState<UploadFile[]>([]);

  // 오늘(YYYY-MM-DD) — 등록일시는 입력 없이 이 값으로 저장
  const todayStr = useMemo(() => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${mm}-${dd}`;
  }, []);

  // 이미지 업로드 변경
  const handleImageChange: UploadProps["onChange"] = async ({ fileList }) => {
    setImageList(fileList);
    const first = fileList[0];

    if (!first) {
      form.setFieldsValue({ image: "" });
      return;
    }
    if (first.originFileObj) {
      const base64 = await getBase64(first.originFileObj as File);
      form.setFieldsValue({ image: base64 });
    } else if (first.url) {
      form.setFieldsValue({ image: first.url });
    }
  };

  // PDF 업로드(데모)
  const handlePdfChange: UploadProps["onChange"] = ({ fileList }) => {
    setPdfList(fileList.slice(-1)); // 1개만
  };

  // PDF 요약(데모)
  const handleSummarizeDemo = () => {
    if (pdfList.length === 0) {
      message.info("PDF 파일을 먼저 업로드해 주세요.");
      return;
    }
    form.setFieldsValue({
      detail_성분정보: "PDF 요약(데모) - 성분정보",
      detail_효능효과: "PDF 요약(데모) - 효능효과",
      detail_용법용량: "PDF 요약(데모) - 용법용량",
      detail_저장방법: "PDF 요약(데모) - 저장방법",
    });
    message.success("PDF 내용을 기반으로 요약(데모)을 채웠습니다.");
  };

  // 신규 ID (의약품/소모품 각각 별도 증가)
  const nextDrugId = useMemo(() => {
    const ids = Object.values(productDetails)
      .map((p: any) => Number(p.id))
      .filter((n) => !Number.isNaN(n));
    return (ids.length ? Math.max(...ids) : 0) + 1;
  }, []);
  const nextSupplyId = useMemo(() => {
    const ids = Object.values(supplyDetails)
      .map((s: any) => Number(s.id))
      .filter((n) => !Number.isNaN(n));
    return (ids.length ? Math.max(...ids) : 0) + 1;
  }, []);

  /** 저장 */
  const onFinish = (values: any) => {
    try {
      const registeredAt = todayStr;

      // 공통: 수량 단위 (드롭다운 + 직접입력)
      const unit =
        values.unitSelect === CUSTOM_VALUE
          ? (values.unitCustom || "").trim()
          : values.unitSelect;

      if (!unit) {
        message.error("수량 단위를 선택하거나 직접 입력해 주세요.");
        return;
      }

      // 공통: 이미지
      const image = values.image || "";

      if (registerType === "의약품") {
        // 의약품 전용: 식약처 분류(드롭다운 + 직접입력), 전문의약품 구분
        const mfdsClass =
          values.mfdsClassSelect === CUSTOM_VALUE
            ? (values.mfdsClassCustom || "").trim()
            : values.mfdsClassSelect;
        if (!mfdsClass) {
          message.error("식약처 분류를 선택하거나 직접 입력해 주세요.");
          return;
        }
        const details: Record<string, string> = {
          성분정보: values.detail_성분정보 || "",
          효능효과: values.detail_효능효과 || "",
          용법용량: values.detail_용법용량 || "",
          저장방법: values.detail_저장방법 || "",
        };

        const newDrug: any = {
          id: nextDrugId,
          name: values.name,
          manufacturer: values.manufacturer,
          price: Number(values.price) || 0,
          unit,
          registeredAt,
          category: values.drugCategory, // 의약품 카테고리
          image,
          rxType: values.rxType,
          mfdsClass,
          details,
        };

        // 데모 스토어 저장
        // @ts-ignore
        productDetails[newDrug.id] = newDrug;

        message.success("의약품이 등록되었습니다.");
        navigate(`/hq/products/${newDrug.id}`);
        return;
      }

      // 의약소모품
      const newSupply: any = {
        id: nextSupplyId,
        name: values.name,
        manufacturer: values.manufacturer,
        price: Number(values.price) || 0,
        unit,
        registeredAt,
        category: values.supplyCategory, // 소모품 카테고리
        image,
        details: { "제품 상세 설명": values.supplyDescription || "" },
      };
      // @ts-ignore
      supplyDetails[newSupply.id] = newSupply;

      message.success("의약소모품이 등록되었습니다.");
      navigate(`/hq/products/${newSupply.id}`);
    } catch (e) {
      console.error(e);
      message.error("등록 중 오류가 발생했습니다.");
    }
  };

  /** 탭 변경 시 폼 리셋 */
  const handleTabChange = (key: string) => {
    setRegisterType(key as RegisterType);
    form.resetFields();
    setImageList([]);
    setPdfList([]);
  };

  return (
    <div style={{ padding: 32, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: 16 }}>
        <Text
          style={{ fontSize: 18, color: "#1890ff", cursor: "pointer", fontWeight: 600 }}
          onClick={() => navigate("/hq/products")}
        >
          ← 의약품 목록
        </Text>
      </div>

      <Card style={{ borderRadius: 12, padding: 24 }}>
        <Row justify="space-between" align="middle">
          <Title level={3} style={{ margin: 0 }}>
            {registerType === "의약품" ? "의약품 등록" : "의약소모품 등록"}
          </Title>
          {/* 등록일시는 todayStr로 자동 저장 */}
        </Row>

        <Divider />

        {/* 상단 탭: 의약품 / 의약소모품 */}
        <Tabs
          activeKey={registerType}
          onChange={handleTabChange}
          style={{ marginBottom: 8 }}
        >
          <TabPane tab="의약품" key="의약품" />
          <TabPane tab="의약소모품" key="의약소모품" />
        </Tabs>

        <Form
          form={form}
          layout="vertical"
          initialValues={{
            // 공통
            name: "",
            manufacturer: "",
            price: 0,
            unitSelect: undefined,
            unitCustom: "",
            image: "",
            // 의약품
            drugCategory: undefined,
            rxType: undefined,
            mfdsClassSelect: undefined,
            mfdsClassCustom: "",
            detail_성분정보: "",
            detail_효능효과: "",
            detail_용법용량: "",
            detail_저장방법: "",
            // 소모품
            supplyCategory: undefined,
            supplyDescription: "",
          }}
          onFinish={onFinish}
        >
          <Row gutter={[24, 8]}>
            {/* 공통: 제품명 / 제조사 / 가격 */}
            <Col xs={24} md={12}>
              <Form.Item
                label="제품명"
                name="name"
                rules={[{ required: true, message: "제품명을 입력하세요." }]}
              >
                <Input placeholder="예: 훼스탈플러스정 / 일회용주사기 20ml" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="제조사"
                name="manufacturer"
                rules={[{ required: true, message: "제조사를 입력하세요." }]}
              >
                <Input placeholder="예: 한독 / 종근당" />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="가격(원)"
                name="price"
                rules={[{ required: true, message: "가격을 입력하세요." }]}
              >
                <InputNumber min={0} style={{ width: "100%" }} placeholder="예: 7600" />
              </Form.Item>
            </Col>

            {/* 공통: 수량 단위 (드롭다운 + 직접입력) */}
            <Col xs={24} md={8}>
              <Form.Item
                label="수량 단위"
                name="unitSelect"
                rules={[{ required: true, message: "수량 단위를 선택하거나 직접 입력하세요." }]}
              >
                <Select placeholder="수량 단위 선택">
                  {UNIT_OPTIONS.map((opt) => (
                    <Select.Option key={opt} value={opt}>
                      {opt}
                    </Select.Option>
                  ))}
                  <Select.Option value={CUSTOM_VALUE}>직접 입력</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                noStyle
                shouldUpdate={(prev, cur) => prev.unitSelect !== cur.unitSelect}
              >
                {({ getFieldValue }) =>
                  getFieldValue("unitSelect") === CUSTOM_VALUE ? (
                    <Form.Item
                      name="unitCustom"
                      rules={[{ required: true, message: "수량 단위를 직접 입력하세요." }]}
                    >
                      <Input placeholder="예: 파우치, 스틱, T 등" />
                    </Form.Item>
                  ) : null
                }
              </Form.Item>
            </Col>

            {/* 카테고리: 의약품 / 의약소모품 별도 */}
            {registerType === "의약품" ? (
              <Col xs={24} md={8}>
                <Form.Item
                  label="카테고리"
                  name="drugCategory"
                  rules={[{ required: true, message: "카테고리를 선택하세요." }]}
                >
                  <Select placeholder="카테고리 선택">
                    {DRUG_CATEGORY_OPTIONS.map((opt) => (
                      <Select.Option key={opt} value={opt}>
                        {opt}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            ) : (
              <Col xs={24} md={8}>
                <Form.Item
                  label="카테고리"
                  name="supplyCategory"
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

            {/* 공통: 이미지 업로드 */}
            <Col xs={24} md={12}>
              <Form.Item label="제품 이미지 등록">
                <Upload
                  listType="picture-card"
                  fileList={imageList}
                  beforeUpload={() => false}
                  onChange={handleImageChange}
                  maxCount={1}
                >
                  {imageList.length >= 1 ? null : (
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

            {/* ===== 의약품 전용 필드 ===== */}
            {registerType === "의약품" && (
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
                    name="mfdsClassSelect"
                    rules={[{ required: true, message: "식약처 분류를 선택하거나 직접 입력하세요." }]}
                  >
                    <Select placeholder="선택">
                      {MFDS_OPTIONS.map((opt) => (
                        <Select.Option key={opt} value={opt}>
                          {opt}
                        </Select.Option>
                      ))}
                      <Select.Option value={CUSTOM_VALUE}>직접 입력</Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    noStyle
                    shouldUpdate={(prev, cur) =>
                      prev.mfdsClassSelect !== cur.mfdsClassSelect
                    }
                  >
                    {({ getFieldValue }) =>
                      getFieldValue("mfdsClassSelect") === CUSTOM_VALUE ? (
                        <Form.Item
                          name="mfdsClassCustom"
                          rules={[{ required: true, message: "식약처 분류를 직접 입력하세요." }]}
                        >
                          <Input placeholder="예: 해열진통소염제, 순환기계용제 등" />
                        </Form.Item>
                      ) : null
                    }
                  </Form.Item>
                </Col>

                {/* 제품 상세 설명(4개 섹션) */}
                <Col span={24}>
                  <Divider />
                  <Title level={4} style={{ marginBottom: 12 }}>
                    제품 상세 설명
                  </Title>
                </Col>
                <Col span={24}>
                  <Form.Item label="성분정보" name="detail_성분정보">
                    <TextArea rows={4} placeholder="성분정보 내용을 입력하세요." />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="효능효과" name="detail_효능효과">
                    <TextArea rows={4} placeholder="효능효과 내용을 입력하세요." />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="용법용량" name="detail_용법용량">
                    <TextArea rows={4} placeholder="용법용량 내용을 입력하세요." />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="저장방법" name="detail_저장방법">
                    <TextArea rows={4} placeholder="저장방법 내용을 입력하세요." />
                  </Form.Item>
                </Col>

                {/* 의약품: PDF 업로드 + 요약(데모) */}
                <Divider />
                <Title level={5} style={{ marginBottom: 12 }}>
                  의약품 설명서 PDF 업로드
                </Title>
                <Dragger
                  accept=".pdf"
                  multiple={false}
                  beforeUpload={() => false}
                  fileList={pdfList}
                  onChange={handlePdfChange}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">
                    여기에 PDF를 드래그하거나 클릭하여 업로드하세요.
                  </p>
                  <p className="ant-upload-hint">한 번에 1개 파일만 업로드됩니다.</p>
                </Dragger>
              </>
            )}

            {/* ===== 의약소모품 전용 필드 ===== */}
            {registerType === "의약소모품" && (
              <>
                <Col span={24}>
                  <Divider />
                  <Title level={4} style={{ marginBottom: 12 }}>
                    제품 상세 설명
                  </Title>
                </Col>
                <Col span={24}>
                  <Form.Item label="제품 상세 설명" name="supplyDescription">
                    <TextArea rows={6} placeholder="제품 상세 설명을 입력하세요." />
                  </Form.Item>
                </Col>
              </>
            )}
          </Row>

          {/* 하단 버튼 */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 8,
              marginTop: 16,
            }}
          >
            <Button onClick={() => navigate("/hq/products")}>취소</Button>

            <div style={{ display: "flex", gap: 8 }}>
              {registerType === "의약품" && (
                <Button onClick={handleSummarizeDemo}>약품 설명 요약하기(데모)</Button>
              )}
              <Button type="primary" htmlType="submit">
                등록
              </Button>
            </div>
          </div>
        </Form>
      </Card>
    </div>
  );
}
