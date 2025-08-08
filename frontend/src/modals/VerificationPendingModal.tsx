import React from "react";
import { Clock } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";

interface VerificationPendingModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

const VerificationPendingModal: React.FC<VerificationPendingModalProps> = ({
  isOpen,
  onClose,
  message,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Verification Under Review"
      icon={<Clock className="h-6 w-6 text-blue-600" />}
    >
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Clock className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Application Under Review
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>{message}</p>
              </div>
            </div>
          </div>
        </div>
        
        <Button
          variant="primary"
          onClick={onClose}
          className="w-full"
        >
          OK
        </Button>
      </div>
    </Modal>
  );
};

export default VerificationPendingModal;