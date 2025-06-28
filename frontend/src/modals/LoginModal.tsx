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
}

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSwitchToSignup,
}) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await login(formData);
      const user = res.data.user;

      if (!user.isVerified) {
        await sendOTP({ email: user.email });
        setRole(user.role);
        setEmail(user.email);
        setShowOtpModal(true);
      } else {
        if (user.role === "user") {
          navigate("/user/home");
        } else {
          navigate("/mentor/home");
        }
      }
    } catch (err: any) {
      alert("Login failed: " + (err.response?.data?.message || err.message));
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
            onChange={(val) => setFormData({ ...formData, email: val })}
          />
          <Input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(val) => setFormData({ ...formData, password: val })}
          />

          <Button variant="primary" onClick={handleLogin}>
            Login
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
