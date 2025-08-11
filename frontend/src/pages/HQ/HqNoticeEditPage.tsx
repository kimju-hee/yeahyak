import { LeftOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { Button, Flex, Form, Input, message, Modal, Select, Space, Typography, Upload } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { aiInstance, instance } from '../../api/api';
import TiptapEditor from '../../components/TiptapEditor';
import {
  ANNOUNCEMENT_TYPE,
  type Announcement,
  type AnnouncementRequest,
} from '../../types/announcement.type';

export default function HqNoticeEditPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();
  const { id } = useParams();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [isEdited, setIsEdited] = useState(false);

  const watchedType = Form.useWatch('type', form);
  const watchedContent = Form.useWatch('content', form);

  const fetchNotice = async () => {
    setLoading(true);
    try {
      const res = await instance.get(`/announcements/${id}`);
      // LOG: 테스트용 로그
      console.log('✨ 공지사항 상세 로딩:', res.data);
      if (res.data.success) {
        const notice: Announcement = res.data.data[0];
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
      }
    } catch (e: any) {
      console.error('공지사항 상세 로딩 실패:', e);
      messageApi.error(e.message || '공지사항 로딩 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotice();
  }, [id]);

  const handleChange: UploadProps['onChange'] = ({ fileList }) => {
    setFileList(fileList);
    form.setFieldsValue({ attachmentUrl: fileList[0].url || '' });
  };

  const handleRemove: UploadProps['onRemove'] = () => {
    setFileList([]);
    form.setFieldsValue({ attachmentUrl: '' });
  };

  const handleAiSummarize = async () => {
    if (fileList.length === 0 || !fileList[0].originFileObj) {
      messageApi.warning('첨부 파일이 없습니다.');
      return;
    }

    // 카테고리에 따른 엔드포인트 매핑
    const getEndpoint = (type: keyof typeof ANNOUNCEMENT_TYPE) => {
      switch (type) {
        case ANNOUNCEMENT_TYPE.EPIDEMIC:
          return '/summarize/epidemic';
        case ANNOUNCEMENT_TYPE.LAW:
          return '/summarize/law';
        case ANNOUNCEMENT_TYPE.NEW_PRODUCT:
          return '/summarize/pdf';
        default:
          return '/summarize/pdf';
      }
    };

    setAiLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', fileList[0].originFileObj as File);

      if (
        watchedType === ANNOUNCEMENT_TYPE.LAW &&
        !fileList[0].originFileObj.name.endsWith('.txt')
      ) {
        messageApi.warning('해당 카테고리 요약은 .txt 파일만 지원합니다.');
        return;
      } else if (
        (watchedType === ANNOUNCEMENT_TYPE.EPIDEMIC ||
          watchedType === ANNOUNCEMENT_TYPE.NEW_PRODUCT) &&
        !fileList[0].originFileObj.name.endsWith('.pdf')
      ) {
        messageApi.warning('해당 카테고리 요약은 .pdf 파일만 지원합니다.');
        return;
      }

      const res = await aiInstance.post(getEndpoint(watchedType), formData);
      // LOG: 테스트용 로그
      console.log('✨ AI 문서 요약:', res.data);
      if (res.data.success) {
        if (watchedType === ANNOUNCEMENT_TYPE.EPIDEMIC) {
          form.setFieldsValue({ content: res.data.data.notice });
        } else {
          form.setFieldsValue({ content: res.data.data.summary });
        }
        messageApi.success('AI가 문서를 요약했습니다!');
      }
    } catch (e: any) {
      console.error('AI 문서 요약 실패:', e);
      messageApi.error(e.message || 'AI 문서 요약 중 오류가 발생했습니다.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (values: AnnouncementRequest) => {
    try {
      const payload = {
        type: values.type,
        title: values.title.trim(),
        content: values.content,
        attachmentUrl: values.attachmentUrl || '',
      };
      const res = await instance.put(`/announcements/${id}`, payload);
      // LOG: 테스트용 로그
      console.log('✨ 공지사항 수정:', res.data);
      if (res.data.success) {
        messageApi.success('공지사항이 수정되었습니다.');
        navigate(`/hq/notices/${id}`);
      }
    } catch (e: any) {
      console.error('공지사항 수정 실패:', e);
      messageApi.error(e.message || '공지사항 수정 중 오류가 발생했습니다.');
    }
  };

  const handleFormValuesChange = () => {
    setIsEdited(true);
  };

  const handleBack = () => {
    if (isEdited) {
      modal.confirm({
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
      {modalContextHolder}
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
        onValuesChange={handleFormValuesChange}
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
                { value: 'NOTICE', label: '안내' },
                { value: 'EPIDEMIC', label: '감염병' },
                { value: 'LAW', label: '법령' },
                { value: 'NEW_PRODUCT', label: '신제품' },
              ]}
              disabled
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
            onChange={(val: string) => form.setFieldsValue({ content: val })}
          />
        </Form.Item>

        <Flex wrap justify="space-between" gap={8}>
          <Space wrap align="center">
            <Form.Item name="attachmentUrl" noStyle>
              <Input type="hidden" />
            </Form.Item>
            // TODO: 파일 용량 제한
            <Upload
              accept=".pdf,.txt"
              listType="text"
              fileList={fileList}
              beforeUpload={() => false}
              onChange={handleChange}
              onRemove={handleRemove}
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
              disabled={!watchedType || watchedType === ANNOUNCEMENT_TYPE.NOTICE}
              onClick={handleAiSummarize}
              loading={aiLoading}
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
