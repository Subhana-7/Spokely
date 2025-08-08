import { useEffect, useState } from "react";
import { Search, X, ArrowLeft } from "lucide-react";
import Button from "../../modals/Button";
import Input from "../../modals/Input";
import Card from "../../components/common/Cards";
import Badge from "../../components/common/Badge";
import { createSession } from "../../services/sessionService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { getSessions } from "../../services/sessionService";

interface FormData {
  type: string;
  topic: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
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
}

const ScheduleSession = () => {
  const [selectedMembers, setSelectedMembers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [formData, setFormData] = useState<FormData>({
    type: "",
    topic: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
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
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const navigate = useNavigate();

  useEffect(() => {
    getSessions()
      .then((res) => setUsers(res.data))
      .catch(() => toast.error("Failed to fetch users"));
  }, []);

  // Validation functions
  const validateField = (field: string, value: string, formData: FormData) => {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);

    switch (field) {
      case "type":
        if (!value.trim()) {
          return "Session type is required";
        }
        if (!["public", "private", "peer-to-peer"].includes(value)) {
          return "Please select a valid session type";
        }
        return "";

      case "topic":
        if (!value.trim()) {
          return "Topic is required";
        }
        if (value.trim().length < 3) {
          return "Topic must be at least 3 characters long";
        }
        if (value.trim().length > 100) {
          return "Topic must be less than 100 characters";
        }
        if (!/^[a-zA-Z0-9\s\-_.,!?()]+$/.test(value.trim())) {
          return "Topic contains invalid characters";
        }
        return "";

      case "description":
        if (!value.trim()) {
          return "Description is required";
        }
        if (value.trim().length < 10) {
          return "Description must be at least 10 characters long";
        }
        if (value.trim().length > 500) {
          return "Description must be less than 500 characters";
        }
        return "";

      case "date":
        if (!value) {
          return "Date is required";
        }
        const selectedDate = new Date(value);
        if (isNaN(selectedDate.getTime())) {
          return "Please enter a valid date";
        }
        if (value < currentDate) {
          return "Date cannot be in the past";
        }
        // Don't allow scheduling more than 6 months in advance
        const maxDate = new Date();
        maxDate.setMonth(maxDate.getMonth() + 6);
        if (selectedDate > maxDate) {
          return "Cannot schedule more than 6 months in advance";
        }
        return "";

      case "startTime":
        if (!value) {
          return "Start time is required";
        }
        if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
          return "Please enter a valid time format (HH:MM)";
        }
        if (formData.date) {
          const startDateTime = new Date(`${formData.date}T${value}`);
          if (isNaN(startDateTime.getTime())) {
            return "Invalid start time";
          }
          // If it's today, check if time is in the past
          if (formData.date === currentDate && value <= currentTime) {
            return "Start time cannot be in the past";
          }
          // Check minimum advance notice (15 minutes from now)
          const minStartTime = new Date(now.getTime() + 15 * 60 * 1000);
          if (startDateTime < minStartTime) {
            return "Session must be scheduled at least 15 minutes in advance";
          }
        }
        return "";

      case "endTime":
        if (!value) {
          return "End time is required";
        }
        if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
          return "Please enter a valid time format (HH:MM)";
        }
        if (formData.startTime && formData.date) {
          const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
          const endDateTime = new Date(`${formData.date}T${value}`);
          
          if (isNaN(endDateTime.getTime())) {
            return "Invalid end time";
          }
          if (endDateTime <= startDateTime) {
            return "End time must be after start time";
          }
          
          // Check maximum session duration (4 hours)
          const maxDuration = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
          if (endDateTime.getTime() - startDateTime.getTime() > maxDuration) {
            return "Session cannot exceed 4 hours";
          }
          
          // Check minimum session duration (15 minutes)
          const minDuration = 15 * 60 * 1000; // 15 minutes in milliseconds
          if (endDateTime.getTime() - startDateTime.getTime() < minDuration) {
            return "Session must be at least 15 minutes long";
          }
        }
        return "";

      default:
        return "";
    }
  };

  const validateParticipants = (type: string, participants: any[]) => {
    if (type === "public") {
      return ""; // Public sessions don't require participants
    }
    if (type === "private" || type === "peer-to-peer") {
      if (participants.length === 0) {
        return "Please select at least one participant for private/peer-to-peer sessions";
      }
      if (participants.length > 10) {
        return "Maximum 10 participants allowed";
      }
    }
    return "";
  };

  const validateForm = (formData: FormData, participants: any[]) => {
    const fieldErrors: Partial<FormErrors> = {};
    
    // Validate all fields
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field as keyof FormData], formData);
      if (error) {
        fieldErrors[field as keyof FormErrors] = error;
      }
    });

    // Validate participants
    const participantError = validateParticipants(formData.type, participants);
    if (participantError) {
      fieldErrors.participants = participantError;
    }

    return fieldErrors;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Mark field as touched
    setTouched(prev => ({ ...prev, [field]: true }));

    // Real-time validation
    const error = validateField(field, value, { ...formData, [field]: value });
    setErrors((prev) => ({ ...prev, [field]: error, form: "" }));

    // Re-validate related fields
    if (field === "date" || field === "startTime") {
      if (formData.startTime || value) {
        const startError = validateField("startTime", field === "startTime" ? value : formData.startTime, { ...formData, [field]: value });
        setErrors(prev => ({ ...prev, startTime: startError }));
      }
      if (formData.endTime) {
        const endError = validateField("endTime", formData.endTime, { ...formData, [field]: value });
        setErrors(prev => ({ ...prev, endTime: endError }));
      }
    }

    if (field === "startTime" && formData.endTime) {
      const endError = validateField("endTime", formData.endTime, { ...formData, [field]: value });
      setErrors(prev => ({ ...prev, endTime: endError }));
    }

    if (field === "type") {
      const participantError = validateParticipants(value, selectedMembers);
      setErrors(prev => ({ ...prev, participants: participantError }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const addMember = (member: any) => {
    if (!selectedMembers.find((m) => m._id === member._id)) {
      const newMembers = [...selectedMembers, member];
      setSelectedMembers(newMembers);
      
      // Re-validate participants
      const participantError = validateParticipants(formData.type, newMembers);
      setErrors(prev => ({ ...prev, participants: participantError }));
    }
    setSearchTerm("");
  };

  const removeMember = (memberId: string) => {
    const newMembers = selectedMembers.filter((m) => m._id !== memberId);
    setSelectedMembers(newMembers);
    
    // Re-validate participants
    const participantError = validateParticipants(formData.type, newMembers);
    setErrors(prev => ({ ...prev, participants: participantError }));
  };

  const handleSchedule = async () => {
    try {
      // Mark all fields as touched
      const allFields = Object.keys(formData).reduce((acc, field) => {
        acc[field] = true;
        return acc;
      }, {} as Record<string, boolean>);
      setTouched(allFields);

      // Validate entire form
      const formErrors = validateForm(formData, selectedMembers);
      
      if (Object.keys(formErrors).length > 0) {
        setErrors(prev => ({ ...prev, ...formErrors }));
        toast.error("Please fix all validation errors before scheduling");
        return;
      }

      const { type, topic, description, date, startTime, endTime } = formData;
      const start = new Date(`${date}T${startTime}`);
      const end = new Date(`${date}T${endTime}`);

      const payload = {
        type,
        topic: topic.trim(),
        description: description.trim(),
        startTime: start,
        endTime: end,
        participants: selectedMembers.map((m) => m._id),
      };

      let res = await createSession(payload);
      console.log(res)
      toast.success("Session scheduled successfully");
      navigate("/user/session");
    } catch (err: any) {
      console.error("Error scheduling session", err);
      const errorMessage = err.response?.data?.message || "Failed to schedule session";
      toast.error(errorMessage);
      setErrors(prev => ({ ...prev, form: errorMessage }));
    }
  };

  const filteredResults = users.filter((member) =>
    member.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isFormValid = () => {
    return Object.values(errors).every(error => !error) &&
           Object.values(formData).every(value => value.trim() !== "") &&
           (formData.type === "public" || selectedMembers.length > 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-400 to-lime-500">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors mr-4"
          >
            <ArrowLeft size={24} />
          </button>

          <h1 className="text-3xl font-bold text-white">
            Schedule Peer-to-Peer Session
          </h1>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card padding="lg">
            {errors.form && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{errors.form}</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange("type", e.target.value)}
                    onBlur={() => handleBlur("type")}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.type && touched.type
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-emerald-500"
                    }`}
                  >
                    <option value="">Select session type</option>
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="peer-to-peer">Peer-to-Peer</option>
                  </select>
                  {errors.type && touched.type && (
                    <p className="text-red-500 text-sm mt-1">{errors.type}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(val) => handleInputChange("date", val)}
                    className={errors.date && touched.date ? "border-red-500" : ""}
                  />
                  {errors.date && touched.date && (
                    <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Start Time <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="time"
                      value={formData.startTime}
                      onChange={(val) => handleInputChange("startTime", val)}
                      className={errors.startTime && touched.startTime ? "border-red-500" : ""}
                    />
                    {errors.startTime && touched.startTime && (
                      <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      End Time <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="time"
                      value={formData.endTime}
                      onChange={(val) => handleInputChange("endTime", val)}
                      className={errors.endTime && touched.endTime ? "border-red-500" : ""}
                    />
                    {errors.endTime && touched.endTime && (
                      <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Topic <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter session topic (3-100 characters)"
                    value={formData.topic}
                    onChange={(val) => handleInputChange("topic", val)}
                    // onBlur={() => handleBlur("topic")}
                    className={errors.topic && touched.topic ? "border-red-500" : ""}
                  />
                  <div className="flex justify-between items-center mt-1">
                    {errors.topic && touched.topic && (
                      <p className="text-red-500 text-sm">{errors.topic}</p>
                    )}
                    <p className="text-gray-400 text-sm ml-auto">
                      {formData.topic.length}/100
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    placeholder="Describe the session objectives and goals... (10-500 characters)"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    onBlur={() => handleBlur("description")}
                    className={`w-full min-h-32 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.description && touched.description
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-emerald-500"
                    }`}
                  />
                  <div className="flex justify-between items-center mt-1">
                    {errors.description && touched.description && (
                      <p className="text-red-500 text-sm">{errors.description}</p>
                    )}
                    <p className="text-gray-400 text-sm ml-auto">
                      {formData.description.length}/500
                    </p>
                  </div>
                </div>

                {formData.type !== "public" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Add Participants <span className="text-red-500">*</span>
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

                    {searchTerm && filteredResults.length > 0 && (
                      <div className="mb-4 space-y-2 max-h-40 overflow-y-auto">
                        {filteredResults.map((member) => (
                          <button
                            key={member._id}
                            onClick={() => addMember(member)}
                            disabled={selectedMembers.find((m) => m._id === member._id)}
                            className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

                    {searchTerm && filteredResults.length === 0 && (
                      <div className="mb-4 p-3 text-center text-gray-500 bg-gray-50 rounded-lg">
                        No users found matching "{searchTerm}"
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700">
                        Selected Participants ({selectedMembers.length}/10):
                      </div>
                      {selectedMembers.length === 0 ? (
                        <p className="text-gray-500 text-sm">
                          No participants selected
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {selectedMembers.map((member) => (
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
                          ))}
                        </div>
                      )}
                      {errors.participants && (
                        <p className="text-red-500 text-sm mt-1">{errors.participants}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
              <button 
                onClick={() => navigate(-1)}
                className="px-6 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <Button
                variant="primary"
                onClick={handleSchedule}
                disabled={!isFormValid()}
              >
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