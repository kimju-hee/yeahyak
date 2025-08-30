import { Checkbox, Form, Modal, Typography } from 'antd';
import DOMPurify from 'dompurify';
import { useState } from 'react';
import privacyHtml from '../assets/privacy.html?raw';
import termsHtml from '../assets/terms.html?raw';

export function TermsAndPrivacyCheckbox() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');

  const showModal = (title: 'terms' | 'privacy') => {
    if (title === 'terms') {
      setModalContent(termsHtml);
    } else {
      setModalContent(privacyHtml);
    }
    setIsModalOpen(true);
  };

  return (
    <>
      <Form.Item
        name="agreement"
        valuePropName="checked"
        rules={[
          {
            required: true,
            message: '서비스 이용약관 및 개인정보 수집 이용에 동의해주세요',
          },
        ]}
        validateTrigger="onSubmit"
      >
        <Checkbox>
          (필수){' '}
          <Typography.Link
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              showModal('terms');
            }}
          >
            서비스 이용약관
          </Typography.Link>{' '}
          및{' '}
          <Typography.Link
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              showModal('privacy');
            }}
          >
            개인정보 수집 이용
          </Typography.Link>
          에 동의합니다.
        </Checkbox>
      </Form.Item>

      <Modal
        title={null}
        footer={null}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        width={640}
        styles={{
          body: {
            maxHeight: '70vh',
            overflowY: 'auto',
            scrollbarWidth: 'thin',
          },
        }}
        centered={true}
        closable={false}
        destroyOnHidden={true}
      >
        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(modalContent) }} />
      </Modal>
    </>
  );
}
