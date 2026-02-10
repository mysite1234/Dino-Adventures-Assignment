'use client'

// components/ModalView.js

// components/AntdModalView.js

import { Modal } from "antd";

export default function AntdModalView({ isOpen, onClose, title, children }) {
  return (
    <Modal
      title={title}
      open={isOpen}
      onCancel={onClose}
      onOk={onClose}
      centered
      footer={null} // Remove this if you want default "Ok / Cancel"
    >
      {children}
    </Modal>
  );
}
