import React from 'react'
import DashboardHeader from './DashBoardComponents.jsx/Header';
import SpokelyCard from '../../components/common/Cards';
import { Award, Calendar, Clock, MapPin, Star, User, Users } from 'lucide-react';
import Badge from '../../components/common/Badge';

const UserViewMentorProfile = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Mentor Info */}
          <div className="lg:col-span-1">
            <SpokelyCard variant="info">
              <div className="text-center mb-6">
                <div className="w-32 h-32 bg-blue-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <User size={48} className="text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Dr. Michael Chen</h2>
                <Badge variant="mentor" className="mb-2">Communication Mentor</Badge>
                <p className="text-sm text-gray-600 mb-4">5 years of experience</p>
                
                <div className="flex items-center justify-center mb-4">
                  <div className="flex items-center">
                    {[1,2,3,4,5].map((star) => (
                      <Star key={star} size={16} className="text-yellow-400 fill-current" />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">4.9 (127 reviews)</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">143</div>
                    <div className="text-xs text-gray-600">Mentor ID</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">43</div>
                    <div className="text-xs text-gray-600">Students</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">98%</div>
                    <div className="text-xs text-gray-600">Success Rate</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    Book Session
                  </button>
                  <button className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors">
                    Send Message
                  </button>
                  <button className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                    Add to Favorites
                  </button>
                </div>
              </div>
            </SpokelyCard>
          </div>
          
          {/* Right Column - Mentor Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <SpokelyCard>
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <User size={20} className="mr-2" />
                About Dr. Michael Chen
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Dr. Michael Chen is a distinguished communication coach with extensive experience in helping professionals enhance their public speaking and interpersonal communication skills. With over 5 years of dedicated mentoring, he specializes in confidence building, presentation skills, and professional communication strategies.
              </p>
              <p className="text-gray-600 leading-relaxed">
                His approach combines practical techniques with psychological insights to help students overcome communication barriers and achieve their professional goals. Dr. Chen has successfully mentored over 200 professionals across various industries.
              </p>
            </SpokelyCard>
            
            {/* Expertise & Skills */}
            <SpokelyCard>
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Award size={20} className="mr-2" />
                Expertise & Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="mentor">Public Speaking</Badge>
                <Badge variant="mentor">Communication Skills</Badge>
                <Badge variant="mentor">Confidence Building</Badge>
                <Badge variant="mentor">Presentation Skills</Badge>
                <Badge variant="mentor">Professional Development</Badge>
                <Badge variant="mentor">Leadership Communication</Badge>
              </div>
            </SpokelyCard>
            
            {/* Availability */}
            <SpokelyCard>
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Calendar size={20} className="mr-2" />
                Availability
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-700">This Week</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Monday</span>
                      <span>2:00 PM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Wednesday</span>
                      <span>10:00 AM - 2:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Friday</span>
                      <span>3:00 PM - 7:00 PM</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-700">Session Info</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Clock size={14} className="mr-2" />
                      <span>60 min sessions</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin size={14} className="mr-2" />
                      <span>Online & In-person</span>
                    </div>
                    <div className="flex items-center">
                      <Users size={14} className="mr-2" />
                      <span>Individual & Group</span>
                    </div>
                  </div>
                </div>
              </div>
            </SpokelyCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserViewMentorProfile
