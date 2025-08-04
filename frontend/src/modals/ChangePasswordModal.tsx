import React, { useState } from "react";
import { Key, Shield } from "lucide-react";
import Modal from "./Modal";
import Input from "./Input";
import Button from "./Button";
import OTPModal from "./OTPModal";
import { sendForgotPasswordOTP } from "../services/authServices";
import { useNavigate } from "react-router-dom";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChangePassword: (email: string, newPassword: string) => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  onChangePassword,
}) => {
  const [formData, setFormData] = useState({
    email: "",
    newPassword: "",
    role: "user" as "user" | "mentor",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);

  const navigate = useNavigate()

  const handleSendOTP = async () => {
    if (!formData.email || !formData.newPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await sendForgotPasswordOTP(
        {
          email: formData.email,
          newPassword: formData.newPassword,
        },
        formData.role
      );
      setShowOTPModal(true);
    } catch (err: any) {
      const msg =
        err.response?.data?.message || err.message || "Failed to send OTP";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerified = () => {
  setShowOTPModal(false);
  onChangePassword(formData.email, formData.newPassword);
  handleClose(); // close ChangePasswordModal
};


  const handleClose = () => {
    setFormData({ email: "", newPassword: "", role: "user" });
    setError("");
    setShowOTPModal(false);
    onClose();
  };

  if (showOTPModal) {
    return (
      <OTPModal
        isOpen={isOpen}
        onClose={handleClose}
        email={formData.email}
        role={formData.role}
        isForgotPassword={true}
        onVerified={handleOTPVerified}
      />
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Reset Password"
      icon={<Key className="h-6 w-6 text-gray-800" />}
    >
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-gray-800 mb-4">
            Enter your email and new password. We'll send you a verification
            code.
          </p>
        </div>

        {/* Role Toggle */}
        <div className="flex items-center justify-center space-x-4 p-3 bg-gray-50 rounded-lg">
          <label className="text-sm font-medium text-gray-700">
            Account Type:
          </label>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: "user" })}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                formData.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              User
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: "mentor" })}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                formData.role === "mentor"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Mentor
            </button>
          </div>
        </div>

        <Input
          type="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={(value) => setFormData({ ...formData, email: value })}
          error={error && !formData.email ? "Email is required" : ""}
        />

        <Input
          type="password"
          placeholder="New Password"
          value={formData.newPassword}
          onChange={(value) => setFormData({ ...formData, newPassword: value })}
          error={
            error && !formData.newPassword ? "New password is required" : ""
          }
        />

        {error && (
          <div className="text-red-600 text-sm text-center">{error}</div>
        )}

        <div className="pt-2">
          <Button
            variant="primary"
            onClick={handleSendOTP}
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Verification Code"}
          </Button>
        </div>

        <div className="text-center pt-2">
          <button
            onClick={handleClose}
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
function onOpenLoginModal() {
  throw new Error("Function not implemented.");
}

