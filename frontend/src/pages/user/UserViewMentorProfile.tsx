import DashboardHeader from "./DashBoardComponents/Header";
import SpokelyCard from "../../components/common/Cards";
import { Award, Calendar, Clock, MapPin, Star, User, Users } from "lucide-react";
import Badge from "../../components/common/Badge";

const UserViewMentorProfile = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <DashboardHeader />

      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Mentor Info */}
          <div className="lg:col-span-1">
            <div className="backdrop-blur-lg bg-white/10 rounded-2xl shadow-lg p-6 border border-white/10">
              <div className="text-center mb-6">
                <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <User size={48} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent mb-2">
                  Dr. Michael Chen
                </h2>
                <Badge variant="mentor" className="mb-2">
                  Communication Mentor
                </Badge>
                <p className="text-sm text-gray-300 mb-4">5 years of experience</p>

                {/* Rating */}
                <div className="flex items-center justify-center mb-4">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className="text-yellow-400 fill-current"
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-400">
                      4.9 (127 reviews)
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-400">143</div>
                    <div className="text-xs text-gray-400">Mentor ID</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-400">43</div>
                    <div className="text-xs text-gray-400">Students</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-400">98%</div>
                    <div className="text-xs text-gray-400">Success Rate</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <button className="w-full px-6 py-3 rounded-full font-medium bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg hover:shadow-xl hover:scale-105 transform transition-all">
                    Book Session
                  </button>
                  <button className="w-full px-6 py-3 rounded-full font-medium bg-gradient-to-r from-emerald-500 to-green-600 shadow-lg hover:shadow-xl hover:scale-105 transform transition-all">
                    Send Message
                  </button>
                  <button className="w-full px-6 py-3 rounded-full font-medium border border-white/20 hover:bg-white/10 transition-all">
                    Add to Favorites
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Mentor Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <div className="backdrop-blur-lg bg-white/10 rounded-2xl shadow-lg p-6 border border-white/10">
              <h3 className="text-xl font-bold flex items-center mb-4 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                <User size={20} className="mr-2 text-green-400" />
                About Dr. Michael Chen
              </h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                Dr. Michael Chen is a distinguished communication coach with
                extensive experience in helping professionals enhance their public
                speaking and interpersonal communication skills. With over 5 years
                of dedicated mentoring, he specializes in confidence building,
                presentation skills, and professional communication strategies.
              </p>
              <p className="text-gray-300 leading-relaxed">
                His approach combines practical techniques with psychological
                insights to help students overcome communication barriers and
                achieve their professional goals. Dr. Chen has successfully
                mentored over 200 professionals across various industries.
              </p>
            </div>

            {/* Expertise & Skills */}
            <div className="backdrop-blur-lg bg-white/10 rounded-2xl shadow-lg p-6 border border-white/10">
              <h3 className="text-xl font-bold flex items-center mb-4 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                <Award size={20} className="mr-2 text-green-400" />
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
            </div>

            {/* Availability */}
            <div className="backdrop-blur-lg bg-white/10 rounded-2xl shadow-lg p-6 border border-white/10">
              <h3 className="text-xl font-bold flex items-center mb-4 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                <Calendar size={20} className="mr-2 text-green-400" />
                Availability
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-200">This Week</h4>
                  <div className="space-y-1 text-sm text-gray-400">
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
                  <h4 className="font-semibold text-gray-200">Session Info</h4>
                  <div className="space-y-1 text-sm text-gray-400">
                    <div className="flex items-center">
                      <Clock size={14} className="mr-2 text-green-400" />
                      <span>60 min sessions</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin size={14} className="mr-2 text-green-400" />
                      <span>Online & In-person</span>
                    </div>
                    <div className="flex items-center">
                      <Users size={14} className="mr-2 text-green-400" />
                      <span>Individual & Group</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> 
    </div>
  );
};

export default UserViewMentorProfile;
