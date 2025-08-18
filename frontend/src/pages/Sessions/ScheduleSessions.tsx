import { useEffect, useState } from "react";
import { Search, X, ArrowLeft } from "lucide-react";
import Button from "../../modals/Button";
import Input from "../../modals/Input";
import Card from "../../components/common/Cards";
import Badge from "../../components/common/Badge";
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
        if (!/^[a-zA-Z0-9\s\-_.,!?()]+$/.test(value.trim()))
          return "Topic contains invalid characters";
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
        if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value))
          return "Please enter a valid time format (HH:MM)";
        if (formData.startTime && formData.date) {
          const startDateTime = new Date(
            `${formData.date}T${formData.startTime}`
          );
          const endDateTime = new Date(`${formData.date}T${value}`);
          if (isNaN(endDateTime.getTime())) return "Invalid end time";
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
      return "Please select at least one participant for private/peer-to-peer sessions";
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
    if (!selectedMembers.find((m) => m._id === member._id)) {
      setSelectedMembers((prev) => [...prev, member]);
    }
    setSearchTerm("");
  };

  const removeMember = (memberId: string) => {
    setSelectedMembers((prev) => prev.filter((m) => m._id !== memberId));
  };

  const handleSchedule = async () => {
    try {
      const formErrors = validateForm(formData, selectedMembers);
      if (Object.keys(formErrors).length > 0) {
        setErrors((prev) => ({ ...prev, ...formErrors }));
        toast.error("Please fix all validation errors before scheduling");
        return;
      }
      const { type, topic, description, date, startTime, endTime, price } =
        formData;
      const start = new Date(`${date}T${startTime}`);
      const end = new Date(`${date}T${endTime}`);
      const payload: any = {
        type,
        topic: topic.trim(),
        description: description.trim(),
        startTime: start,
        endTime: end,
        participants: selectedMembers.map((m) => m._id),
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
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-green-500 hover:shadow-md transition-all"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <h1 className="text-3xl font-semibold ml-4 tracking-tight">
            Schedule Peer-to-Peer Session
          </h1>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card
            padding="lg"
            className="bg-white shadow-md rounded-2xl border border-gray-200"
          >
            {/* Form error */}
            {errors.form && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {errors.form}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Type */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange("type", e.target.value)}
                    // onBlur={() => handleBlur("type")}
                    className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.type && touched.type
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Select session type</option>
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="peer-to-peer">Peer-to-Peer</option>
                  </select>
                  {errors.type && touched.type && (
                    <p className="text-red-500 text-xs mt-1">{errors.type}</p>
                  )}
                </div>

                {/* Price (only for public) */}
                {formData.type === "public" && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Price (₹) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter price"
                      value={formData.price || ""}
                      onChange={(val) => handleInputChange("price", val)}
                      className="bg-white"
                    />
                    {errors.price && touched.price && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.price}
                      </p>
                    )}
                  </div>
                )}

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(val) => handleInputChange("date", val)}
                    className="bg-white"
                  />
                  {errors.date && touched.date && (
                    <p className="text-red-500 text-xs mt-1">{errors.date}</p>
                  )}
                </div>

                {/* Times */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Start Time <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="time"
                      value={formData.startTime}
                      onChange={(val) => handleInputChange("startTime", val)}
                      className="bg-white"
                    />
                    {errors.startTime && touched.startTime && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.startTime}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      End Time <span className="text-red-500">*</span>
                      <span className="text-gray-400 text-xs ml-1">(Auto)</span>
                    </label>
                    <Input
                      type="time"
                      value={formData.endTime}
                      disabled
                      className="bg-gray-100"
                      onChange={() => {}}
                    />
                    {errors.endTime && touched.endTime && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.endTime}
                      </p>
                    )}
                  </div>
                </div>

                {/* Topic */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Topic <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter session topic"
                    value={formData.topic}
                    onChange={(val) => handleInputChange("topic", val)}
                    className="bg-white"
                  />
                  {errors.topic && touched.topic && (
                    <p className="text-red-500 text-xs mt-1">{errors.topic}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    // onBlur={() => handleBlur("description")}
                    className={`w-full px-4 py-2 bg-white rounded-lg border focus:ring-2 focus:ring-green-500 ${
                      errors.description && touched.description
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    rows={4}
                    placeholder="Describe session goals..."
                  />
                  {errors.description && touched.description && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column - Participants */}
              {formData.type !== "public" && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Add Participants <span className="text-red-500">*</span>
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
                        className="pl-10 bg-white"
                      />
                    </div>

                    {/* Search Results */}
                    {searchTerm && filteredResults.length > 0 && (
                      <div className="bg-white border border-gray-200 rounded-lg max-h-40 overflow-y-auto mb-4">
                        {filteredResults.map((member) => (
                          <button
                            key={member._id}
                            onClick={() => addMember(member)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center justify-between"
                          >
                            <span className="text-sm">
                              {member.connectionWith?.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              Click to add
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* No Results */}
                    {searchTerm &&
                      filteredResults.length === 0 &&
                      users.length > 0 && (
                        <div className="text-gray-500 text-sm py-2">
                          No users found matching "{searchTerm}"
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
                              className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
                            >
                              <span className="text-sm">
                                {member.connectionWith?.name}
                              </span>
                              <button
                                onClick={() => removeMember(member._id)}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Loading state */}
                    {formData.type === "peer-to-peer" && users.length === 0 && (
                      <div className="text-gray-500 text-sm">
                        Loading connections...
                      </div>
                    )}

                    {/* Error */}
                    {errors.participants && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.participants}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 mt-8 border-t border-gray-200 pt-6">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:border-green-500 hover:text-green-600 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSchedule}
                disabled={!isFormValid()}
                className="px-6 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Schedule Session
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ScheduleSession;
