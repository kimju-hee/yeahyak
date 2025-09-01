import { Button, Result, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function ServerErrorPage() {
  const navigate = useNavigate();
  return (
    <Result
      status="500"
      title={
        <Typography.Title level={1} style={{ color: 'white' }}>
          500
        </Typography.Title>
      }
      subTitle={
        <Typography.Title level={4} style={{ color: 'white' }}>
          서버 오류가 발생했습니다.
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
