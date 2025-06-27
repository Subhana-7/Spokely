import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';

interface OTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: () => void;
}

const OTPModal: React.FC<OTPModalProps> = ({ isOpen, onClose, onVerify }) => {
  const [otp, setOtp] = useState('');

  const handleVerify = () => {
    console.log('OTP verification:', otp);
    onVerify();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Kindly verify your email"
      icon={<Shield className="h-6 w-6 text-gray-800" />}
    >
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-gray-800 mb-4">
            We've sent a verification code to your email address. Please enter it below to continue.
          </p>
        </div>
        
        <Input
          placeholder="Enter OTP"
          value={otp}
          onChange={setOtp}
          className="text-center text-lg tracking-widest"
        />
        
        <div className="pt-2">
          <Button variant="primary" onClick={handleVerify}>
            Verify & Create Account
          </Button>
        </div>
        
        <div className="text-center pt-2">
          <button className="text-gray-800 hover:text-gray-900 font-medium transition-colors">
            Didn't receive code? Resend
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default OTPModal;