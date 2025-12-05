import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Button from "../../modals/Button";
import Input from "../../modals/Input";
import Card from "../../components/common/Cards";
import { createSession } from "../../services/sessionService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

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

  const [_touched, setTouched] = useState<Record<string, boolean>>({});

  const navigate = useNavigate();

  const calculateEndTime = (startTime: string) => {
    if (!startTime) return "";
    const [hours, minutes] = startTime.split(":").map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    const endHours = endDate.getHours().toString().padStart(2, "0");
    const endMinutes = endDate.getMinutes().toString().padStart(2, "0");
    return `${endHours}:${endMinutes}`;
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

  const validateForm = (formData: FormData) => {
    const fieldErrors: Partial<FormErrors> = {};
    Object.keys(formData).forEach((field) => {
      const error = validateField(
        field,
        formData[field as keyof FormData] || "",
        formData
      );
      if (error) fieldErrors[field as keyof FormErrors] = error;
    });
    return fieldErrors;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const newFormData = { ...prev, [field]: value };
      if (field === "startTime" && value)
        newFormData.endTime = calculateEndTime(value);
      if (field === "type" && prev.startTime)
        newFormData.endTime = calculateEndTime(prev.startTime);
      return newFormData;
    });
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, value, { ...formData, [field]: value });
    setErrors((prev) => ({ ...prev, [field]: error, form: "" }));
  };

  const handleSchedule = async () => {
    try {
      const allFields = Object.keys(formData).reduce((acc, field) => {
        acc[field] = true;
        return acc;
      }, {} as Record<string, boolean>);
      setTouched(allFields);
      const formErrors = validateForm(formData);
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
        role: "Mentor",
      };
      if (type === "public" && price) payload.sessionFee = parseFloat(price);
      await createSession(payload);
      toast.success("Session scheduled successfully");
      navigate("/mentor/sessions");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to schedule session");
    }
  };

  const isFormValid = () => {
    const hasRequiredFields = Object.entries(formData).every(([key, value]) => {
      if (key === "price" && formData.type !== "public") return true;
      return value.trim() !== "";
    });
    const hasNoErrors = Object.values(errors).every((error) => !error);
    const hasParticipants = formData.type === "public";
    return hasRequiredFields && hasNoErrors && hasParticipants;
  };

  return (
    <div className="min-h-screen bg-slate-700">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors mr-4"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold text-white">Schedule Session</h1>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-slate-800 text-white p-6 rounded-lg">
            {errors.form && (
              <div className="mb-6 p-4 bg-red-600/20 border border-red-400 rounded-lg">
                <p className="text-red-300 text-sm">{errors.form}</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Type */}
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange("type", e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 ${
                      errors.type
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-600 focus:ring-emerald-400"
                    } bg-slate-700 text-white`}
                  >
                    <option value="">Select session type</option>
                    <option value="public">Public</option>
                  </select>
                  {errors.type && (
                    <p className="text-red-400 text-sm mt-1">{errors.type}</p>
                  )}
                </div>

                {/* Price */}
                {formData.type === "public" && (
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Price (₹) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter price in rupees"
                      value={formData.price || ""}
                      onChange={(val) => handleInputChange("price", val)}
                      className={
                        errors.price
                          ? "border-red-500 bg-slate-700 text-white"
                          : "bg-slate-700 text-white"
                      }
                    />
                    {errors.price && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.price}
                      </p>
                    )}
                  </div>
                )}

                {/* Date */}
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(val) => handleInputChange("date", val)}
                    className={
                      errors.date
                        ? "border-red-500 bg-slate-700 text-white"
                        : "bg-slate-700 text-white"
                    }
                  />
                  {errors.date && (
                    <p className="text-red-400 text-sm mt-1">{errors.date}</p>
                  )}
                </div>

                {/* Start & End Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Start Time <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="time"
                      value={formData.startTime}
                      onChange={(val) => handleInputChange("startTime", val)}
                      className={
                        errors.startTime
                          ? "border-red-500 bg-slate-700 text-white"
                          : "bg-slate-700 text-white"
                      }
                    />
                    {errors.startTime && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.startTime}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      End Time{" "}
                      <span className="text-gray-400 text-xs ml-1">(Auto)</span>
                    </label>
                    <Input
                      type="time"
                      value={formData.endTime}
                      disabled
                      className="bg-slate-700 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Topic */}
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Topic <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter session topic"
                    value={formData.topic}
                    onChange={(val) => handleInputChange("topic", val)}
                    className={
                      errors.topic
                        ? "border-red-500 bg-slate-700 text-white"
                        : "bg-slate-700 text-white"
                    }
                  />
                  {errors.topic && (
                    <p className="text-red-400 text-sm mt-1">{errors.topic}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    className={`w-full min-h-32 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 bg-slate-700 text-white ${
                      errors.description
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-600 focus:ring-emerald-400"
                    }`}
                  />
                  {errors.description && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Schedule Button */}
            <div className="mt-6">
              <Button
                onClick={handleSchedule}
                disabled={!isFormValid()}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
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
