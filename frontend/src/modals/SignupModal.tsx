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

  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    phone?: string;
    password?: string;
  }>({});

  const [showOtpModal, setShowOtpModal] = useState(false);

  const roleOptions = [
    { value: "user", label: "User" },
    { value: "mentor", label: "Mentor" },
  ];

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
    ) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(
        formData.password
      )
    ) {
      newErrors.password =
        "Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special character.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = "Enter a valid 10-digit phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGoogleSignup = () => {
    window.location.href = `${import.meta.env.VITE_SERVER_SIDE_URL}/api/users/google`;
  };

  const handleCreateAccount = async () => {
    if (!validate()) return;

    try {
      await signup(formData);
      await sendOTP({ email: formData.email });
      setShowOtpModal(true);
    } catch (err: any) {
      console.log("Signup failed: " + (err.response?.data?.message || err.message));
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
          type="name"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={(value) => {
            setFormData({ ...formData, fullName: value });
            if (errors.fullName)
              setErrors((prev) => ({ ...prev, fullName: "" }));
          }}
          error={errors.fullName}
        />

        <Input
          type="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={(value) => {
            setFormData({ ...formData, email: value });
            if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
          }}
          error={errors.email}
        />

        <Input
          type="text"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={(value) => {
            setFormData({ ...formData, phone: value });
            if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
          }}
          error={errors.phone}
        />

        <Input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(value) => {
            setFormData({ ...formData, password: value });
            if (errors.password)
              setErrors((prev) => ({ ...prev, password: "" }));
          }}
          error={errors.password}
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
