import { Button, Result, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <Result
      status="404"
      title={
        <Typography.Title level={1} style={{ color: 'white' }}>
          404
        </Typography.Title>
      }
      subTitle={
        <Typography.Title level={4} style={{ color: 'white' }}>
          찾을 수 없는 페이지입니다.
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
