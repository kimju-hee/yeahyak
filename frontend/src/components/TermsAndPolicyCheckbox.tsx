import { Checkbox, Form, Modal, Typography } from 'antd';
import DOMPurify from 'dompurify';
import { useState } from 'react';

// HTML 파일들을 텍스트로 import
import privacyHtml from '../assets/privacy.html?raw';
import termsHtml from '../assets/terms.html?raw';

export default function TermsAndPrivacyCheckbox() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');

  const showModal = (title: 'terms' | 'privacy') => {
    if (title === 'terms') {
      setModalTitle('서비스 이용약관');
      setModalContent(termsHtml);
    } else {
      setModalTitle('개인정보 수집 및 이용');
      setModalContent(privacyHtml);
    }
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Form.Item
        name="agreement"
        valuePropName="checked"
        rules={[
          {
            validator: (_, value) =>
              value
                ? Promise.resolve()
                : Promise.reject(
                    new Error('서비스 이용약관 및 개인정보 수집 이용에 동의해주세요.'),
                  ),
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
        title={modalTitle}
        open={isModalOpen}
        onCancel={handleModalClose}
        footer={null}
        width={800}
        styles={{
          body: {
            maxHeight: '60vh',
            overflowY: 'auto',
            scrollbarWidth: 'thin',
          },
        }}
        destroyOnHidden
      >
        <div
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(modalContent) }}
          style={{
            lineHeight: '1.8',
          }}
        />
      </Modal>
    </>
  );
}
