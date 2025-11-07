import { useState, useEffect } from "react";
import MentorHeader from "./DashboardComponents/Header";
import SpokelyCard from "../../components/common/Cards";
import {
  Award,
  Book,
  Camera,
  Edit,
  TrendingUp,
  User,
  Lock,
} from "lucide-react";
import Badge from "../../components/common/Badge";
import { useAuthStore } from "../../store/userAuthStore";
import {
  getMentorPlans,
  saveMentorPlans,
} from "../../services/subscriptionService";
import { editUserDetails, changePassword } from "../../services/authServices";
import { uploadImageToCloudinary } from "../../utilis/cloudinary ";
import ChangePasswordModal from "../../modals/ChangePassword";
import SuccessModal from "../../modals/SuccessModal";

const COMMUNICATION_TAGS = [
  "Public Speaking",
  "Presentation Skills",
  "Active Listening",
  "Body Language",
  "Business Communication",
  "Spoken English",
  "Accent Training",
  "Pronunciation Improvement",
  "Confidence Building",
  "Leadership Communication",
  "Negotiation Skills",
  "Email Etiquette",
  "Interpersonal Skills",
  "Emotional Intelligence",
  "Team Collaboration",
  "Conflict Resolution",
  "Storytelling",
  "Voice Modulation",
  "Fluency Development",
  "Client Interaction",
];

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
  const [showSaveModal, setShowSaveModal] = useState({
    show: false,
    message: "",
  });
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // load user details
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

  // load mentor plans
  useEffect(() => {
    if (!user?.id && !(user as any)?._id) return;
    const id = user.id || (user as any)._id;
    const fetchPlans = async () => {
      setLoadingPlans(true);
      try {
        const res = await getMentorPlans(id);
        setPlans((res.data || []).map((p: any) => ({ ...p, saved: true })));
      } catch {
        setPlans([]);
      }
      setLoadingPlans(false);
    };
    fetchPlans();
  }, [user]);

  const addTag = (tag: string) => {
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  const handleSaveDetails = async (e: any) => {
  e.preventDefault();
  console.log("here");
  if (!user) return;
  console.log("here also");
  console.log("Current user:", user);

  // ✅ Improved validation logic
  const requiredFields = ["name", "phone"];
  const newErrors: any = {};

  requiredFields.forEach((field) => {
    if (!mentorDetails[field as keyof typeof mentorDetails]) {
      newErrors[field] = `${field} required`;
    }
  });

  setErrors(newErrors);

  if (Object.keys(newErrors).length > 0) {
    console.warn("Validation stopped save:", newErrors);
    return; // ⛔ stop if there are validation issues
  }

  console.log("here alsooo");

  try {
    const data = {
      ...mentorDetails,
      bio,
      tags: selectedTags,
      profilePicture: profilePic,
    };

    const id = user.id || (user as any)._id;
    console.log("Saving mentor with ID:", id);
    console.log("Payload data:", data);

    const updatedUser = await editUserDetails(id, "mentor", data);
    console.log("editUserDetails returned:", updatedUser);

    if (updatedUser) {
      setUser({ ...user, ...updatedUser });
      setShowSaveModal({ show: true, message: "Profile Updated ✅" });
    } else {
      throw new Error("No user data returned from update");
    }
  } catch (error) {
    console.error("Profile update failed:", error);
    setShowSaveModal({ show: true, message: "Update Failed ❌" });
  } finally {
    setShowEditModal(false);
  }
};



  const handleProfilePicUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    setLoadingUpload(true);
    const url = await uploadImageToCloudinary(file);
    setProfilePic(url);

    const id = user.id || (user as any)._id;
    await editUserDetails(id, "mentor", { profilePicture: url });
    setLoadingUpload(false);
  };

  const planTypes = ["DAILY", "WEEKLY", "BIWEEKLY", "TRIWEEKLY"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <MentorHeader />

      <div className="max-w-7xl mx-auto p-8 space-y-10">
        {/* Profile Section */}
        <SpokelyCard className="p-10 bg-white/10 border-white/20 flex flex-col md:flex-row gap-10">
          <div className="relative">
            <div className="w-40 h-40 rounded-2xl overflow-hidden bg-gray-800">
              {profilePic ? (
                <img src={profilePic} className="w-full h-full object-cover" />
              ) : (
                <User size={60} className="text-gray-400 mx-auto mt-10" />
              )}
            </div>
            <label className="absolute bottom-2 right-2 bg-gray-900 p-3 rounded-xl cursor-pointer">
              <Camera size={18} />
              <input type="file" className="hidden" onChange={handleProfilePicUpload} />
            </label>
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold">{mentorDetails.name}</h1>
            <Badge variant="mentor" className="bg-green-900/40 border-green-500/30">
              Mentor
            </Badge>
            <p className="text-gray-300">{mentorDetails.bio}</p>
            <div className="grid grid-cols-3 gap-6 mt-6">
              {[{ label: "Sessions Done", value: user?.sessionsDone || 0 }, { label: "Experience", value: user?.experience || "0" }, { label: "Success Rate", value: "98%" }].map((s, i) => (
                <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-xl text-center">
                  <div className="text-xl font-bold text-green-400">{s.value}</div>
                  <div className="text-sm text-gray-300">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </SpokelyCard>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <SpokelyCard className="p-8 bg-white/10">
              <div className="flex justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Book size={22} className="text-green-400" /> About Me
                </h2>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-4 py-2 bg-green-600 rounded-xl"
                >
                  <Edit size={16} /> Edit
                </button>
              </div>
              <p className="text-gray-300">{mentorDetails.bio}</p>
              <h3 className="mt-6 mb-3 font-semibold">Skills & Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-green-900/40 text-green-300 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </SpokelyCard>

            <SpokelyCard className="p-8 bg-white/10">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                <TrendingUp size={22} className="text-green-400" /> Analytics
              </h2>
              <div className="grid grid-cols-3 gap-6">
                {[{ label: "Total Sessions", val: user?.sessionsDone || 0 }, { label: "Avg Rating", val: "4.9" }, { label: "Goals Achieved", val: "89%" }].map((s, i) => (
                  <div key={i} className="p-6 bg-white/5 rounded-xl text-center">
                    <div className="text-2xl font-bold text-green-400 mb-2">{s.val}</div>
                    <div className="text-sm text-gray-300">{s.label}</div>
                  </div>
                ))}
              </div>
            </SpokelyCard>
          </div>

          {/* Account Settings */}
          <div className="space-y-8">
            <SpokelyCard className="p-6 bg-white/10">
              <h2 className="font-bold mb-6">Account Settings</h2>
              <button
                onClick={() => setShowEditModal(true)}
                className="w-full mb-4 bg-blue-600 py-3 rounded-xl"
              >
                <Edit size={16} /> Edit Details
              </button>
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="w-full bg-green-600 py-3 rounded-xl"
              >
                <Lock size={16} /> Change Password
              </button>
            </SpokelyCard>

            {/* Subscription Plans */}
            <SpokelyCard className="p-6 bg-white/10">
              <h2 className="font-bold mb-4">Subscription Plans</h2>
              {loadingPlans ? (
                <div className="text-center py-10">Loading...</div>
              ) : (
                <>
                  {planTypes.map((type) => {
                    const plan = plans.find((p) => p.type === type);
                    return (
                      <div key={type} className={`p-4 rounded-xl mb-3 border ${plan ? "border-green-500 bg-green-900/20" : "border-white/10 bg-white/5"}`}>
                        <div className="flex justify-between">
                          <span className="capitalize">{type.toLowerCase()} Plan</span>
                        </div>
                      </div>
                    );
                  })}

                  <button
                    className="w-full mt-4 py-3 bg-green-600 rounded-xl"
                    onClick={async () => {
                      const id = user.id || (user as any)._id;
                      await saveMentorPlans(id, plans);
                      setShowSaveModal({ show: true, message: "Plans Saved ✅" });
                    }}
                  >
                    <Award size={18} /> Save Plans
                  </button>
                </>
              )}
            </SpokelyCard>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="bg-gray-900 p-8 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Mentor Profile</h2>
            <form onSubmit={handleSaveDetails} className="space-y-4">
              <input className="w-full px-4 py-2 bg-white/10 rounded-lg" value={mentorDetails.name} onChange={(e) => setMentorDetails({ ...mentorDetails, name: e.target.value })} placeholder="Full Name" />
              <input className="w-full px-4 py-2 bg-white/10 rounded-lg text-gray-400" value={mentorDetails.email} disabled />
              <input className="w-full px-4 py-2 bg-white/10 rounded-lg" value={mentorDetails.phone} onChange={(e) => setMentorDetails({ ...mentorDetails, phone: e.target.value })} placeholder="Phone" />
              <textarea className="w-full px-4 py-2 bg-white/10 rounded-lg" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Bio" />

              <div>
                <p className="text-sm mb-2 text-gray-300">Select Your Expertise</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedTags.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-green-800/40 text-green-300 rounded-full text-xs flex items-center gap-2">
                      {tag}
                      <button onClick={() => removeTag(tag)} type="button">×</button>
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 bg-white/5 p-3 rounded-lg max-h-40 overflow-y-auto">
                  {COMMUNICATION_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addTag(tag)}
                      className={`px-2 py-1 rounded text-xs border ${selectedTags.includes(tag)
                        ? "bg-green-700/40 border-green-500 text-green-300"
                        : "bg-gray-800/40 border-gray-600 text-gray-300"
                        }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  placeholder="Add custom skill..."
                  className="mt-2 w-full bg-white/10 px-3 py-2 rounded-lg"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag(e.currentTarget.value);
                      e.currentTarget.value = "";
                    }
                  }}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => setShowEditModal(false)} type="button" className="px-4 py-2 bg-gray-700 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-green-600 rounded-lg">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modals */}
      {isPasswordModalOpen && (
        <ChangePasswordModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          onSubmit={async (o, n) => {
            const id = user.id || (user as any)._id;
            await changePassword("mentor", { id, currentPassword: o, newPassword: n });
            setIsPasswordModalOpen(false);
            setIsSuccessModalOpen(true);
          }}
        />
      )}

      {isSuccessModalOpen && (
        <SuccessModal
          isOpen
          onClose={() => setIsSuccessModalOpen(false)}
          message="Password Updated Successfully ✅"
        />
      )}

      {showSaveModal.show && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60">
          <div className="bg-gray-900 p-6 rounded-xl text-center">
            <p className="mb-4">{showSaveModal.message}</p>
            <button className="px-4 py-2 bg-green-600 rounded-lg" onClick={() => setShowSaveModal({ show: false, message: "" })}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorProfile;
