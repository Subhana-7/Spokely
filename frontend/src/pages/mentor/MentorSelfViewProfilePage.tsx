import { useState, useEffect } from 'react';
import MentorHeader from './DashboardComponents/Header';
import SpokelyCard from '../../components/common/Cards';
import { Award, Book, Calendar, Camera, Edit, MessageCircle, Star, TrendingUp, User, Lock } from 'lucide-react';
import Badge from '../../components/common/Badge';
import { useAuthStore } from '../../store/userAuthStore';
import { getMentorPlans, saveMentorPlans } from '../../services/subscriptionService';
import { editUserDetails } from '../../services/authServices';
import { uploadImageToCloudinary } from '../../utilis/cloudinary ';

const MentorProfile = () => {
  const { user, setUser } = useAuthStore();

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [bio, setBio] = useState('');
  const [mentorDetails, setMentorDetails] = useState({ name: '', email: '', phone: '', bio: '' });
  const [profilePic, setProfilePic] = useState(user?.profilePicture || '');

  const [plans, setPlans] = useState<{ type: string; price: number }[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [showSaveModal, setShowSaveModal] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
  const [loadingUpload, setLoadingUpload] = useState(false);

  useEffect(() => {
    if (user) {
      setMentorDetails({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone?.toString() || '',
        bio: user.bio || ''
      });
      setBio((user as any).bio || '');
      setProfilePic(user.profilePicture || '');
      setSelectedTags((user as any).tags || []);
    }
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;

    const fetchPlans = async () => {
      setLoadingPlans(true);
      try {
        const res = await getMentorPlans(user.id);
        setPlans(res.data || []);
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
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setLoadingUpload(true);
      const url = await uploadImageToCloudinary(file);
      setProfilePic(url);

      if (user?.id) {
        const updated = await editUserDetails(user.id, "mentor", { profilePicture: url });
        setUser({ ...user, ...updated });
      }
    } catch (err) {
      console.error("Profile pic upload failed:", err);
      alert("Failed to upload profile picture.");
    } finally {
      setLoadingUpload(false);
    }
  };

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const updatedData = { ...mentorDetails, bio, tags: selectedTags, profilePicture: profilePic };
      const res = await editUserDetails(user.id, "mentor", updatedData);

      setMentorDetails({ ...mentorDetails, bio });
      setUser({ ...user, ...res });
      setShowSaveModal({ show: true, message: "Details updated successfully!" });
    } catch (err) {
      console.error("Failed to update details:", err);
      setShowSaveModal({ show: true, message: "Failed to update details." });
    } finally {
      setShowEditModal(false);
    }
  };

  const handleSavePlans = () => {
    if (!user) return;
    saveMentorPlans(user.id, plans)
      .then(() => {
        setShowSaveModal({ show: true, message: 'Plans saved successfully!' });
        return getMentorPlans(user.id);
      })
      .then(res => setPlans(res.data?.plans || []))
      .catch(() => setShowSaveModal({ show: true, message: 'Failed to save plans.' }));
  };

  const planTypes = ["DAILY", "WEEKLY", "BIWEEKLY", "TRIWEEKLY"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <MentorHeader />

      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            Mentor Profile
          </h1>
          <p className="text-lg text-gray-300">
            Manage your expertise, connect with learners, and track your impact
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Left Column */}
          <div className="xl:col-span-1">
            <SpokelyCard className="p-8 mb-6 bg-white/10 backdrop-blur-lg border border-white/20">
              <div className="text-center">
                <div className="relative mb-6">
                  <div className="w-36 h-36 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-1 mx-auto">
                    <div className="w-full h-full bg-gray-900 rounded-xl flex items-center justify-center overflow-hidden">
                      {profilePic ? (
                        <img src={profilePic} className="w-full h-full rounded-xl object-cover" />
                      ) : (
                        <User size={56} className="text-gray-200" />
                      )}
                    </div>
                  </div>
                  <label className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-3 bg-gray-900 rounded-xl p-3 shadow-lg border border-gray-700 hover:shadow-xl transition-all duration-200 cursor-pointer">
                    <Camera size={18} className="text-gray-200" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePicUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <h2 className="text-2xl font-bold mb-3">{mentorDetails.name}</h2>
                <Badge variant="mentor" className="mb-4 text-gray-200 bg-green-900/40 border-green-500/30">
                  <Star size={16} className="mr-2" />
                  Mentor
                </Badge>

                <div className="flex items-center justify-center gap-2 text-gray-300 mb-6">
                  <Award size={16} />
                  <span className="font-medium">{(user as any)?.experience || '0'}+ Years Experience</span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {[{ value: user?.uniqueCode || '-', label: "Mentor ID", color: "green" },
                    { value: (user as any)?.sessionsDone || 0, label: "Sessions Done", color: "blue" },
                    { value: "98%", label: "Success Rate", color: "purple" }].map((stat, index) => (
                    <div key={index} className="p-4 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 text-center">
                      <div className={`text-2xl font-bold text-${stat.color}-400 mb-1`}>{stat.value}</div>
                      <div className="text-sm text-gray-300 font-medium">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </SpokelyCard>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 gap-4">
              <button className="flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-xl shadow-lg hover:scale-105 transform transition-all duration-200">
                <MessageCircle size={20} />
                <span className="font-medium">Start Session</span>
              </button>
              <button className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-indigo-600 p-4 rounded-xl shadow-lg hover:scale-105 transform transition-all duration-200">
                <Calendar size={20} />
                <span className="font-medium">Schedule</span>
              </button>
            </div>
          </div>

          {/* Middle Column */}
          <div className="xl:col-span-2 space-y-6">
            <SpokelyCard className="p-8 bg-white/10 backdrop-blur-lg border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center">
                  <Book size={24} className="mr-3 text-green-400" />
                  Professional Bio
                </h3>
                <button className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 text-sm font-medium"
                  onClick={() => setShowEditModal(true)}
                >
                  <Edit size={16} className="mr-2" /> Edit Bio
                </button>
              </div>
              <div className="prose prose-white max-w-none text-gray-300">
                <p>{mentorDetails.bio}</p>
              </div>

              <div className="mt-8">
                <h4 className="text-lg font-semibold mb-4">Areas of Expertise</h4>
                <div className="flex flex-wrap gap-3">
                  {selectedTags.map((tag, index) => (
                    <span key={index} className="bg-green-900/40 border border-green-500/30 px-4 py-2 rounded-full text-sm font-medium text-green-300 flex items-center">
                      {tag}
                      <button className="ml-2 text-green-400 hover:text-green-200" onClick={() => removeTag(tag)}>×</button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder="Add expertise..."
                    className="ml-2 px-3 py-1 rounded-xl text-black"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const target = e.target as HTMLInputElement;
                        addTag(target.value.trim());
                        target.value = '';
                        e.preventDefault();
                      }
                    }}
                  />
                </div>
              </div>
            </SpokelyCard>

            {/* Analytics */}
            <SpokelyCard className="p-8 bg-white/10 backdrop-blur-lg border border-white/20">
              <h3 className="text-xl font-bold flex items-center mb-6">
                <TrendingUp size={24} className="mr-3 text-green-400" />
                Mentoring Analytics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[{ val: (user as any)?.sessionsDone || 0, label: "Total Sessions", color: "green" },
                  { val: 4.9, label: "Avg Rating", color: "blue" },
                  { val: "89%", label: "Goal Achieved", color: "purple" }].map((stat, i) => (
                  <div key={i} className="text-center p-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl">
                    <div className={`text-3xl font-bold text-${stat.color}-400 mb-2`}>{stat.val}</div>
                    <div className="text-sm text-gray-300 font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </SpokelyCard>
          </div>

          {/* Right Column */}
          <div className="xl:col-span-1 space-y-6">
            {/* Account Settings */}
            <SpokelyCard className="p-8 bg-white/10 backdrop-blur-lg border border-white/20">
              <h3 className="text-lg font-bold mb-6">Account Settings</h3>
              <button className="w-full mb-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-xl font-medium flex items-center justify-center"
                onClick={() => setShowEditModal(true)}
              >
                <Edit size={16} className="mr-2"/> Edit Mentor Details
              </button>
              <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-medium flex items-center justify-center">
                <Lock size={16} className="mr-2"/> Change Password
              </button>
            </SpokelyCard>

            {/* Subscription Plans */}
            <SpokelyCard className="p-8 bg-white/10 backdrop-blur-lg border border-white/20">
              <h3 className="text-lg font-bold mb-6">Subscription Plans</h3>
              {loadingPlans ? (
                <p className="text-gray-300">Loading plans...</p>
              ) : (
                <>
                  {plans.length === 0 && <p className="text-gray-300">No subscription plans added yet.</p>}

                  <div className="space-y-4">
                    {planTypes.map((type) => (
                      <div key={type} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={plans.some(p => p.type === type)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPlans([...plans, { type, price: 0 }]);
                            } else {
                              setPlans(plans.filter(p => p.type !== type));
                            }
                          }}
                        />
                        <span className="w-24">{type}</span>
                        <input
                          type="number"
                          placeholder="Price"
                          value={plans.find(p => p.type === type)?.price ?? ""}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setPlans(plans.map(p => p.type === type ? { ...p, price: val } : p));
                          }}
                          className="px-2 py-1 rounded text-black w-20"
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    className="mt-4 px-4 py-2 bg-green-500 rounded-xl hover:bg-green-600"
                    onClick={handleSavePlans}
                  >
                    Save Plans
                  </button>
                </>
              )}
            </SpokelyCard>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-gray-900 p-8 rounded-2xl max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-6">Edit Mentor Details</h2>
            <form className="space-y-4" onSubmit={handleSaveDetails}>
              <input type="text" value={mentorDetails.name} onChange={(e)=>setMentorDetails({...mentorDetails,name:e.target.value})} placeholder="Full Name" className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white"/>
              <input type="email" value={mentorDetails.email} onChange={(e)=>setMentorDetails({...mentorDetails,email:e.target.value})} placeholder="Email" className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white"/>
              <input type="text" value={mentorDetails.phone} onChange={(e)=>setMentorDetails({...mentorDetails,phone:e.target.value})} placeholder="Phone" className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white"/>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Bio"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white"
              />
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 bg-gray-700 rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-green-600 rounded-xl">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Save Modal */}
      {showSaveModal.show && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-gray-900 p-6 rounded-2xl max-w-sm w-full text-center">
            <p className="text-white mb-4">{showSaveModal.message}</p>
            <button
              className="px-4 py-2 bg-green-600 rounded-xl"
              onClick={() => setShowSaveModal({ show: false, message: '' })}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorProfile;
