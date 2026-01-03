import { CheckCircle } from "lucide-react";
import Modal from "./Modal";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  message,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Success"
      icon={<CheckCircle size={28} className="text-green-600" />}
    >
      <div className="text-center">
        <p className="text-gray-200 mb-6">{message}</p>
        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
        >
          OK
        </button>
      </div>
    </Modal>
  );
};

export default SuccessModal;
