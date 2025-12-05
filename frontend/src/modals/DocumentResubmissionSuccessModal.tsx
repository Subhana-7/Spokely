import React from "react";
import { CheckCircle, Mail } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";

interface DocumentResubmissionSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DocumentResubmissionSuccessModal: React.FC<
  DocumentResubmissionSuccessModalProps
> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Document Resubmitted Successfully"
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
                Document Successfully Submitted
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  Your document has been resubmitted for verification. Our team
                  will review your submission and get back to you shortly.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Mail className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Stay Updated
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Keep an eye on your email for updates regarding your document
                  verification status. We'll notify you once the review is
                  complete.
                </p>
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

export default DocumentResubmissionSuccessModal;
