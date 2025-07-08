import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import Input from '../../../modals/Input';
import Button from '../../../modals/Button';
import { sendConnectionRequest, getConnectionRequests } from '../../../services/connection.service';
import toast from 'react-hot-toast';

interface AddConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PendingRequest {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
}

const AddConnectionModal: React.FC<AddConnectionModalProps> = ({ isOpen, onClose }) => {
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [incomingRequests, setIncomingRequests] = useState<PendingRequest[]>([]);

  const handleAddConnection = async () => {
    try {
      if (!referralCode.trim()) return toast.error("Enter referral code");
      setLoading(true);
      await sendConnectionRequest(referralCode.trim());
      toast.success("Connection request sent!");
      setReferralCode('');
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send request");
    } finally {
      setLoading(false);
    }
  };

  const fetchIncomingRequests = async () => {
    try {
      const res = await getConnectionRequests();
      setIncomingRequests(res.data);
    } catch (err: any) {
      toast.error("Failed to fetch incoming requests");
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchIncomingRequests();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-lime-200 rounded-2xl max-w-md w-full mx-4 relative animate-scale-in shadow-xl">
        <div className="flex justify-between items-center p-6 border-b border-lime-300">
          <h2 className="text-2xl font-bold text-gray-800 tracking-wide">ADD NEW CONNECTION</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 transition-colors p-2 rounded-full hover:bg-lime-300"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <Input
            type="text"
            placeholder="Enter user's referral code"
            value={referralCode}
            onChange={(val: string) => setReferralCode(val)}
            className="w-full bg-white border-0 rounded-xl py-3 text-base shadow-sm focus:ring-2 focus:ring-lime-500 focus:border-transparent mb-6"
          />
          <div className="flex justify-end gap-4">
            <Button onClick={onClose} className="bg-gray-500 text-white">Cancel</Button>
            <Button
              onClick={handleAddConnection}
              disabled={loading}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {loading ? "Sending..." : "Send Request"}
            </Button>
          </div>

          {/* Display incoming requests */}
          {incomingRequests.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Incoming Requests</h3>
              <ul className="space-y-2">
                {incomingRequests.map((req) => (
                  <li key={req._id} className="bg-white p-3 rounded-xl shadow-sm flex justify-between items-center">
                    <div>
                      <p className="font-medium">{req.userId.name}</p>
                      <p className="text-sm text-gray-500">{req.userId.email}</p>
                    </div>
                    {/* You can add Accept button later */}
                    <span className="text-sm text-orange-600 font-semibold">Pending</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddConnectionModal;
