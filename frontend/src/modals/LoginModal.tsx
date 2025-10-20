import React, { useState } from "react";
import { LogIn, Eye, EyeOff } from "lucide-react";
import Modal from "./Modal";
import Input from "./Input";
import Button from "./Button";
import { login } from "../services/authServices";
import OTPModal from "./OTPModal";
import VerificationPendingModal from "./VerificationPendingModal";
import DocumentResubmissionModal from "./DocumentReSubmissionModal";
import ChangePasswordModal from "./ChangePasswordModal";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/userAuthStore";
import Toggle from "./Toggle";
import PasswordResetSuccessModal from "./PasswordResetSuccessModal";

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
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const [showDocumentResubmission, setShowDocumentResubmission] =
    useState(false);
  const [verificationPendingMessage, setVerificationPendingMessage] =
    useState("");
  const [blockedMessage, setBlockedMessage] = useState("");

  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [isPasswordResetMode, setIsPasswordResetMode] = useState(false);
  const [passwordResetEmail, setPasswordResetEmail] = useState("");
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);

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
      useAuthStore.getState().setUser({
        id: user._id,
        name: user.name,
        email: user.email,
        role: selectedRole,
        profilePicture: user.profilePicture,
        uniqueCode: user.uniqueCode,
      });
      if (user.isBlocked) {
        const roleText = selectedRole === "user" ? "user" : "mentor";
        setBlockedMessage(
          `Your ${roleText} account has been blocked. Please contact support for assistance.`
        );
        return;
      }
      if (!user.isVerified) {
        setRole(user.role);
        setEmail(user.email);
        setShowOtpModal(true);
      } else if (
        selectedRole === "mentor" &&
        user.document?.verificationStatus === "rejected"
      ) {
        setShowDocumentResubmission(true);
      } else if (
        selectedRole === "mentor" &&
        user.document?.verificationStatus === "pending"
      ) {
        setVerificationPendingMessage(
          "Your mentor application is under review, Kindly monitor emails for updation"
        );
      } else {
        if (selectedRole === "user") navigate("/user/home");
        else navigate("/mentor/home");
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

  const handleForgotPasswordClick = () => {
    setShowChangePasswordModal(true);
  };

  const handleChangePassword = (email: string, newPassword: string) => {
    setIsPasswordResetMode(true);
    setPasswordResetEmail(email);
    setShowChangePasswordModal(false);
    setShowOtpModal(true);
    setEmail(email);
    setRole("user");
  };
  
const handlePasswordResetOTPSuccess = () => {
  setShowOtpModal(false); // close OTP modal first
  setIsPasswordResetMode(false);
  
  // Slight delay to ensure OTP modal unmounts
  setTimeout(() => {
    setPasswordResetSuccess(true); // now show success modal
  }, 0);
};


  const handleCloseModal = () => {
    setShowOtpModal(false);
    setShowDocumentResubmission(false);
    setVerificationPendingMessage("");
    setBlockedMessage("");
    setShowChangePasswordModal(false);
    setIsPasswordResetMode(false);
    setPasswordResetSuccess(false);
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

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleCloseModal}
        title="Login to Spokely"
        icon={<LogIn className="h-6 w-6 text-yellow-400" />}
      >
        <div className="space-y-5 bg-slate-900 text-gray-200 p-6 rounded-2xl">
          <Input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(val) => {
              setFormData({ ...formData, email: val });
              if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
            }}
            error={errors.email}
            className="bg-slate-800 text-gray-100 placeholder-gray-400 border border-yellow-500 focus:ring-yellow-400"
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
            className="bg-slate-800 text-gray-100 placeholder-gray-400 border border-yellow-500 focus:ring-yellow-400"
          />

          <div>
            <label className="block text-sm font-medium text-yellow-400 mb-2">
              You are a
            </label>
            <Toggle
              options={roleOptions}
              selected={role}
              onChange={(val) => setRole(val)}
            />
          </div>

          <div>
            <button
              onClick={handleForgotPasswordClick}
              className="block text-sm font-medium text-yellow-400 hover:text-yellow-300 mb-2 transition-colors cursor-pointer"
            >
              Forgot Password? Click here to reset password!
            </button>
          </div>

          {/* Login Button - PRIMARY submit */}
          <Button
            variant="primary"
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-yellow-500 text-black font-semibold hover:bg-yellow-400 py-2 rounded-xl transition-all"
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="h-px bg-slate-700 w-full" />
            <span className="absolute px-3 bg-slate-900 text-sm text-gray-400">
              or
            </span>
          </div>

          {/* Google Login */}
          <Button
            variant="google"
            onClick={handleGoogleSignup}
            disabled={loading}
            className="w-full bg-transparent border border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-black transition-all font-medium py-2 rounded-xl"
          >
            <LogIn className="mr-2 h-4 w-4" /> Login using Google
          </Button>

          <div className="text-center pt-3">
            <button
              onClick={onSwitchToSignup}
              className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors"
            >
              Don’t have an account? <span className="underline">Signup</span>
            </button>
          </div>
        </div>
      </Modal>

      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        onChangePassword={handleChangePassword}
      />

      <OTPModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        email={email}
        role={role}
        isForgotPassword={isPasswordResetMode}
        onSuccess={handlePasswordResetOTPSuccess}
      />

      {passwordResetSuccess && (
        <PasswordResetSuccessModal
          isOpen={passwordResetSuccess}
          onClose={() => setPasswordResetSuccess(false)}
        />
      )}
    </>
  );
};

export default LoginModal;
