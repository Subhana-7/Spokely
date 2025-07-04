import React, { useState } from "react";
import { LogIn } from "lucide-react";
import Modal from "./Modal";
import Input from "./Input";
import Button from "./Button";
import { login, sendOTP } from "../services/authServices";
import OTPModal from "./OTPModal";
import { useNavigate } from "react-router-dom";

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
}) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const validate = () => {
    const err: typeof errors = {};
    if (!formData.email) err.email = "Email is required";
    if (!formData.password) err.password = "Password is required";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    setErrors({});
    try {
      const res = await login(formData);
      const user = res.data.user;
      const token = res.data.token;

      if (!user.isVerified) {
        await sendOTP({ email: user.email });
        setRole(user.role);
        setEmail(user.email);
        setShowOtpModal(true);
      } else {
        localStorage.setItem("spokely_token", token);
        if (user.role === "user") navigate("/user/home");
        else navigate("/mentor/home");
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message;

      if (message.toLowerCase().includes("email")) {
        setErrors({ email: message });
      } else if (
        message.toLowerCase().includes("password") ||
        message.toLowerCase().includes("invalid credentials") || 
        message.toLowerCase().includes("incorrect")
      ) {
        setErrors({ password: message });
      } else {
        setErrors({ password: message });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    if (!loading) {
      window.location.href = "http://localhost:5000/api/users/google";
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
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
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(val) => {
              setFormData({ ...formData, password: val });
              if (errors.password)
                setErrors((prev) => ({ ...prev, password: "" }));
            }}
            error={errors.password}
          />

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
        onVerify={() => {
          if (role === "user") navigate("/user/home");
          else navigate("/mentor/home");
        }}
      />
    </>
  );
};

export default LoginModal;
