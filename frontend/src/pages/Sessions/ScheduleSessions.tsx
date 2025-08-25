import { useEffect, useState } from "react";
import { Search, X, ArrowLeft } from "lucide-react";
import Input from "../../modals/Input";
import { createSession } from "../../services/sessionService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { getAllConnections } from "../../services/connectionService";

interface FormData {
  type: string;
  topic: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  price?: string;
}

interface FormErrors {
  type: string;
  topic: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  participants: string;
  form: string;
  price?: string;
}

const ScheduleSession = () => {
  const [selectedMembers, setSelectedMembers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState<FormData>({
    type: "",
    topic: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    price: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    type: "",
    topic: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    participants: "",
    form: "",
    price: "",
  });

  const navigate = useNavigate();

  async function connectedUsers() {
    let res = await getAllConnections();
    return res;
  }

  useEffect(() => {
    if (formData.type === "peer-to-peer") {
      connectedUsers()
        .then((res) => setUsers(res.data))
        .catch(() => toast.error("Failed to fetch users"));
    } else {
      setUsers([]);
      setSelectedMembers([]);
    }
  }, [formData.type]);

  const calculateEndTime = (startTime: string) => {
    if (!startTime) return "";
    const [hours, minutes] = startTime.split(":").map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    return `${endDate.getHours().toString().padStart(2, "0")}:${endDate
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  const validateField = (field: string, value: string, formData: FormData) => {
    const now = new Date();
    const currentDate = now.toISOString().split("T")[0];
    const currentTime = now.toTimeString().slice(0, 5);

    switch (field) {
      case "type":
        if (!value.trim()) return "Session type is required";
        if (!["public", "private", "peer-to-peer"].includes(value))
          return "Please select a valid session type";
        return "";
      case "price":
        if (formData.type === "public") {
          if (!value.trim()) return "Price is required for public sessions";
          const priceNum = parseFloat(value);
          if (isNaN(priceNum) || priceNum < 0)
            return "Please enter a valid price";
          if (priceNum > 10000) return "Price cannot exceed ₹10,000";
        }
        return "";
      case "topic":
        if (!value.trim()) return "Topic is required";
        if (value.trim().length < 3)
          return "Topic must be at least 3 characters long";
        if (value.trim().length > 100)
          return "Topic must be less than 100 characters";
        return "";
      case "description":
        if (!value.trim()) return "Description is required";
        if (value.trim().length < 10)
          return "Description must be at least 10 characters long";
        if (value.trim().length > 500)
          return "Description must be less than 500 characters";
        return "";
      case "date":
        if (!value) return "Date is required";
        const selectedDate = new Date(value);
        if (isNaN(selectedDate.getTime())) return "Please enter a valid date";
        if (value < currentDate) return "Date cannot be in the past";
        const maxDate = new Date();
        maxDate.setMonth(maxDate.getMonth() + 6);
        if (selectedDate > maxDate)
          return "Cannot schedule more than 6 months in advance";
        return "";
      case "startTime":
        if (!value) return "Start time is required";
        if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value))
          return "Please enter a valid time format (HH:MM)";
        if (formData.date) {
          const startDateTime = new Date(`${formData.date}T${value}`);
          if (isNaN(startDateTime.getTime())) return "Invalid start time";
          if (formData.date === currentDate && value <= currentTime)
            return "Start time cannot be in the past";
        }
        return "";
      case "endTime":
        if (!value) return "End time is required";
        if (formData.startTime && formData.date) {
          const startDateTime = new Date(
            `${formData.date}T${formData.startTime}`
          );
          const endDateTime = new Date(`${formData.date}T${value}`);
          if (endDateTime <= startDateTime)
            return "End time must be after start time";
          const expectedEndTime = calculateEndTime(formData.startTime);
          if (value !== expectedEndTime)
            return "All sessions are limited to 1 hour duration";
        }
        return "";
      default:
        return "";
    }
  };

  const validateParticipants = (type: string, participants: any[]) => {
    if (type === "public") return "";
    if (
      (type === "private" || type === "peer-to-peer") &&
      participants.length === 0
    )
      return "Please select at least one participant";
    if (participants.length > 10) return "Maximum 10 participants allowed";
    return "";
  };

  const validateForm = (formData: FormData, participants: any[]) => {
    const fieldErrors: Partial<FormErrors> = {};
    Object.keys(formData).forEach((field) => {
      const error = validateField(
        field,
        formData[field as keyof FormData] || "",
        formData
      );
      if (error) fieldErrors[field as keyof FormErrors] = error;
    });
    const participantError = validateParticipants(formData.type, participants);
    if (participantError) fieldErrors.participants = participantError;
    return fieldErrors;
  };

  useEffect(() => {
    const formErrors = validateForm(formData, selectedMembers);
    setErrors((prev) => ({ ...prev, ...formErrors }));
  }, [formData, selectedMembers]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const newFormData = { ...prev, [field]: value };
      if (field === "startTime" && value) {
        newFormData.endTime = calculateEndTime(value);
      }
      return newFormData;
    });
  };

  const addMember = (member: any) => {
    if (
      !selectedMembers.find(
        (m) => m.connectionWith?._id === member.connectionWith?._id
      )
    ) {
      setSelectedMembers((prev) => [...prev, member]);
    }
    setSearchTerm("");
  };

  const removeMember = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.filter((m) => m.connectionWith?._id !== userId)
    );
  };

  const handleSchedule = async () => {
  try {
    const formErrors = validateForm(formData, selectedMembers);
    if (Object.keys(formErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...formErrors, form: "Fix highlighted errors" }));
      toast.error("Please fix all validation errors before scheduling");
      return;
    }

    const { type, topic, description, date, startTime, endTime, price } = formData;
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);

    const payload: any = {
      type,
      topic: topic.trim(),
      description: description.trim(),
      startTime: start,
      endTime: end,
      participants: selectedMembers.map((m) => ({
        user: m.connectionWith?._id,
        status: "pending",
      })),
    };

    if (type === "public" && price) payload.sessionFee = parseFloat(price);

    await createSession(payload);
    toast.success("Session scheduled successfully");
    navigate("/user/session");
  } catch (err: any) {
    toast.error(err.response?.data?.message || "Failed to schedule session");
  }
};


  const filteredResults = users.filter((member) =>
    member.connectionWith?.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const isFormValid = () => {
    const hasRequiredFields = Object.entries(formData).every(([key, value]) => {
      if (key === "price" && formData.type !== "public") return true;
      return value.trim() !== "";
    });
    const noFieldErrors = Object.values(
      validateForm(formData, selectedMembers)
    ).every((err) => !err);
    return hasRequiredFields && noFieldErrors;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-20">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 flex items-center mb-12">
        <button
          onClick={() => navigate(-1)}
          className="p-3 rounded-full bg-gradient-to-r from-gray-700 to-gray-800 border border-gray-700 shadow-md hover:scale-105 hover:shadow-lg transition-all"
        >
          <ArrowLeft size={20} className="text-gray-300" />
        </button>
        <h1 className="text-3xl font-bold ml-4 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent tracking-tight">
          Schedule Session
        </h1>
      </div>

      {/* Form */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="backdrop-blur-lg bg-white/10 rounded-2xl shadow-xl border border-white/10 p-8">
          {/* Form error */}
          {errors.form && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/40 rounded-lg text-sm text-red-300">
              {errors.form}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Type <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange("type", e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border bg-gray-900/60 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.type && touched.type
                      ? "border-red-500"
                      : "border-gray-700"
                  }`}
                >
                  <option value="">Select session type</option>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="peer-to-peer">Peer-to-Peer</option>
                </select>
              </div>

              {/* Price */}
              {formData.type === "public" && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Price (₹) <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter price"
                    value={formData.price || ""}
                    onChange={(val) => handleInputChange("price", val)}
                    className="bg-gray-900/60 text-white"
                  />
                </div>
              )}

              {/* Date */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Date <span className="text-red-400">*</span>
                </label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(val) => handleInputChange("date", val)}
                  className="bg-gray-900/60 text-white"
                />
              </div>

              {/* Times */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Start Time <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(val) => handleInputChange("startTime", val)}
                    className="bg-gray-900/60 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    End Time <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="time"
                    value={formData.endTime}
                    disabled
                    className="bg-gray-700 text-gray-400"
                    onChange={() => {}}
                  />
                </div>
              </div>

              {/* Topic */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Topic <span className="text-red-400">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Enter session topic"
                  value={formData.topic}
                  onChange={(val) => handleInputChange("topic", val)}
                  className="bg-gray-900/60 text-white"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  className="w-full px-4 py-3 bg-gray-900/60 text-white rounded-xl border border-gray-700 focus:ring-2 focus:ring-green-500"
                  rows={4}
                  placeholder="Describe session goals..."
                />
              </div>
            </div>

            {/* Right Column */}
            {formData.type !== "public" && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Add Participants <span className="text-red-400">*</span>
                  </label>

                  {/* Search Input */}
                  <div className="relative mb-4">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <Input
                      type="text"
                      placeholder="Search by name"
                      value={searchTerm}
                      onChange={(val) => setSearchTerm(val)}
                      className="pl-10 bg-gray-900/60 text-white placeholder-gray-400"
                    />
                  </div>

                  {/* Search Results */}
                  {searchTerm && filteredResults.length > 0 && (
                    <div className="bg-gray-900/50 border border-gray-700 rounded-xl max-h-40 overflow-y-auto mb-4">
                      {filteredResults.map((member) => (
                        <button
                          key={member._id}
                          onClick={() => addMember(member)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-800 flex items-center justify-between"
                        >
                          <span className="text-sm">
                            {member.connectionWith?.name}
                          </span>
                          <span className="text-xs text-gray-400">
                            Click to add
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Selected Members */}
                  {selectedMembers.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">
                        Selected Participants ({selectedMembers.length})
                      </h4>
                      <div className="space-y-2">
                        {selectedMembers.map((member) => (
                          <div
                            key={member._id}
                            className="flex items-center justify-between bg-gray-800/60 px-3 py-2 rounded-lg"
                          >
                            <span className="text-sm">
                              {member.connectionWith?.name}
                            </span>
                            <button
                              onClick={() => removeMember(member._id)}
                              className="text-red-400 hover:text-red-600 p-1"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 mt-10 border-t border-gray-800 pt-6">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 rounded-full bg-gray-800 border border-gray-700 text-gray-300 hover:text-white hover:scale-105 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSchedule}
              disabled={!isFormValid()}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Schedule Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleSession;