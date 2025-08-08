import { Checkbox, Form, Modal, Typography } from 'antd';
import { useState } from 'react';

const TERMS_CONTENT = '이용약관 내용...';
const PRIVACY_CONTENT = '개인정보 수집 및 이용 내용...';

export default function TermsAndPrivacyCheckbox() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');

  const showModal = (title: 'terms' | 'privacy') => {
    if (title === 'terms') {
      setModalTitle('서비스 이용약관');
      setModalContent(TERMS_CONTENT);
    } else {
      setModalTitle('개인정보 수집 및 이용');
      setModalContent(PRIVACY_CONTENT);
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
        style={{ maxHeight: '400px', overflowY: 'auto', whiteSpace: 'pre-wrap' }}
      >
        {modalContent}
      </Modal>
    </>
  );
}
