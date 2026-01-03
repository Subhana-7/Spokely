import React, { useEffect, useState } from "react";
import { Shield } from "lucide-react";
import Modal from "./Modal";
import Input from "./Input";
import Button from "./Button";
import SuccessModal from "./SuccessModal";
import MentorSuccessModal from "./MentorSuccessModal";
import {
  verifyOTP,
  sendOTP,
  verifyForgotPasswordOTP,
  sendForgotPasswordOTP,
} from "../services/authServices";

interface OTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  role: string;
  isForgotPassword?: boolean;
  onVerified?: () => void;
}

const MAX_RESEND_ATTEMPTS = 5;

const OTPModal: React.FC<OTPModalProps> = ({
  isOpen,
  onClose,
  email,
  role,
  isForgotPassword = false,
  onVerified,
}) => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);

  // success states
  const [showUserSuccess, setShowUserSuccess] = useState(false);
  const [showMentorSuccess, setShowMentorSuccess] = useState(false);

  // resend control
  const [resendCount, setResendCount] = useState(0);
  const [timerKey, setTimerKey] = useState(0);

  /* ---------------- TIMER ---------------- */
  useEffect(() => {
    if (!isOpen) return;

    setSecondsLeft(120);
    setCanResend(false);
    setOtp("");
    setError("");
    setResendCount(0);

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, timerKey]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  /* ---------------- VERIFY OTP ---------------- */
  const handleVerify = async () => {
    if (otp.length < 6) {
      setError("OTP must be exactly 6 digits");
      return;
    }

    if (otp.length > 6) {
      setError("OTP cannot be more than 6 digits");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (isForgotPassword) {
        await verifyForgotPasswordOTP(
          { email, code: otp },
          role as "user" | "mentor"
        );

        onVerified?.();
        return;
      } else {
        await verifyOTP({ email, code: otp }, role as "user" | "mentor");

        if (role === "mentor") {
          setShowMentorSuccess(true);
        } else {
          setShowUserSuccess(true);
        }
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Verification failed"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- RESEND OTP ---------------- */
  const handleResend = async () => {
    if (!canResend) return;

    if (resendCount >= MAX_RESEND_ATTEMPTS) {
      setError("You have reached the maximum resend limit. Please try later.");
      return;
    }

    setError("");

    try {
      if (isForgotPassword) {
        await sendForgotPasswordOTP({ email }, role as "user" | "mentor");
      } else {
        await sendOTP({ email }, role as "user" | "mentor");
      }

      setOtp("");
      setResendCount((prev) => prev + 1);
      setTimerKey((prev) => prev + 1); // restart timer
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Failed to resend OTP"
      );
    }
  };

  /* ---------------- SUCCESS MODALS ---------------- */
  if (showUserSuccess) {
    return (
      <SuccessModal
        isOpen={true}
        message={
          isForgotPassword
            ? "Password reset verified successfully. Please login with your new password."
            : "Email verified successfully. Please login to continue."
        }
        onClose={() => {
          setShowUserSuccess(false);
          onClose();
        }}
      />
    );
  }

  if (showMentorSuccess) {
    return (
      <MentorSuccessModal
        isOpen={true}
        message="Your mentor application has been submitted and is under admin review."
        onClose={() => {
          setShowMentorSuccess(false);
          onClose();
        }}
      />
    );
  }

  /* ---------------- OTP MODAL ---------------- */
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isForgotPassword ? "Verify Password Reset" : "Verify Your Email"}
      icon={<Shield className="h-6 w-6 text-gray-800" />}
    >
      <div className="space-y-4">
        <p className="text-center text-gray-700">
          We’ve sent a 6-digit code to <b>{email}</b>
        </p>

        <Input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={setOtp}
          error={error}
          className="text-center tracking-widest text-lg"
        />

        <Button variant="primary" onClick={handleVerify} disabled={loading}>
          {loading ? "Verifying..." : "Verify"}
        </Button>

        <div className="text-center text-sm">
          {canResend && resendCount < MAX_RESEND_ATTEMPTS ? (
            <button
              onClick={handleResend}
              className="text-blue-600 hover:underline"
            >
              Resend OTP ({MAX_RESEND_ATTEMPTS - resendCount} left)
            </button>
          ) : resendCount >= MAX_RESEND_ATTEMPTS ? (
            <span className="text-red-500">Resend limit reached</span>
          ) : (
            <span className="text-gray-500">
              Resend in {formatTime(secondsLeft)}
            </span>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default OTPModal;
