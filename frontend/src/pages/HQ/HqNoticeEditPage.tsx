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
import { useNavigate, useParams } from 'react-router-dom';
import TiptapEditor from '../../components/TiptapEditor';
import { instance } from '../../api/api';
import type { Announcement } from '../../types/announcement.type';

export default function HqNoticeEditPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const { id } = useParams();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEdited, setIsEdited] = useState(false);

  const watchedType = Form.useWatch('type', form);
  const watchedContent = Form.useWatch('content', form);

  // 공지사항 로드
  const fetchNotice = async () => {
    setLoading(true);
    try {
      const res = await instance.get(`/announcements/${id}`);
      if (res.data.success) {
        const notice: Announcement = res.data.data;
        form.setFieldsValue({
          type: notice.type,
          title: notice.title,
          content: notice.content,
          attachmentUrl: notice.attachmentUrl || '',
        });

        if (notice.attachmentUrl) {
          setFileList([
            {
              uid: '-1',
              name: notice.attachmentUrl.split('/').pop() || '첨부파일',
              status: 'done',
              url: notice.attachmentUrl,
            },
          ]);
        }
      } else {
        messageApi.error('공지사항 정보를 불러오지 못했습니다.');
      }
    } catch (e: any) {
      console.error('공지사항 로딩 실패:', e);
      messageApi.error(e.message || '공지사항 로딩 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotice();
  }, [id]);

  // 수정 감지
  useEffect(() => {
    if (!isEdited && (watchedType || watchedContent)) {
      setIsEdited(true);
    }
  }, [watchedType, watchedContent, isEdited]);

  // 첨부파일 변경 처리
  const handleChange: UploadProps['onChange'] = ({ fileList }) => {
    setFileList(fileList);
    form.setFieldValue('attachmentUrl', fileList[0]?.name || '');
  };

  // AI 요약 호출
  const handleAiSummarize = async () => {
    if (fileList.length === 0 || !fileList[0].originFileObj) {
      messageApi.warning('첨부 파일이 없습니다.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', fileList[0].originFileObj as File);

      const res = await instance.post(`/ai/summarize/${watchedType.toLowerCase()}`, formData);
      form.setFieldsValue({ content: res.data.summary });
      messageApi.success('AI가 문서를 요약했습니다.');
    } catch (e: any) {
      console.error('문서 요약 실패:', e);
      messageApi.error(e.message || '문서 요약 중 오류가 발생했습니다.');
    }
  };

  // 수정 제출
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        type: values.type,
        title: values.title,
        content: values.content,
        attachmentUrl: values.attachmentUrl || '',
      };

      const res = await instance.patch(`/announcements/${id}`, payload);
      if (res.data.success) {
        messageApi.success('공지사항이 수정되었습니다.');
        navigate(`/hq/notices/${id}`);
      } else {
        messageApi.error('공지사항 수정에 실패했습니다.');
      }
    } catch (e: any) {
      console.error('공지사항 수정 실패:', e);
      messageApi.error(e.message || '공지사항 수정 중 오류가 발생했습니다.');
    }
  };

  // 뒤로가기 확인
  const handleBack = () => {
    if (isEdited) {
      Modal.confirm({
        title: '페이지를 나가시겠습니까?',
        content: '수정 중인 내용이 사라집니다.',
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
          공지사항 수정
        </Typography.Title>
      </Space>

      <Form
        form={form}
        name="notice-edit"
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
            style={{ flex: 5 }}
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
              accept=".pdf, .txt"
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
            저장
          </Button>
        </Flex>
      </Form>
    </>
  );
}
