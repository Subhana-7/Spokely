import React from 'react'
import MentorHeader from './DashboardComponents/Header';
import SpokelyCard from '../../components/common/Cards';
import { Book, Calendar, TrendingUp, User } from 'lucide-react';
import Badge from '../../components/common/Badge';

const MentorViewUserProfile = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <MentorHeader />
      
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - User Info */}
          <div className="lg:col-span-1">
            <SpokelyCard variant="secondary">
              <div className="text-center mb-6">
                <div className="w-32 h-32 bg-purple-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <User size={48} className="text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Clara Johnson</h2>
                <Badge variant="peer" className="mb-2">Intermediate</Badge>
                <p className="text-sm text-gray-600 mb-4">Your Student</p>
                
                <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium mb-6 inline-block">
                  15-Day Streak
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-600">42</div>
                    <div className="text-xs text-gray-600">Sessions Done</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-600">87%</div>
                    <div className="text-xs text-gray-600">Progress Rate</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <button className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors">
                    Schedule Session
                  </button>
                  <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    Send Message
                  </button>
                  <button className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                    View Session History
                  </button>
                </div>
              </div>
            </SpokelyCard>
          </div>
          
          {/* Right Column - Student Progress & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Overview */}
            <SpokelyCard>
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <TrendingUp size={20} className="mr-2" />
                Learning Progress
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">87%</div>
                  <div className="text-sm text-gray-600">Completion Rate</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">42</div>
                  <div className="text-sm text-gray-600">Sessions Completed</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">23</div>
                  <div className="text-sm text-gray-600">Levels Unlocked</div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                  <span className="text-sm text-gray-600">87%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full" style={{width: '87%'}}></div>
                </div>
              </div>
            </SpokelyCard>
            
            {/* Recent Sessions */}
            <SpokelyCard>
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Calendar size={20} className="mr-2" />
                Recent Sessions
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-800">Public Speaking Basics</div>
                    <div className="text-sm text-gray-600">March 15, 2024 • 60 min</div>
                  </div>
                  <Badge variant="completed">Completed</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-800">Confidence Building Workshop</div>
                    <div className="text-sm text-gray-600">March 12, 2024 • 45 min</div>
                  </div>
                  <Badge variant="completed">Completed</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-800">Presentation Skills</div>
                    <div className="text-sm text-gray-600">March 18, 2024 • 60 min</div>
                  </div>
                  <Badge variant="upcoming">Upcoming</Badge>
                </div>
              </div>
            </SpokelyCard>
            
            {/* Student Notes */}
            <SpokelyCard>
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Book size={20} className="mr-2" />
                Student Notes & Goals
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Current Goals</h4>
                  <ul className="text-gray-600 space-y-1">
                    <li>• Improve public speaking confidence</li>
                    <li>• Master presentation delivery techniques</li>
                    <li>• Overcome stage anxiety</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Mentor Notes</h4>
                  <textarea 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    // rows="4"
                    placeholder="Add notes about Clara's progress, areas for improvement, or session feedback..."
                  ></textarea>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Save Notes
                </button>
              </div>
            </SpokelyCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorViewUserProfile
