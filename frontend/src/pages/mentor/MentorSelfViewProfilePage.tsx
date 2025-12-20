import { useState, useEffect } from "react";
import MentorHeader from "./DashboardComponents/Header";
import SpokelyCard from "../../components/common/Cards";
import {
  Award,
  Book,
  Calendar,
  Camera,
  Edit,
  Star,
  User,
  Lock,
} from "lucide-react";
import { useAuthStore } from "../../store/userAuthStore";
import {
  getMentorPlans,
  saveMentorPlans,
} from "../../services/subscriptionService";
import { editUserDetails, changePassword } from "../../services/authServices";
import { uploadImageToCloudinary } from "../../utilis/cloudinary ";
import ChangePasswordModal from "../../modals/ChangePassword";
import SuccessModal from "../../modals/SuccessModal";

const MentorProfile = () => {
  const { user, setUser } = useAuthStore();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [bio, setBio] = useState("");
  const [mentorDetails, setMentorDetails] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [profilePic, setProfilePic] = useState(user?.profilePicture || "");
  const [plans, setPlans] = useState<
    { type: string; price: number; time: number; saved?: boolean }[]
  >([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [showSaveModal, setShowSaveModal] = useState<{
    show: boolean;
    message: string;
  }>({ show: false, message: "" });
  const [_loadingUpload, setLoadingUpload] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setMentorDetails({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone?.toString() || "",
        bio: user.bio || "",
      });
      setBio(user.bio || "");
      setProfilePic(user.profilePicture || "");
      setSelectedTags((user as any).tags || []);
    }
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;
    const fetchPlans = async () => {
      setLoadingPlans(true);
      try {
        const res = await getMentorPlans(user.id);
        setPlans((res.data || []).map((p: any) => ({ ...p, saved: true })));
      } catch (err) {
        console.error("Failed to fetch mentor plans:", err);
        setPlans([]);
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, [user]);

  const addTag = (tag: string) => {
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter((tag) => tag !== tagToRemove));
  };

  const handleProfilePicUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setLoadingUpload(true);
      const url = await uploadImageToCloudinary(file);
      setProfilePic(url);
      if (user?.id) {
        const updated = await editUserDetails(user.id, "mentor", {
          profilePicture: url,
        });
        setUser({ ...user, ...updated });
      }
    } catch (err) {
      console.error("Profile pic upload failed:", err);
      alert("Failed to upload profile picture.");
    } finally {
      setLoadingUpload(false);
    }
  };

  const validateFields = () => {
    const newErrors: { [key: string]: string } = {};
    if (!mentorDetails.name.trim()) newErrors.name = "Name is required.";
    if (!mentorDetails.phone.trim()) newErrors.phone = "Phone is required.";
    else if (!/^\d{10,15}$/.test(mentorDetails.phone.trim()))
      newErrors.phone = "Enter a valid phone number.";
    if (!bio.trim()) newErrors.bio = "Bio is required.";
    else if (bio.trim().length > 500)
      newErrors.bio = "Bio cannot exceed 500 characters.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!validateFields()) return;
    try {
      const updatedData = {
        ...mentorDetails,
        bio,
        tags: selectedTags,
        profilePicture: profilePic,
      };
      const res = await editUserDetails(user.id, "mentor", updatedData);
      setMentorDetails({ ...mentorDetails, bio });
      setUser({ ...user, ...res });
      setShowSaveModal({
        show: true,
        message: "Details updated successfully!",
      });
    } catch (err) {
      console.error("Failed to update details:", err);
      setShowSaveModal({ show: true, message: "Failed to update details." });
    } finally {
      setShowEditModal(false);
    }
  };

  const handleSavePlans = async () => {
    if (!user) return;
    try {
      await saveMentorPlans(user.id, plans);
      setShowSaveModal({
        show: true,
        message: "Plans saved successfully!",
      });
      const res = await getMentorPlans(user.id);
      setPlans((res.data || []).map((p: any) => ({ ...p, saved: true })));
    } catch (err) {
      console.error("Failed to save plans:", err);
      setShowSaveModal({
        show: true,
        message: "Failed to save plans.",
      });
    }
  };

  const handlePasswordChange = async (oldPass: string, newPass: string) => {
    if (!user?.id) return;
    const payload = {
      currentPassword: oldPass,
      newPassword: newPass,
      id: user.id,
    };
    await changePassword("mentor", payload);
    setIsPasswordModalOpen(false);
    setIsSuccessModalOpen(true);
  };

  const planTypes = ["DAILY", "WEEKLY", "BIWEEKLY", "TRIWEEKLY"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <MentorHeader />

      <div className="max-w-7xl mx-auto p-8 space-y-10">
        {/* Hero Section */}
        <SpokelyCard className="p-10 bg-white/10 backdrop-blur-lg border border-white/20 flex flex-col md:flex-row items-center md:items-start gap-10">
          <div className="relative">
            <div className="w-40 h-40 rounded-2xl overflow-hidden bg-gray-800 border border-gray-700">
              {profilePic ? (
                <img src={profilePic} className="w-full h-full object-cover" />
              ) : (
                <User size={60} className="text-gray-400 mx-auto mt-10" />
              )}
            </div>
            <label className="absolute bottom-2 right-2 bg-gray-900 p-3 rounded-xl border border-gray-700 cursor-pointer hover:scale-105 transition">
              <Camera size={18} />
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePicUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold text-gray-200">
              {mentorDetails.name}
            </h1>
            <h3 className="font-bold text-gray-300">{mentorDetails.email}</h3>
            <h3 className="text-green-300 flex items-center gap-2">
              <Star size={16} /> Mentor
            </h3>
            <p className="text-gray-300">{mentorDetails.bio}</p>

            <div className="grid grid-cols-3 gap-6 mt-6">
              {[
                {
                  label: "Sessions Done",
                  value: (user as any)?.sessionsDone || 0,
                },
                {
                  label: "Experience",
                  value: (user as any)?.experience || "0",
                },
                { label: "Success Rate", value: "98%" },
              ].map((s, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 text-center"
                >
                  <div className="text-xl font-bold text-green-400">
                    {s.value}
                  </div>
                  <div className="text-sm text-gray-300">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </SpokelyCard>

        {/* GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-8">
            <SpokelyCard className="p-8 bg-white/10 border border-white/20">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                  <Book size={22} className="text-green-400" /> About Me
                </h2>
                <button
                  className="px-4 py-2 bg-green-600 rounded-xl flex items-center gap-2 text-sm hover:bg-green-700"
                  onClick={() => setShowEditModal(true)}
                >
                  <Edit size={16} /> Edit
                </button>
              </div>

              <p className="text-gray-300 leading-relaxed">
                {mentorDetails.bio}
              </p>

              <h3 className="mt-8 mb-4 font-semibold">Skills & Expertise</h3>
              <div className="flex flex-wrap gap-3">
                {selectedTags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-4 py-2 bg-green-900/40 border border-green-500/30 rounded-full text-sm text-green-300 flex items-center gap-2"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="text-green-400 hover:text-green-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="Add skill..."
                  className="px-3 py-1 rounded-xl text-black"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const target = e.target as HTMLInputElement;
                      addTag(target.value.trim());
                      target.value = "";
                      e.preventDefault();
                    }
                  }}
                />
              </div>
            </SpokelyCard>
          </div>

          {/* RIGHT */}
          <div className="space-y-8">
            <SpokelyCard className="p-6 bg-white/10 border border-white/20">
              <h2 className="font-bold mb-6 text-white">Account Settings</h2>
              <button
                className="w-full mb-4 bg-blue-600 hover:bg-blue-700 py-3 rounded-xl flex items-center justify-center gap-2"
                onClick={() => setShowEditModal(true)}
              >
                <Edit size={16} /> Edit Details
              </button>
              <button
                className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-xl flex items-center justify-center gap-2"
                onClick={() => setIsPasswordModalOpen(true)}
              >
                <Lock size={16} /> Change Password
              </button>
            </SpokelyCard>
          </div>
        </div>

        {/* ✅ FULL WIDTH SUBSCRIPTION PLANS — ORIGINAL LOGIC PRESERVED */}
        <SpokelyCard className="p-6 bg-white/10 border border-white/20">
          <h2 className="font-bold mb-6 text-lg text-white">
            Subscription Plans
          </h2>

          {loadingPlans ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
              <span className="ml-3 text-gray-300">Loading plans...</span>
            </div>
          ) : (
            <>
              {plans.length === 0 && (
                <div className="text-center py-8">
                  <Calendar size={48} className="mx-auto text-gray-500 mb-3" />
                  <p className="text-gray-400 text-sm">No plans added yet.</p>
                </div>
              )}

              <div className="space-y-3">
                {planTypes.map((type) => {
                  const plan = plans.find((p) => p.type === type);
                  const isActive = !!plan;
                  const isSaved = plan?.saved;

                  return (
                    <div
                      key={type}
                      className={`relative p-4 rounded-xl border transition-all duration-200 ${
                        isActive
                          ? "bg-green-900/20 border-green-500/40 shadow-sm"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isActive}
                            disabled={isSaved}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPlans([
                                  ...plans,
                                  { type, price: 0, time: 9, saved: false },
                                ]);
                              } else {
                                setPlans(plans.filter((p) => p.type !== type));
                              }
                            }}
                            className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                          />
                          <span className="font-medium text-white capitalize">
                            {type.toLowerCase()} Plan
                          </span>
                          {isSaved && (
                            <span className="px-2 py-1 text-xs bg-green-500/20 text-green-300 rounded-full border border-green-500/30">
                              Active
                            </span>
                          )}
                        </div>

                        {isSaved && (
                          <button
                            onClick={() =>
                              setShowSaveModal({
                                show: true,
                                message:
                                  "Cancelling subscription plan will refund the subscription fee to the respective students.",
                              })
                            }
                            className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 rounded-lg text-sm font-medium text-red-300 transition-colors"
                          >
                            Cancel Plan
                          </button>
                        )}
                      </div>

                      {isActive && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">
                              Price (₹)
                            </label>
                            <input
                              type="number"
                              value={plan?.price ?? ""}
                              disabled={isSaved}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setPlans(
                                  plans.map((p) =>
                                    p.type === type ? { ...p, price: val } : p
                                  )
                                );
                              }}
                              className={`w-full px-3 py-2 rounded-lg text-sm ${
                                isSaved
                                  ? "bg-gray-700/50 text-gray-400 cursor-not-allowed border border-gray-600"
                                  : "bg-white text-gray-900 border border-gray-300"
                              }`}
                            />
                          </div>

                          <div>
                            <label className="block text-xs text-gray-400 mb-1">
                              Session Time
                            </label>
                            <select
                              value={plan?.time ?? 9}
                              disabled={isSaved}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setPlans(
                                  plans.map((p) =>
                                    p.type === type ? { ...p, time: val } : p
                                  )
                                );
                              }}
                              className={`w-full px-3 py-2 rounded-lg text-sm ${
                                isSaved
                                  ? "bg-gray-700/50 text-gray-400 cursor-not-allowed border border-gray-600"
                                  : "bg-white text-gray-900 border border-gray-300"
                              }`}
                            >
                              {Array.from({ length: 13 }, (_, i) => 9 + i).map(
                                (hour) => (
                                  <option key={hour} value={hour}>
                                    {hour <= 12
                                      ? `${hour}:00 AM`
                                      : `${hour - 12}:00 PM`}
                                  </option>
                                )
                              )}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-white/10">
                <button
                  className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 rounded-xl font-medium text-white transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
                  onClick={handleSavePlans}
                >
                  <Award size={18} />
                  Save Plans
                </button>
              </div>
            </>
          )}
        </SpokelyCard>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-gray-900 p-8 rounded-2xl max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-6">Edit Mentor Details</h2>

            <form className="space-y-4" onSubmit={handleSaveDetails}>
              <div>
                <input
                  type="text"
                  value={mentorDetails.name}
                  onChange={(e) =>
                    setMentorDetails({ ...mentorDetails, name: e.target.value })
                  }
                  placeholder="Full Name"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <input
                type="email"
                value={mentorDetails.email}
                readOnly
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-gray-400 cursor-not-allowed"
              />

              <div>
                <input
                  type="text"
                  value={mentorDetails.phone}
                  onChange={(e) =>
                    setMentorDetails({
                      ...mentorDetails,
                      phone: e.target.value,
                    })
                  }
                  placeholder="Phone"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Bio"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white"
              />
              {errors.bio && (
                <p className="text-red-500 text-sm mt-1">{errors.bio}</p>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 rounded-xl"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSaveModal.show && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-gray-900 p-6 rounded-2xl max-w-sm w-full text-center">
            <p className="text-white mb-4">{showSaveModal.message}</p>
            <button
              className="px-4 py-2 bg-green-600 rounded-xl"
              onClick={() => setShowSaveModal({ show: false, message: "" })}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {isPasswordModalOpen && (
        <ChangePasswordModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          onSubmit={handlePasswordChange}
        />
      )}

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <SuccessModal
          isOpen={isSuccessModalOpen}
          onClose={() => setIsSuccessModalOpen(false)}
          message="Password changed successfully!"
        />
      )}
    </div>
  );
};

export default MentorProfile;
