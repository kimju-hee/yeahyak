import { message, Typography } from 'antd';
import { useState, type MouseEventHandler } from 'react';
import { noticeAPI } from '../api';

type AttachmentLinkProps = {
  noticeId: number;
  fileName?: string;
  messageApi: ReturnType<typeof message.useMessage>[0];
};

export function AttachmentLink({ noticeId, fileName, messageApi }: AttachmentLinkProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload: MouseEventHandler<HTMLElement> = async (e) => {
    e.preventDefault();
    if (downloading) return;
    const hide = messageApi.loading('첨부파일을 다운로드하고 있습니다...', 0);
    setDownloading(true);
    try {
      const savedName = await noticeAPI.download(noticeId);
      hide();
      messageApi.success(`${savedName} 다운로드가 완료되었습니다.`);
    } catch (e) {
      console.error('첨부파일 다운로드 실패:', e);
      hide();
      messageApi.error('첨부파일 다운로드 중 오류가 발생했습니다.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Typography.Link
      href="#"
      onClick={handleDownload}
      disabled={downloading}
      style={{ userSelect: 'none' }}
    >
      {fileName || '첨부파일 다운로드'}
    </Typography.Link>
  );
}
