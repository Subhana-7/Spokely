import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import Input from '../../../modals/Input';
import Button from '../../../modals/Button';
import {
  sendConnectionRequest,
  getConnectionRequests,
  getSentConnectionRequests,
  acceptConnectionRequest
} from '../../../services/connectionService';
import toast from 'react-hot-toast';

interface AddConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFetchIncomingCount?: (count: number) => void;
}

interface IncomingRequest {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
}

interface SentRequest {
  _id: string;
  connectedUserId: {
    _id: string;
    name: string;
    email: string;
  };
}

const AddConnectionModal: React.FC<AddConnectionModalProps> = ({
  isOpen,
  onClose,
  onFetchIncomingCount
}) => {
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [incomingRequests, setIncomingRequests] = useState<IncomingRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<SentRequest[]>([]);

  const fetchRequests = async () => {
    try {
      const [incoming, sent] = await Promise.all([
        getConnectionRequests(),
        getSentConnectionRequests()
      ]);

      setIncomingRequests(incoming.data);
      setSentRequests(sent.data);

      onFetchIncomingCount?.(incoming.data.length);
    } catch (err) {
      toast.error('Failed to fetch requests');
    }
  };

  const handleAddConnection = async () => {
    try {
      if (!referralCode.trim()) return toast.error('Enter referral code');
      setLoading(true);
      await sendConnectionRequest(referralCode.trim());
      toast.success('Connection request sent!');
      setReferralCode('');
      fetchRequests(); 
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      await acceptConnectionRequest(requestId);
      toast.success('Connection accepted!');
      fetchRequests();
    } catch {
      toast.error('Failed to accept request');
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRequests();
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
          <div className="flex justify-end gap-4 mb-6">
            <Button onClick={onClose} className="bg-gray-500 text-white">
              Cancel
            </Button>
            <Button
              onClick={handleAddConnection}
              disabled={loading}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {loading ? 'Sending...' : 'Send Request'}
            </Button>
          </div>
          {incomingRequests.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Incoming Requests</h3>
              <ul className="space-y-2">
                {incomingRequests.map((req) => (
                  <li
                    key={req._id}
                    className="bg-white p-3 rounded-xl shadow-sm flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{req.userId.name}</p>
                      <p className="text-sm text-gray-500">{req.userId.email}</p>
                    </div>
                    <Button
                      className="bg-green-600 text-white px-3 py-1 text-sm"
                      onClick={() => handleAccept(req._id)}
                    >
                      Accept
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {sentRequests.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Sent Requests</h3>
              <ul className="space-y-2">
                {sentRequests.map((req) => (
                  <li
                    key={req._id}
                    className="bg-white p-3 rounded-xl shadow-sm flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{req.connectedUserId.name}</p>
                      <p className="text-sm text-gray-500">{req.connectedUserId.email}</p>
                    </div>
                    <span className="text-sm text-orange-500 font-semibold">Pending</span>
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
