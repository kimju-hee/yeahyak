import { Button, Result, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function ForbiddenPage() {
  const navigate = useNavigate();
  return (
    <Result
      status="403"
      title={
        <Typography.Title level={1} style={{ color: 'white' }}>
          403
        </Typography.Title>
      }
      subTitle={
        <Typography.Title level={4} style={{ color: 'white' }}>
          접근 권한이 없습니다.
        </Typography.Title>
      }
      extra={
        <Button ghost onClick={() => navigate('/')}>
          돌아가기
        </Button>
      }
    />
  );
}
