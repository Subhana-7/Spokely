import { useEffect, useState } from "react";
import { CheckCircle, Clock, Mail, Plus, Users, X } from "lucide-react";
import Input from "../../../modals/Input";
import Button from "../../../modals/Button";
import {
  sendConnectionRequest,
  getConnectionRequests,
  getSentConnectionRequests,
  acceptConnectionRequest,
} from "../../../services/connectionService";
import toast from "react-hot-toast";

interface AddConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFetchIncomingCount?: (count: number) => void;
}

interface IncomingRequest {
  id: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
}

interface SentRequest {
  _id: string;
  connectedUser?: {
    _id: string;
    name: string;
    email: string;
  };
}

const AddConnectionModal: React.FC<AddConnectionModalProps> = ({
  isOpen,
  onClose,
  onFetchIncomingCount,
}) => {
  const [uniqueCode, setUniqueCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [incomingRequests, setIncomingRequests] = useState<IncomingRequest[]>(
    []
  );
  const [sentRequests, setSentRequests] = useState<SentRequest[]>([]);

  const fetchRequests = async () => {
    try {
      const [incomingRes, sentRes] = await Promise.all([
        getConnectionRequests(),
        getSentConnectionRequests(),
      ]);
      setIncomingRequests(incomingRes.data || []);
      setSentRequests(sentRes.data || []);
      onFetchIncomingCount?.((incomingRes.data || []).length);
    } catch (err) {
      toast.error("Failed to load connection requests");
    }
  };

  const handleAddConnection = async () => {
    if (!uniqueCode.trim()) return;
    setLoading(true);
    try {
      await sendConnectionRequest(uniqueCode.trim());
      toast.success("Connection request sent!");
      setUniqueCode("");
      fetchRequests();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send request");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      console.log(requestId, "req id");
      await acceptConnectionRequest(requestId);
      toast.success("Connection accepted!");
      fetchRequests();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to accept request");
    }
  };

  useEffect(() => {
    if (isOpen) fetchRequests();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full mx-4 relative shadow-2xl border border-white/20 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold mb-2">Add New Connection</h2>
              <p className="text-blue-100">Expand your professional network</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/10 transition-all p-3 rounded-full"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Add Connection Form */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                User Code
              </label>
              <Input
                type="text"
                placeholder="Enter user's referral code..."
                value={uniqueCode}
                onChange={setUniqueCode}
                className="text-lg"
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button
                onClick={onClose}
                variant="secondary"
                className="px-8 py-3bg-gray-600 text-white hover:bg-gray-700 bg-gray-600  rounded-xl "
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddConnection}
                disabled={loading || !uniqueCode.trim()}
                variant="danger"
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white focus:ring-green-500 shadow-lg hover:shadow-xl  rounded-xl"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Plus size={16} className="mr-2" />
                    Send Request
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Incoming Requests */}
          {incomingRequests.length > 0 ? (
            <div className="border-t pt-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Users size={16} className="text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  Incoming Requests ({incomingRequests.length})
                </h3>
              </div>

              <div className="space-y-4">
                {incomingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-lg">
                          {req.user?.name
                            ? req.user.name.charAt(0).toUpperCase()
                            : "?"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-lg">
                            {req.user?.name || "Unknown User"}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Mail size={12} />
                            {req.user?.email || "-"}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="success"
                        className="px-6 py-2"
                        onClick={() => handleAccept(req.id)}
                      >
                        <CheckCircle size={16} className="mr-2" />
                        Accept
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center mt-4">
              No incoming requests
            </p>
          )}

          {/* Sent Requests */}
          {sentRequests.length > 0 ? (
            <div className="border-t pt-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <Clock size={16} className="text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  Sent Requests ({sentRequests.length})
                </h3>
              </div>

              <div className="space-y-4">
                {sentRequests.map((req) => (
                  <div
                    key={req._id}
                    className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-2xl border border-orange-100"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-yellow-500 flex items-center justify-center text-white font-bold text-lg">
                          {req.connectedUser?.name
                            ? req.connectedUser.name.charAt(0).toUpperCase()
                            : "?"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-lg">
                            {req.connectedUser?.name || "Unknown User"}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Mail size={12} />
                            {req.connectedUser?.email || "-"}
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-semibold bg-orange-100 text-orange-700">
                        <Clock size={14} />
                        Pending
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center mt-4">No sent requests</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddConnectionModal;
