import React,{useState} from 'react'
import DashboardHeader from './DashBoardComponents.jsx/Header';
import SpokelyCard from '../../components/common/Cards';
import { Award, Camera, Crown, Edit, Mail, Phone, Star, TrendingUp, User, Zap ,Lock} from 'lucide-react';
import Badge from '../../components/common/Badge';

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto p-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Overview</h1>
          <p className="text-gray-600">Manage your account settings and track your learning journey</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Left Column - Profile Summary */}
          <div className="xl:col-span-1">
            <SpokelyCard className="p-8">
              <div className="text-center">
                {/* Profile Image with Gradient Border */}
                <div className="relative mb-6">
                  <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full p-1 mx-auto">
                    <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                      <User size={48} className="text-gray-600" />
                    </div>
                  </div>
                  <button className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-2 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200">
                    <Camera size={16} className="text-gray-600" />
                  </button>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Clara Johnson</h2>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Badge variant="peer">
                    <Star size={14} className="mr-1" />
                    Intermediate
                  </Badge>
                </div>
                
                {/* Streak Counter */}
                <div className="bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-center gap-2 text-amber-800">
                    <Zap size={18} />
                    <span className="font-semibold">15-Day Streak</span>
                  </div>
                </div>
              </div>
            </SpokelyCard>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <SpokelyCard className="p-6 text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-2">42</div>
                <div className="text-sm text-gray-600 font-medium">Sessions</div>
              </SpokelyCard>
              <SpokelyCard className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">23</div>
                <div className="text-sm text-gray-600 font-medium">Levels</div>
              </SpokelyCard>
            </div>
          </div>
          
          {/* Middle Column - Progress & Achievements */}
          <div className="xl:col-span-2">
            {/* Progress Section */}
            <SpokelyCard className="p-8 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <TrendingUp size={24} className="mr-3 text-indigo-600" />
                  Learning Progress
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Completion Rate */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold text-gray-700">Overall Progress</span>
                    <span className="text-3xl font-bold text-indigo-600">87%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500" style={{width: '87%'}}></div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Excellent progress! Keep it up.</p>
                </div>
                
                {/* Weekly Activity */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-700 mb-4">This Week</h4>
                  <div className="flex gap-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                      <div key={day} className="flex-1 text-center">
                        <div className="text-xs text-gray-500 mb-1">{day}</div>
                        <div className={`h-12 rounded-lg ${index < 5 ? 'bg-gradient-to-t from-indigo-500 to-purple-600' : 'bg-gray-100'}`}></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SpokelyCard>

            {/* Achievements */}
            <SpokelyCard className="p-8">
              <h3 className="text-xl font-bold text-gray-900 flex items-center mb-6">
                <Award size={24} className="mr-3 text-indigo-600" />
                Recent Achievements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mr-4">
                    <Star size={20} className="text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Grammar Master</div>
                    <div className="text-sm text-gray-600">Completed advanced grammar</div>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mr-4">
                    <Zap size={20} className="text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Streak Warrior</div>
                    <div className="text-sm text-gray-600">15 consecutive days</div>
                  </div>
                </div>
              </div>
            </SpokelyCard>
          </div>
          
          {/* Right Column - Settings */}
          <div className="xl:col-span-1">
            <SpokelyCard className="p-8 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Account Settings</h3>
                <button className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 text-sm font-medium">
                  <Edit size={16} className="mr-2" />
                  Edit
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <User size={16} className="mr-2" />
                    Full Name
                  </label>
                  <input 
                    type="text" 
                    value="Clara Johnson" 
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 group-hover:bg-white"
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
                    value="clarajohnson@gmail.com" 
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 group-hover:bg-white"
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
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 group-hover:bg-white"
                    readOnly
                  />
                </div>
                
                <button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-medium hover:shadow-lg transition-all duration-200 flex items-center justify-center">
                  <Lock size={16} className="mr-2" />
                  Change Password
                </button>
              </div>
            </SpokelyCard>

            {/* Premium Upgrade */}
            <SpokelyCard className="p-8 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown size={28} className="text-white" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Unlock Premium Features</h4>
                <p className="text-sm text-gray-600 mb-4">Take your learning to the next level</p>
                
                <div className="text-left space-y-2 mb-6">
                  <div className="flex items-center text-sm text-gray-700">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
                    Unlimited Sessions
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
                    Anonymous Matching
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
                    Advanced Analytics
                  </div>
                </div>
                
                <button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]">
                  Upgrade to Premium
                </button>
              </div>
            </SpokelyCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
