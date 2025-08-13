import { LeftOutlined, UploadOutlined, InfoCircleOutlined, PaperClipOutlined, DeleteOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { Button, Flex, Form, Input, message, Modal, Select, Space, Typography, Upload, Grid, Tooltip} from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiInstance, instance } from '../../api/api';
import TiptapEditor from '../../components/TiptapEditor';
import { ANNOUNCEMENT_TYPE, type AnnouncementRequest } from '../../types/announcement.type';

export default function HqNoticeRegisterPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { md } = Grid.useBreakpoint();

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [isEdited, setIsEdited] = useState(false);

  const watchedType = Form.useWatch('type', form);
  const watchedContent = Form.useWatch('content', form);

  // 첨부파일 용량 제한 (MB)
  const MAX_FILE_MB = 5;
  const [isAiBlocked, setIsAiBlocked] = useState(false);

  const toCleanHtml = (raw: string) => {
    let t = (raw ?? '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/^\s*Subject:\s*/i, '')
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n');

    return (
      t
        .split(/\n{2,}/)
        .map((s) => `<p>${s.replace(/\n/g, '<br/>')}</p>`)
        .join('') || '<p></p>'
    );
  };

  const handleChange: UploadProps['onChange'] = ({ fileList }) => {
    setFileList(fileList);
    const f = fileList[0];
    form.setFieldsValue({ attachmentUrl: f?.name || '' });

    const size = f?.originFileObj ? (f.originFileObj as File).size : 0;
    setIsAiBlocked(size > MAX_FILE_MB * 1024 * 1024);
  };

  const handleRemove = () => {
    setFileList([]);
    form.setFieldsValue({ attachmentUrl: '' });
    setIsAiBlocked(false);
  };

  const handleAiSummarize = async () => {
    if (isAiBlocked) {
      messageApi.warning(`첨부 파일이 ${MAX_FILE_MB}MB를 초과하여 AI 요약을 사용할 수 없습니다.`);
      return;
    }
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
      const file = fileList[0].originFileObj as File;
      formData.append('file', file);

      if (
        watchedType === ANNOUNCEMENT_TYPE.LAW &&
        !file.name.endsWith('.txt')
      ) {
        messageApi.warning('해당 카테고리 요약은 .txt 파일만 지원합니다.');
        return;
      } else if (
        (watchedType === ANNOUNCEMENT_TYPE.EPIDEMIC ||
          watchedType === ANNOUNCEMENT_TYPE.NEW_PRODUCT) &&
        !file.name.endsWith('.pdf')
      ) {
        messageApi.warning('해당 카테고리 요약은 .pdf 파일만 지원합니다.');
        return;
      }

      const res = await aiInstance.post(
        getEndpoint(watchedType as keyof typeof ANNOUNCEMENT_TYPE),
        formData
      );
      // LOG: 테스트용 로그
      console.log('✨ AI 문서 요약:', res.data);

      if (res.data?.success) {
        const raw =
          watchedType === ANNOUNCEMENT_TYPE.EPIDEMIC
            ? res.data.data.notice
            : res.data.data.summary;
        form.setFieldsValue({ content: toCleanHtml(raw) });
        messageApi.success('AI가 문서를 요약했습니다!');
      }
    } catch (e: any) {
      console.error('AI 문서 요약 실패:', e);
      messageApi.error(e?.message || 'AI 문서 요약 중 오류가 발생했습니다.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (values: AnnouncementRequest) => {
    try {
      const payload = {
        type: values.type,
        title: (values.title || '').trim(),
        content: values.content,
        attachmentUrl: values.attachmentUrl || '',
      };
      const res = await instance.post('/announcements', payload);
      // LOG: 테스트용 로그
      console.log('✨ 공지사항 등록:', res.data);

      if (res.data?.success) {
        const node = Array.isArray(res.data?.data) ? res.data.data[0] : res.data?.data;
        const id = node?.announcementId;
        if (id) {
          messageApi.success('공지사항이 등록되었습니다.');
          navigate(`/hq/notices/${id}`);
        } else {
          messageApi.warning('생성된 공지 ID를 확인하지 못했습니다.');
        }
      } else {
        messageApi.error('공지사항 등록에 실패했습니다.');
      }
    } catch (e: any) {
      console.error('공지사항 등록 실패:', e);
      messageApi.error(e?.message || '공지사항 등록 중 오류가 발생했습니다.');
    }
  };

  const handleFormValuesChange = () => 
    setIsEdited(true);

  const handleBack = () => {
    if (isEdited) {
      modal.confirm({
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
          공지사항 작성
        </Typography.Title>
      </Space>

      <Form
        form={form}
        name="notice-register"
        layout="vertical"
        onValuesChange={handleFormValuesChange}
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Flex gap={12} style={{ marginBottom: 8, minWidth: 0 }}>
          <Form.Item
            name="type"
            label="카테고리"
            rules={[{ required: true, message: '카테고리를 선택해주세요.' }]}
            style={{ flex: 1, minWidth: 0 }}
          >
            <Select
              placeholder="카테고리 선택"
              options={[
                { value: 'NOTICE', label: '안내' },
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
            style={{ flex: 5, minWidth: 0 }}
          >
            <Input />
          </Form.Item>
        </Flex>

        <Flex
          gap={8}
          align="center"
          style={{
            marginBottom: 12,
            minWidth: 0,
            flexWrap: md ? 'nowrap' : 'wrap',
          }}
        >
          <Flex
            style={{
              flex: md ? '0 0 200px' : '1 1 100%',
              minWidth: md ? 235 : 0,
              alignItems: 'center',
              gap: 12,
            }}
          >
            <Form.Item name="attachmentUrl" noStyle>
              <Input type="hidden" />
            </Form.Item>

            <Upload
              accept=".pdf,.txt"
              listType="text"
              showUploadList={false}
              fileList={fileList}
              beforeUpload={() => false}
              onChange={handleChange}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />} style={{ flexShrink: 0 }}>
                첨부파일
              </Button>
            </Upload>

            {fileList.length > 0 && (
              <Flex style={{ alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
                <PaperClipOutlined style={{ flexShrink: 0 }} />
                <Typography.Text
                  ellipsis={{ tooltip: fileList[0].name }}
                  style={{ flex: 1, minWidth: 0 }}
                >
                  {fileList[0].name}
                </Typography.Text>
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={handleRemove}
                  aria-label="첨부 삭제"
                  style={{ flexShrink: 0 }}
                />
              </Flex>
            )}
          </Flex>

          <Flex
            style={{
              flex: md ? '1 1 auto' : '1 1 100%',
              minWidth: 0,
              alignItems: 'center',
              gap: 12,
            }}
          >
            <Button
              type="primary"
              disabled={
                !watchedType ||
                watchedType === ANNOUNCEMENT_TYPE.NOTICE ||
                watchedType === 'NOTICE' ||
                isAiBlocked ||
                fileList.length === 0
              }
              onClick={handleAiSummarize}
              loading={aiLoading}
              style={{ flexShrink: 0 }}
            >
              AI 요약
            </Button>
            
            {md ? (
              <Typography.Text
                type={isAiBlocked ? 'danger' : 'secondary'}
                style={{ whiteSpace: 'nowrap' }}
              >
                <InfoCircleOutlined style={{ marginRight: 6 }} />
                AI 요약은 {MAX_FILE_MB}MB 이하 파일만 지원합니다.
              </Typography.Text>
            ) : (
              <Tooltip title={`AI 요약은 ${MAX_FILE_MB}MB 이하 파일만 지원합니다.`}>
                <InfoCircleOutlined />
              </Tooltip>
            )}
          </Flex>
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

        <Flex justify="flex-end">
          <Button type="primary" htmlType="submit">
            등록
          </Button>
        </Flex>
      </Form>
    </>
  );
}
