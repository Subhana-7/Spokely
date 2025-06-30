import React, { useState } from "react";
import { UserPlus } from "lucide-react";
import Modal from "./Modal";
import Input from "./Input";
import Button from "./Button";
import Toggle from "./Toggle";
import { signup, sendOTP } from "../services/authServices";
import OTPModal from "./OTPModal";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const SignupModal: React.FC<SignupModalProps> = ({
  isOpen,
  onClose,
  onSwitchToLogin,
}) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "user",
  });

  const [showOtpModal, setShowOtpModal] = useState(false);

  const roleOptions = [
    { value: "user", label: "User" },
    { value: "mentor", label: "Mentor" },
  ];

  const handleGoogleSignup = () => {
    window.location.href = " http://localhost:5000/api/users/google";
  };

  const handleCreateAccount = async () => {
    try {
      await signup(formData);
      alert("signup successful");
      await sendOTP({ email: formData.email });
      setShowOtpModal(true);
    } catch (err: any) {
      alert("Signup failed: " + (err.Response.data?.message || err.message));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Account"
      icon={<UserPlus className="h-6 w-6 text-gray-800" />}
    >
      <div className="space-y-4">
        <Input
          placeholder="Full Name"
          value={formData.fullName}
          onChange={(value) => setFormData({ ...formData, fullName: value })}
        />

        <Input
          type="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={(value) => setFormData({ ...formData, email: value })}
        />

        <Input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(value) => setFormData({ ...formData, password: value })}
        />

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">
            Select Role
          </label>
          <Toggle
            options={roleOptions}
            selected={formData.role}
            onChange={(value) => setFormData({ ...formData, role: value })}
          />
        </div>

        <div className="space-y-3 pt-2">
          <Button variant="google" onClick={handleGoogleSignup}>
            Signup using Google
          </Button>

          <Button variant="primary" onClick={handleCreateAccount}>
            Create Account
          </Button>
        </div>

        <OTPModal
          isOpen={showOtpModal}
          onClose={() => setShowOtpModal(false)}
          email={formData.email}
          role={formData.role}
        />

        <div className="text-center pt-2">
          <button
            onClick={onSwitchToLogin}
            className="text-gray-800 hover:text-gray-900 font-medium transition-colors"
          >
            Already have an account? Login
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SignupModal;
