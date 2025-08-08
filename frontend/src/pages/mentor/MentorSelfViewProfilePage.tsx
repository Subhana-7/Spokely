import React, { useState } from 'react'
import MentorHeader from './DashboardComponents/Header';
import SpokelyCard from '../../components/common/Cards';
import { Award, Book, Calendar, Camera, Crown, Edit, Mail, MessageCircle, Phone, Star, Tag, TrendingUp, User,Lock } from 'lucide-react';
import Badge from '../../components/common/Badge';

const MentorProfile = () => {
  const [selectedTags, setSelectedTags] = useState(['Communication', 'Public Speaking', 'Confidence Building']);

  const addTag = (tag: any) => {
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const removeTag = (tagToRemove: any) => {
    setSelectedTags(selectedTags.filter((tag: any) => tag !== tagToRemove));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <MentorHeader />
      
      <div className="max-w-7xl mx-auto p-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Mentor Profile</h1>
          <p className="text-lg text-gray-600">Manage your expertise, connect with learners, and track your impact</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Left Column - Mentor Info */}
          <div className="xl:col-span-1">
            <SpokelyCard variant="info" className="p-8 mb-6">
              <div className="text-center">
                {/* Profile Image with Professional Border */}
                <div className="relative mb-6">
                  <div className="w-36 h-36 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-1 mx-auto">
                    <div className="w-full h-full bg-white rounded-xl flex items-center justify-center">
                      <User size={56} className="text-gray-600" />
                    </div>
                  </div>
                  <button className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-3 bg-white rounded-xl p-3 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-200">
                    <Camera size={18} className="text-gray-600" />
                  </button>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Dr. Michael Chen</h2>
                <Badge variant="mentor" className="mb-4">
                  <Star size={16} className="mr-2" />
                  Communication Mentor
                </Badge>
                
                <div className="flex items-center justify-center gap-2 text-gray-600 mb-6">
                  <Award size={16} />
                  <span className="font-medium">5+ Years Experience</span>
                </div>

                {/* Professional Stats */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-white/70 backdrop-blur rounded-xl p-4">
                    <div className="text-2xl font-bold text-blue-700 mb-1">143</div>
                    <div className="text-sm text-gray-600 font-medium">Mentor ID</div>
                  </div>
                  <div className="bg-white/70 backdrop-blur rounded-xl p-4">
                    <div className="text-2xl font-bold text-indigo-700 mb-1">43</div>
                    <div className="text-sm text-gray-600 font-medium">Active Students</div>
                  </div>
                  <div className="bg-white/70 backdrop-blur rounded-xl p-4">
                    <div className="text-2xl font-bold text-emerald-700 mb-1">98%</div>
                    <div className="text-sm text-gray-600 font-medium">Success Rate</div>
                  </div>
                </div>
              </div>
            </SpokelyCard>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 gap-4">
              <button className="flex items-center justify-center gap-3 bg-white p-4 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200">
                <MessageCircle size={20} className="text-blue-600" />
                <span className="font-medium text-gray-700">Start Session</span>
              </button>
              <button className="flex items-center justify-center gap-3 bg-white p-4 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200">
                <Calendar size={20} className="text-indigo-600" />
                <span className="font-medium text-gray-700">Schedule</span>
              </button>
            </div>
          </div>
          
          {/* Middle Column - Bio & Analytics */}
          <div className="xl:col-span-2">
            {/* Professional Bio */}
            <SpokelyCard className="p-8 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <Book size={24} className="mr-3 text-blue-600" />
                  Professional Bio
                </h3>
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 text-sm font-medium">
                  <Edit size={16} className="mr-2" />
                  Edit Bio
                </button>
              </div>
              
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed text-lg mb-6">
                  Dr. Michael Chen is a distinguished communication coach with extensive experience in helping professionals enhance their public speaking and interpersonal communication skills. Specializing in confidence building, he has guided over 500 professionals to achieve breakthrough results in their communication journey.
                </p>
                
                <p className="text-gray-600 leading-relaxed">
                  With a PhD in Communication Psychology and certifications from leading institutions, Dr. Chen combines scientific methodology with practical experience to create transformative learning experiences for his students.
                </p>
              </div>

              {/* Expertise Tags */}
              <div className="mt-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Areas of Expertise</h4>
                <div className="flex flex-wrap gap-3">
                  {selectedTags.map((tag, index) => (
                    <div key={index} className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium border border-blue-200">
                      {tag}
                    </div>
                  ))}
                </div>
              </div>
            </SpokelyCard>

            {/* Analytics Dashboard */}
            <SpokelyCard className="p-8">
              <h3 className="text-xl font-bold text-gray-900 flex items-center mb-6">
                <TrendingUp size={24} className="mr-3 text-indigo-600" />
                Mentoring Analytics
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                  <div className="text-3xl font-bold text-emerald-700 mb-2">156</div>
                  <div className="text-sm text-emerald-600 font-medium">Total Sessions</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <div className="text-3xl font-bold text-blue-700 mb-2">4.9</div>
                  <div className="text-sm text-blue-600 font-medium">Average Rating</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
                  <div className="text-3xl font-bold text-purple-700 mb-2">89%</div>
                  <div className="text-sm text-purple-600 font-medium">Goal Achievement</div>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Student Progress</h4>
                <div className="space-y-4">
                  {[
                    { name: "Sarah Johnson", progress: 85, goal: "Public Speaking Confidence" },
                    { name: "Alex Rodriguez", progress: 92, goal: "Business Communication" },
                    { name: "Emily Chen", progress: 78, goal: "Interview Skills" }
                  ].map((student, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                          <User size={18} className="text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-600">{student.goal}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">{student.progress}%</div>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full"
                            style={{width: `${student.progress}%`}}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </SpokelyCard>
          </div>
          
          {/* Right Column - Settings & Premium */}
          <div className="xl:col-span-1">
            <SpokelyCard className="p-8 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Account Settings</h3>
                <button className="flex items-center px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 text-sm font-medium">
                  <Edit size={14} className="mr-2" />
                  Edit
                </button>
              </div>
              
              <div className="space-y-5">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <User size={16} className="mr-2" />
                    Full Name
                  </label>
                  <input 
                    type="text" 
                    value="Dr. Michael Chen" 
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 group-hover:bg-white"
                    readOnly
                  />
                </div>
                
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Mail size={16} className="mr-2" />
                    Email Address
                  </label>
                  <input 
                    type="email" 
                    value="chenmichael@gmail.com" 
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 group-hover:bg-white"
                    readOnly
                  />
                </div>
                
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Phone size={16} className="mr-2" />
                    Phone Number
                  </label>
                  <input 
                    type="tel" 
                    value="9000000" 
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 group-hover:bg-white"
                    readOnly
                  />
                </div>
                
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Tag size={16} className="mr-2" />
                    Expertise Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedTags.map((tag, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-sm font-medium flex items-center">
                        {tag}
                        <button 
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <input 
                    type="text" 
                    placeholder="Add new expertise..." 
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const target = e.target as HTMLInputElement;
                        addTag(target.value.trim());
                        target.value = '';
                      }
                    }}
                  />
                </div>
                
                <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-medium hover:shadow-lg transition-all duration-200 flex items-center justify-center">
                  <Lock size={16} className="mr-2" />
                  Change Password
                </button>
              </div>
            </SpokelyCard>

            {/* Premium Upgrade */}
            <SpokelyCard className="p-8 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Crown size={28} className="text-white" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Mentor Pro</h4>
                <p className="text-sm text-gray-600 mb-6">Unlock advanced mentoring tools</p>
                
                <div className="text-left space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-700">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
                    Unlimited Sessions
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
                    Unlimited Students
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
                    Advanced Analytics
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
                    Priority Support
                  </div>
                </div>
                
                <button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-4 rounded-xl font-semibold hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]">
                  Upgrade to Pro
                </button>
              </div>
            </SpokelyCard>
          </div>
        </div>
      </div>
    </div>
  );
};


export default MentorProfile;
