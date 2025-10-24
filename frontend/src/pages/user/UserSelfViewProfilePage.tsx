import { useState } from "react";
import DashboardHeader from "./DashBoardComponents/Header";
import SpokelyCard from "../../components/common/Cards";
import {
  Award,
  Camera,
  Edit,
  Mail,
  Phone,
  Star,
  TrendingUp,
  User,
  Zap,
  Lock,
} from "lucide-react";
import Badge from "../../components/common/Badge";
import { useAuthStore } from "../../store/userAuthStore";
import { editUserDetails, changePassword } from "../../services/authServices";
import { uploadImageToCloudinary } from "../../utilis/cloudinary ";
import ChangePasswordModal from "../../modals/ChangePassword";
import SuccessModal from "../../modals/SuccessModal"; // ✅ import

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const { user, setUser } = useAuthStore();
  console.log("user", user?.id);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone ? String(user.phone) : "",
    uniqueCode: user?.uniqueCode || "",
    profilePicture: user?.profilePicture || "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false); // ✅ new state

  const userId = user?.id;

  const validateField = (name: string, value: string) => {
    let error = "";
    if (name === "name") {
      if (!value.trim()) {
        error = "Name is required.";
      } else if (value.length < 3) {
        error = "Name must be at least 3 characters.";
      }
    }
    if (name === "phone") {
      const phoneRegex = /^[0-9]{10}$/;
      if (!value.trim()) {
        error = "Phone number is required.";
      } else if (!phoneRegex.test(value)) {
        error = "Enter a valid 10-digit phone number.";
      }
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
  };

  const handleProfilePicUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setLoading(true);
      const url = await uploadImageToCloudinary(file);
      setFormData((prev) => ({ ...prev, profilePicture: url }));
    } catch (err) {
      console.error("Profile pic upload failed:", err);
      alert("Failed to upload profile picture. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      !errors.name &&
      !errors.phone &&
      formData.name.trim().length >= 3 &&
      /^[0-9]{10}$/.test(formData.phone)
    );
  };

  const handleSave = async () => {
    console.log("Saving with data:", formData);
    validateField("name", formData.name);
    validateField("phone", formData.phone);

    if (!isFormValid()) return;

    try {
      setLoading(true);
      if (!user?.id || !user?.role) return;

      const payload = {
        ...formData,
        phone: Number(formData.phone),
      };

      const updated = await editUserDetails(user.id, user.role, payload);
      setUser(updated);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update user:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (oldPass: string, newPass: string) => {
    const payload = {
      currentPassword: oldPass,
      newPassword: newPass,
      id: userId,
    };
    await changePassword("user", payload);
    setIsPasswordModalOpen(false); // close modal
    setIsSuccessModalOpen(true); // show success modal
  };

  return (
    <div
      className="min-h-screen text-white relative bg-cover bg-center"
      style={{ backgroundImage: `url('/gradient-bg.jpg')` }}
    >
      <DashboardHeader />

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Profile Overview</h1>
          <p className="text-gray-200">
            Manage your account settings and track your learning journey
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Left Column */}
          <div className="xl:col-span-1">
            <SpokelyCard className="p-8 bg-white/10 border shadow-lg text-white">
              <div className="text-center">
                {/* Profile Image */}
                <div className="relative mb-6">
                  <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full p-1 mx-auto">
                    <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                      {formData.profilePicture ? (
                        <img
                          src={formData.profilePicture}
                          alt="profile"
                          className="rounded-full w-full h-full object-cover"
                        />
                      ) : (
                        <User size={48} className="text-gray-600" />
                      )}
                    </div>
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-2 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200 cursor-pointer">
                      <Camera size={16} className="text-gray-600" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePicUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <h2 className="text-2xl font-bold mb-3">
                  {user?.name || "User Name"}
                </h2>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Badge variant="peer">
                    <Star size={14} className="mr-1" />
                    {user?.tags?.[0] || "Beginner"}
                  </Badge>
                </div>

                {/* Streak Counter */}
                <div className="bg-gradient-to-r from-amber-100/20 to-orange-100/20 border border-amber-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-center gap-2 text-amber-300">
                    <Zap size={18} />
                    <span className="font-semibold">15-Day Streak</span>
                  </div>
                </div>
              </div>
            </SpokelyCard>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <SpokelyCard className="p-6 text-center bg-white/10 border shadow-lg">
                <div className="text-3xl font-bold text-indigo-300 mb-2">
                  {user?.sessionsDone ?? 0}
                </div>
                <div className="text-sm text-gray-200 font-medium">
                  Sessions
                </div>
              </SpokelyCard>
              <SpokelyCard className="p-6 text-center bg-white/10 border shadow-lg">
                <div className="text-3xl font-bold text-purple-300 mb-2">23</div>
                <div className="text-sm text-gray-200 font-medium">Levels</div>
              </SpokelyCard>
            </div>
          </div>

          {/* Middle Column */}
          {/* <div className="xl:col-span-2"> */}
            {/* Progress */}
            {/* <SpokelyCard className="p-8 mb-6 bg-white/10 border shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center">
                  <TrendingUp size={24} className="mr-3 text-indigo-300" />
                  Learning Progress
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold">
                      Overall Progress
                    </span>
                    <span className="text-3xl font-bold text-indigo-300">
                      87%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100/30 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: "87%" }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-200 mt-2">
                    Excellent progress! Keep it up.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-4">This Week</h4>
                  <div className="flex gap-2">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                      (day, index) => (
                        <div key={day} className="flex-1 text-center">
                          <div className="text-xs text-gray-300 mb-1">
                            {day}
                          </div>
                          <div
                            className={`h-12 rounded-lg ${
                              index < 5
                                ? "bg-gradient-to-t from-indigo-500 to-purple-600"
                                : "bg-gray-100/20"
                            }`}
                          ></div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </SpokelyCard> */}

            {/* Achievements */}
            {/* <SpokelyCard className="p-8 bg-white/10 border shadow-lg">
              <h3 className="text-xl font-bold flex items-center mb-6">
                <Award size={24} className="mr-3 text-indigo-300" />
                Recent Achievements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center p-4 bg-gradient-to-r from-purple-50/10 to-indigo-50/10 rounded-xl border border-purple-200/30">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mr-4">
                    <Star size={20} className="text-white" />
                  </div>
                  <div>
                    <div className="font-semibold">Grammar Master</div>
                    <div className="text-sm text-gray-300">
                      Completed advanced grammar
                    </div>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-gradient-to-r from-amber-50/10 to-orange-50/10 rounded-xl border border-amber-200/30">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mr-4">
                    <Zap size={20} className="text-white" />
                  </div>
                  <div>
                    <div className="font-semibold">Streak Warrior</div>
                    <div className="text-sm text-gray-300">
                      15 consecutive days
                    </div>
                  </div>
                </div>
              </div>
            </SpokelyCard> */}
          {/* </div> */}

          {/* Right Column - Account Settings */}
          <div className="xl:col-span-1">
            <SpokelyCard className="p-8 mb-6 bg-white/10 border shadow-lg text-white">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Account Settings</h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 text-sm font-medium"
                  >
                    <Edit size={16} className="mr-2" />
                    Edit
                  </button>
                ) : (
                  <button
                    onClick={handleSave}
                    disabled={loading || !isFormValid()}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 text-sm font-medium disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Name */}
                <div className="group">
                  <label className="block text-sm font-medium mb-2 flex items-center">
                    <User size={16} className="mr-2" /> Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    readOnly={!isEditing}
                    className={`w-full p-4 border rounded-xl text-black ${
                      isEditing
                        ? "bg-white focus:ring-2 focus:ring-indigo-500 border-gray-200"
                        : "bg-gray-50 border-gray-200"
                    } transition-all duration-200`}
                  />
                  {errors.name && (
                    <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Email (always read-only) */}
                <div className="group">
                  <label className="block text-sm font-medium mb-2 flex items-center">
                    <Mail size={16} className="mr-2" /> Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    readOnly
                    className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed text-black"
                  />
                </div>

                {/* Unique Code (always read-only) */}
                <div className="group">
                  <label className="block text-sm font-medium mb-2 flex items-center">
                    <Mail size={16} className="mr-2" /> Unique Code
                  </label>
                  <input
                    type="text"
                    name="uniqueCode"
                    value={formData.uniqueCode}
                    readOnly
                    className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed text-black"
                  />
                </div>

                {/* Phone */}
                <div className="group">
                  <label className="block text-sm font-medium mb-2 flex items-center">
                    <Phone size={16} className="mr-2" /> Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    readOnly={!isEditing}
                    className={`w-full p-4 border rounded-xl text-black ${
                      isEditing
                        ? "bg-white focus:ring-2 focus:ring-indigo-500 border-gray-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                {/* Change Password Button */}
                <button
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-medium hover:shadow-lg transition-all duration-200 flex items-center justify-center"
                >
                  <Lock size={16} className="mr-2" />
                  Change Password
                </button>
              </div>
            </SpokelyCard>
          </div>
        </div>
      </main>

      {/* 🔹 Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSubmit={handlePasswordChange}
      />

      {/* 🔹 Success Modal */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        message="Your password has been successfully updated."
      />
    </div>
  );
};

export default UserProfile;
