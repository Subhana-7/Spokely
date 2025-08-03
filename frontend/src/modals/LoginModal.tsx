import React, { useState } from "react";
import { LogIn, Eye, EyeOff } from "lucide-react";
import Modal from "./Modal";
import Input from "./Input";
import Button from "./Button";
import { login } from "../services/authServices";
import OTPModal from "./OTPModal";
import VerificationPendingModal from "./VerificationPendingModal";
import DocumentResubmissionModal from "./DocumentReSubmissionModal";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/userAuthStore";
import Toggle from "./Toggle";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
  onForgotPassword: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSwitchToSignup,
  onForgotPassword,
}) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showPassword, setShowPassword] = useState(false);

  const { setRole: setGlobalRole } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const [showDocumentResubmission, setShowDocumentResubmission] = useState(false);
  const [verificationPendingMessage, setVerificationPendingMessage] = useState("");
  const [blockedMessage, setBlockedMessage] = useState("");

  const validate = () => {
    const err: typeof errors = {};
    if (!formData.email) err.email = "Email is required";
    if (!formData.password) err.password = "Password is required";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    if (role !== "user" && role !== "mentor") {
      setErrors({ email: "Please select a role (User or Mentor)" });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const selectedRole: "user" | "mentor" = role;
      const res = await login(formData, selectedRole);
      const user = res.data[selectedRole];

      console.log(user.isBlocked)
      if (user.isBlocked) {
        const roleText = selectedRole === "user" ? "user" : "mentor";
        setBlockedMessage(`Your ${roleText} account has been blocked. Please contact support for assistance.`);
        return;
      }

      if (!user.isVerified) {
        setRole(user.role);
        setEmail(user.email);
        setShowOtpModal(true);
      } else if (selectedRole === "mentor" && user.document?.verificationStatus === "rejected") {
        setShowDocumentResubmission(true);
      } else if (selectedRole === "mentor" && user.document?.verificationStatus === "pending") {
        setVerificationPendingMessage("Your mentor application is under review, Kindly monitor emails for updation");
      } else {
        setGlobalRole(user.role);
        if (selectedRole === "user") {
          navigate("/user/home");
        } else {
          navigate("/mentor/home");
        }
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message;
      setErrors({ password: message });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    if (!loading) {
      window.location.href = `${
        import.meta.env.VITE_SERVER_SIDE_URL
      }/api/users/google`;
    }
  };

  const handleCloseModal = () => {
    setShowOtpModal(false);
    setShowDocumentResubmission(false);
    setVerificationPendingMessage("");
    setBlockedMessage("");
    setErrors({});
    onClose();
  };

  const handleVerificationPendingClose = () => {
    setVerificationPendingMessage("");
    handleCloseModal();
  };

  const handleDocumentResubmissionClose = () => {
    setShowDocumentResubmission(false);
    handleCloseModal();
  };

  const handleBlockedMessageClose = () => {
    setBlockedMessage("");
    handleCloseModal();
  };

  const roleOptions = [
    { value: "user", label: "User" },
    { value: "mentor", label: "Mentor" },
  ];

  // Show blocked message modal
  if (blockedMessage) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleBlockedMessageClose}
        title="Account Blocked"
        icon={<LogIn className="h-6 w-6 text-red-600" />}
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Account Access Restricted
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{blockedMessage}</p>
                </div>
              </div>
            </div>
          </div>
          
          <Button 
            variant="primary" 
            onClick={handleBlockedMessageClose}
            className="w-full"
          >
            Understood
          </Button>
        </div>
      </Modal>
    );
  }

  if (verificationPendingMessage) {
    return (
      <VerificationPendingModal
        isOpen={isOpen}
        onClose={handleVerificationPendingClose}
        message={verificationPendingMessage}
      />
    );
  }

  if (showDocumentResubmission) {
    return (
      <DocumentResubmissionModal
        isOpen={isOpen}
        onClose={handleDocumentResubmissionClose}
        email={formData.email}
      />
    );
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleCloseModal}
        title="Login"
        icon={<LogIn className="h-6 w-6 text-gray-800" />}
      >
        <div className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(val) => {
              setFormData({ ...formData, email: val });
              if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
            }}
            error={errors.email}
          />
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={formData.password}
            onChange={(val) => {
              setFormData({ ...formData, password: val });
              if (errors.password)
                setErrors((prev) => ({ ...prev, password: "" }));
            }}
            error={errors.password}
            rightIcon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            onRightIconClick={() => setShowPassword((prev) => !prev)}
          />

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              You are a
            </label>
            <Toggle
              options={roleOptions}
              selected={role}
              onChange={(val) => setRole(val)}
            />
          </div>

          <Button
            variant="google"
            onClick={handleGoogleSignup}
            disabled={loading}
          >
            Login using Google
          </Button>

          <Button variant="primary" onClick={handleLogin} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>

          <div className="text-center pt-2">
            <button
              onClick={onSwitchToSignup}
              className="text-gray-800 hover:text-gray-900 font-medium transition-colors"
            >
              Don't have an account? Signup
            </button>
          </div>
        </div>
      </Modal>

      <OTPModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        email={email}
        role={role}
      />
    </>
  );
};

export default LoginModal;