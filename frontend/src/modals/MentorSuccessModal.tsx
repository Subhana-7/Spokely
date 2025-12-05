import React from "react";
import { CheckCircle } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";

interface MentorSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

const MentorSuccessModal: React.FC<MentorSuccessModalProps> = ({
  isOpen,
  onClose,
  message,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Application Submitted Successfully"
      icon={<CheckCircle className="h-6 w-6 text-green-600" />}
    >
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Mentor Application Received
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>{message}</p>
              </div>
            </div>
          </div>
        </div>

        <Button variant="primary" onClick={onClose} className="w-full">
          Got it, thanks!
        </Button>
      </div>
    </Modal>
  );
};

export default MentorSuccessModal;
