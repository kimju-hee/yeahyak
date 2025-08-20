import { LeftOutlined, UploadOutlined, InfoCircleOutlined, PaperClipOutlined, DeleteOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { Button, Flex, Form, Input, message, Modal, Select, Space, Typography, Upload, Grid, Tooltip } from 'antd';
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
  const { md } = Grid.useBreakpoint(); 

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [isEdited, setIsEdited] = useState(false);

  const watchedType = Form.useWatch('type', form);
  const watchedContent = Form.useWatch('content', form);

  // 첨부파일 용량 제한(MB)
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

  const hasExt = (name: string, ...exts: string[]) => {
    const n = (name || '').toLowerCase();
    return exts.some((e) => n.endsWith(e));
  };

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const extractDisplayName = (url: string) => {
    try {
      if (!url) return '첨부파일';
      if (url.startsWith('data:')) {
        const m = /^data:[^;]*(?:;name=([^;]*))?;base64,/.exec(url);
        if (m?.[1]) return decodeURIComponent(m[1]);
        const m2 = /^data:([^;]+)/.exec(url);
        const ext =
          (m2?.[1] || '').includes('pdf') ? 'pdf' :
          (m2?.[1] || '').includes('plain') ? 'txt' :
          'bin';
        return `첨부파일.${ext}`;
      } else {
        const u = new URL(url, window.location.origin);
        const filename = u.searchParams.get('filename');
        if (filename) return decodeURIComponent(filename);
        const last = u.pathname.split('/').filter(Boolean).pop();
        return last || '첨부파일';
      }
    } catch {
      return '첨부파일';
    }
  };

  const fetchNotice = async () => {
    setLoading(true);
    try {
      const res = await instance.get(`/announcements/${id}`);
      // LOG: 테스트용 로그
      console.log('✨ 공지사항 상세 로딩:', res.data);
      if (res.data?.success) {
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
              name: extractDisplayName(notice.attachmentUrl),
              status: 'done',
              url: notice.attachmentUrl,
            },
          ]);
        }
      }
    } catch (e: any) {
      console.error('공지사항 상세 로딩 실패:', e);
      messageApi.error(e?.message || '공지사항 로딩 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotice();
  }, [id]);

  const handleChange: UploadProps['onChange'] = async ({ fileList }) => {
    setFileList(fileList);
    const f = fileList[0];

    const size = f?.originFileObj ? (f.originFileObj as File).size : 0;
    setIsAiBlocked(size > MAX_FILE_MB * 1024 * 1024);

    if (!f?.originFileObj) {
      return;
    }

    try {
      const base64 = await toBase64(f.originFileObj as File);
      let withName = base64;
      const i = base64.indexOf(';base64,');
      if (i > -1) {
        const head = base64.slice(0, i);
        const body = base64.slice(i);
        const encodedName = encodeURIComponent(f.name);
        withName = `${head};name=${encodedName}${body}`;
      }
      form.setFieldsValue({ attachmentUrl: withName });
      messageApi.success('파일이 추가되었습니다.');
    } catch (e: any) {
      console.error('첨부 처리 실패:', e);
      messageApi.error(e?.message || '파일 처리 중 오류가 발생했습니다.');
      form.setFieldsValue({ attachmentUrl: '' });
      setFileList([]);
      setIsAiBlocked(false);
    }
  };

  const handleRemove = () => {
    setFileList([]);
    form.setFieldsValue({ attachmentUrl: '' });
    setIsAiBlocked(false);
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

    const res = await aiInstance.post(getEndpoint(watchedType as keyof typeof ANNOUNCEMENT_TYPE),formData);
    // LOG: 테스트용 로그
    console.log('✨ AI 문서 요약:', res.data);
    if (res.data.success) {
      const raw = watchedType === ANNOUNCEMENT_TYPE.EPIDEMIC
        ? res.data.data.notice
        : res.data.data.summary;

      form.setFieldsValue({ content: toCleanHtml(raw) });
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
        title: (values.title || '').trim(),
        content: values.content,
        attachmentUrl: values.attachmentUrl || '',
      };
      const res = await instance.put(`/announcements/${id}`, payload);
      console.log('✨ 공지사항 수정:', res.data);
      if (res.data?.success) {
        messageApi.success('공지사항이 수정되었습니다.');
        navigate(`/hq/notices/${id}`);
      } else {
        messageApi.error('공지사항 수정에 실패했습니다.');
      }
    } catch (e: any) {
      console.error('공지사항 수정 실패:', e);
      messageApi.error(e?.message || '공지사항 수정 중 오류가 발생했습니다.');
    }
  };

  const handleFormValuesChange = () => 
    setIsEdited(true);

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
        <Flex gap={12} style={{ marginBottom: 8, minWidth: 0 }}>
          <Form.Item
            name="type"
            label="카테고리"
            rules={[{ required: true, message: '카테고리를 선택해주세요.' }]}
            style={{ flex: 1, minWidth: 0 }}
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
          <Button type="primary" htmlType="submit" loading={loading}>
            저장
          </Button>
        </Flex>
      </Form>
    </>
  );
}
