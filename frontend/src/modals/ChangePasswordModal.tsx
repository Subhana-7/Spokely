import React, { useState } from 'react';
import { Key } from 'lucide-react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChangePassword: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ 
  isOpen, 
  onClose, 
  onChangePassword 
}) => {
  const [formData, setFormData] = useState({
    email: '',
    newPassword: ''
  });

  const handleChangePassword = () => {
    console.log('Change password:', formData);
    onChangePassword();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change Password"
      icon={<Key className="h-6 w-6 text-gray-800" />}
    >
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-gray-800 mb-4">
            Enter your email and new password to update your account security.
          </p>
        </div>
        
        <Input
          type="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={(value) => setFormData({ ...formData, email: value })}
        />
        
        <Input
          type="password"
          placeholder="New Password"
          value={formData.newPassword}
          onChange={(value) => setFormData({ ...formData, newPassword: value })}
        />
        
        <div className="pt-2">
          <Button variant="primary" onClick={handleChangePassword}>
            Change Password
          </Button>
        </div>
        
        <div className="text-center pt-2">
          <button
            onClick={onClose}
            className="text-gray-800 hover:text-gray-900 font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ChangePasswordModal;