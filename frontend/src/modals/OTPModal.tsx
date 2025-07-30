import React, { useState, useEffect } from "react";
import { Shield } from "lucide-react";
import Modal from "./Modal";
import Input from "./Input";
import Button from "./Button";
import { verifyOTP, sendOTP } from "../services/authServices";
import { useNavigate } from "react-router-dom";

interface OTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  role: string;
}

const OTPModal: React.FC<OTPModalProps> = ({
  isOpen,
  onClose,
  email,
  role,
}) => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(120); // 2 minutes
  const [canInteract, setCanInteract] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (!canInteract) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCanInteract(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [canInteract]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleVerify = async () => {
    setError("");
    try {
      await verifyOTP({ email, code: otp }, role as "user" | "mentor");
      navigate(role === "user" ? "/user/home" : "/mentor/home");
    } catch (err: any) {
      const msg =
        err.response?.data?.message || err.message || "Verification failed";
      setError(msg);
    }
  };

  const handleResend = async () => {
    try {
      await sendOTP({ email: email }, role as "user" | "mentor");
      setOtp("");
      setSecondsLeft(120);
      setCanInteract(false);
      setError("");
    } catch (err: any) {
      const msg =
        err.response?.data?.message || err.message || "Failed to resend OTP";
      setError(msg);
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
          <p className="text-gray-800 mb-2">
            We've sent a verification code to your email address.
          </p>
          <p className="text-sm text-gray-600">
            {canInteract ? (
              <span className="text-green-600 font-semibold">
                You can now resend the code
              </span>
            ) : (
              <>
                You can resend in{" "}
                <span className="font-semibold">{formatTime(secondsLeft)}</span>
              </>
            )}
          </p>
        </div>

        <Input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={setOtp}
          className="text-center text-lg tracking-widest"
          error={error}
          disabled={canInteract}
        />

        <div className="pt-2">
          <Button
            variant="primary"
            onClick={handleVerify}
            disabled={canInteract}
          >
            Verify & Continue
          </Button>
        </div>

        <div className="text-center pt-2">
          <button
            onClick={handleResend}
            disabled={!canInteract}
            className={`font-medium transition-colors ${
              canInteract
                ? "text-blue-600 hover:text-blue-700"
                : "text-gray-400 cursor-not-allowed"
            }`}
          >
            Didn't receive code? Resend
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default OTPModal;
