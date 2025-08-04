import { Result } from 'antd';

export default function ForbiddenPage() {
  return (
    <Result
      status="403"
      title="403"
      subTitle="Sorry, you are not authorized to access this page."
    />
  );
}
