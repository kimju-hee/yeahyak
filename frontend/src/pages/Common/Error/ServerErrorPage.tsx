import { Result } from 'antd';

export default function ServerErrorPage() {
  return <Result status="500" title="500" subTitle="Sorry, something went wrong." />;
}
