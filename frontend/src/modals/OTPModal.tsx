import React, { useState } from "react";
import { Shield } from "lucide-react";
import Modal from "./Modal";
import Input from "./Input";
import Button from "./Button";
import { verifyOTP } from "../services/authServices";
import { useNavigate } from "react-router-dom";

interface OTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  role: string;
  onVerify?: () => void;
}

const OTPModal: React.FC<OTPModalProps> = ({
  isOpen,
  onClose,
  email,
  role,
}) => {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const handleVerify = async () => {
    try {
      await verifyOTP({ email, code: otp });
      if (role === "user") {
        navigate("/user/home");
      } else {
        navigate("/mentor/home");
      }
    } catch (err: any) {
      alert(
        "OTP verification failed: " +
          (err.response?.data?.message || err.message)
      );
    }
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
            We've sent a verification code to your email address. Please enter
            it below to continue.
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
