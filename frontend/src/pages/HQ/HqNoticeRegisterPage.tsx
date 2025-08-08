import { LeftOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import {
  Button,
  Flex,
  Form,
  Input,
  message,
  Select,
  Space,
  Typography,
  Upload,
  Modal,
} from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TiptapEditor from '../../components/TiptapEditor';
import { instance } from '../../api/api';

export default function HqNoticeRegisterPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [isEdited, setIsEdited] = useState(false);

  const watchedType = Form.useWatch('type', form);
  const watchedContent = Form.useWatch('content', form);

  // 수정 여부 감지
  useEffect(() => {
    if (!isEdited && (watchedType || watchedContent)) {
      setIsEdited(true);
    }
  }, [watchedType, watchedContent, isEdited]);

  // 첨부파일 업로드 상태 관리
  const handleChange: UploadProps['onChange'] = ({ fileList }) => {
    setFileList(fileList);
    form.setFieldValue('attachmentUrl', fileList[0]?.name || '');
  };

  // AI 요약 호출
  const aiUrlMap: Record<string, string> = {
  EPIDEMIC: 'http://localhost:5002/summarize-epidemic',
  LAW: 'http://localhost:5000/summarize-law',
  NEW_PRODUCT: 'http://localhost:5001/summarize-pdf',
};

// 함수는 단 한 번만 아래처럼 작성
const handleAiSummarize = async () => {
  if (fileList.length === 0 || !fileList[0].originFileObj) {
    messageApi.warning('첨부 파일이 없습니다.');
    return;
  }

  const endpoint = aiUrlMap[watchedType];
  if (!endpoint) {
    messageApi.warning('AI 요약이 지원되지 않는 유형입니다.');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('file', fileList[0].originFileObj as File);

    const res = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    const result = await res.json();

    if (result.summary) {
      form.setFieldsValue({ content: result.summary });
      messageApi.success('AI가 문서를 요약했습니다.');
    } else {
      throw new Error(result.error || '요약 결과가 없습니다.');
    }
  } catch (e: any) {
    console.error('문서 요약 실패:', e);
    messageApi.error(e.message || '문서 요약 중 오류가 발생했습니다.');
  }
};

  // 공지사항 등록 API 호출
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        type: values.type,
        title: values.title,
        content: values.content,
        attachmentUrl: values.attachmentUrl || '',
      };

      console.log('[📤 전송 payload]', payload);

      const res = await instance.post('/announcements', payload);

      console.log('[📥 서버 응답]', res.data);

      if (res.data.success && res.data.data?.announcementId) {
        messageApi.success('공지사항이 등록되었습니다.');
        const id = res.data.data.announcementId;
        navigate(`/hq/notices/${id}`);
      } else {
        messageApi.error('공지사항 등록 후 ID를 가져오는 데 실패했습니다.');
      }
    } catch (e: any) {
      console.error('공지사항 등록 실패:', e);
      messageApi.error(
        e?.response?.data?.message || e?.message || '공지사항 등록 중 오류가 발생했습니다.'
      );
    }
  };

  // 뒤로가기 시 confirm
  const handleBack = () => {
    if (isEdited) {
      Modal.confirm({
        title: '페이지를 나가시겠습니까?',
        content: '작성 중인 내용이 사라집니다.',
        okText: '나가기',
        cancelText: '취소',
        onOk: () => navigate(-1),
      });
    } else {
      navigate(-1);
    }
  };

  return (
    <>
      {contextHolder}
      <Space size="large" align="baseline">
        <Button
          type="link"
          size="large"
          shape="circle"
          icon={<LeftOutlined />}
          onClick={handleBack}
        />
        <Typography.Title level={3} style={{ marginBottom: '24px' }}>
          공지사항 작성
        </Typography.Title>
      </Space>

      <Form
        form={form}
        name="notice-register"
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Flex gap={8}>
          <Form.Item
            name="type"
            label="카테고리"
            rules={[{ required: true, message: '카테고리를 선택해주세요.' }]}
            style={{ flex: 1 }}
          >
            <Select
              placeholder="카테고리 선택"
              options={[
                { value: 'NOTICE', label: '공지' },
                { value: 'EPIDEMIC', label: '감염병' },
                { value: 'LAW', label: '법령' },
                { value: 'NEW_PRODUCT', label: '신제품' },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="title"
            label="제목"
            rules={[{ required: true, message: '제목을 입력해주세요.' }]}
          >
            <Input />
          </Form.Item>
        </Flex>

        <Form.Item
          name="content"
          label="내용"
          rules={[{ required: true, message: '내용을 입력해주세요.' }]}
        >
          <TiptapEditor
            value={watchedContent}
            onChange={(val: string) => form.setFieldValue('content', val)}
          />
        </Form.Item>

        <Flex wrap justify="space-between" gap={8}>
          <Space wrap align="baseline">
            <Form.Item name="attachmentUrl" noStyle>
              <Input type="hidden" />
            </Form.Item>

            <Upload
              accept=".pdf,.txt"
              listType="text"
              fileList={fileList}
              beforeUpload={() => false}
              onChange={handleChange}
              maxCount={1}
            >
              {fileList.length >= 1 ? null : (
                <Button type="default" icon={<UploadOutlined />}>
                  첨부파일
                </Button>
              )}
            </Upload>

            <Button
              type="primary"
              disabled={watchedType === 'NOTICE'}
              onClick={handleAiSummarize}
            >
              AI 요약
            </Button>
          </Space>

          <Button type="primary" htmlType="submit">
            등록
          </Button>
        </Flex>
      </Form>
    </>
  );
}
