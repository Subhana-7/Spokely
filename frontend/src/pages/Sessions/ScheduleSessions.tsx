import { useEffect, useState } from "react";
import { Search, X, ArrowLeft } from "lucide-react";
import Button from "../../modals/Button";
import Input from "../../modals/Input";
import Card from "../../components/common/Cards";
import Badge from "../../components/common/Badge";
import { createSession } from "../../services/sessionService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ScheduleSession = () => {
  const [selectedMembers, setSelectedMembers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    type: "",
    topic: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/users/all", { withCredentials: true })
      .then((res) => setUsers(res.data))
      .catch(() => toast.error("Failed to fetch users"));
  }, []);

  const addMember = (member: any) => {
    if (!selectedMembers.find((m) => m._id === member._id)) {
      setSelectedMembers([...selectedMembers, member]);
    }
    setSearchTerm("");
  };

  const removeMember = (memberId: string) => {
    setSelectedMembers(selectedMembers.filter((m) => m._id !== memberId));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSchedule = async () => {
    try {

      const { type, topic, description, date, startTime, endTime } = formData;

      if (!type || !topic || !description || !date || !startTime || !endTime) {
        toast.error("Please fill in all fields");
        return;
      }

      const start = new Date(`${date}T${startTime}`);
      const end = new Date(`${date}T${endTime}`);
      console.log(start, end);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        toast.error("Invalid start or end time");
        return;
      }

      const payload = {
        type,
        topic,
        description,
        startTime: start,
        endTime: end,
        participants: selectedMembers.map((m) => m._id),
      };

      await createSession(payload);
      toast.success("Session scheduled successfully");
      navigate("/user/session");
    } catch (err: any) {
      console.error("Error scheduling session", err);
      toast.error("Failed to schedule session");
    }
  };

  const filteredResults = users.filter((member) =>
    member.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-400 to-lime-500">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <button className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors mr-4">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold text-white">
            Schedule Peer-to-Peer Session
          </h1>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card padding="lg">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange("type", e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">Select session type</option>
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="peer-to-peer">Peer-to-Peer</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Start Time
                    </label>
                    <Input
                      type="time"
                      value={formData.startTime}
                      onChange={(val) => handleInputChange("startTime", val)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      End Time
                    </label>
                    <Input
                      type="time"
                      value={formData.endTime}
                      onChange={(val) => handleInputChange("endTime", val)}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Topic
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter session topic"
                    value={formData.topic}
                    onChange={(val) => handleInputChange("topic", val)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    placeholder="Describe the session objectives and goals..."
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    className="w-full min-h-32 px-4 py-2 border border-black-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date
                  </label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(val) => handleInputChange("date", val)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Add Members
                  </label>
                  <div className="relative mb-4">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <Input
                      type="text"
                      placeholder="Search by name..."
                      value={searchTerm}
                      onChange={(val) => setSearchTerm(val)}
                      className="pl-10"
                    />
                  </div>

                  {searchTerm && (
                    <div className="mb-4 space-y-2">
                      {filteredResults.map((member) => (
                        <button
                          key={member._id}
                          onClick={() => addMember(member)}
                          className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{member.name}</span>
                            <Badge variant="peer" size="sm">
                              {member.level || "Unknown"}
                            </Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">
                      Selected Members:
                    </div>
                    {selectedMembers.length === 0 ? (
                      <p className="text-gray-500 text-sm">
                        No members selected
                      </p>
                    ) : (
                      selectedMembers.map((member) => (
                        <div
                          key={member._id}
                          className="flex items-center justify-between bg-amber-100 p-3 rounded-lg"
                        >
                          <div>
                            <span className="font-medium">{member.name}</span>
                            <Badge variant="peer" size="sm" className="ml-2">
                              {member.level || "Unknown"}
                            </Badge>
                          </div>
                          <button
                            onClick={() => removeMember(member._id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
              <button className="px-6 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-700 transition-colors">
                Cancel
              </button>
              <Button variant="primary" onClick={handleSchedule}>
                Schedule Session
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ScheduleSession;
