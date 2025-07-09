import { ArrowLeft, Clock, User, BookOpen } from 'lucide-react';
import Button from '../../../modals/Button';
import Card from '../../../components/common/Cards';
import Badge from '../../../components/common/Badge';

const SessionDetail = () => {
  const sessionData = {
    title: "Daily English Practice Session",
    type: "Private – Trainer",
    startTime: "9:00 AM",
    endTime: "10:30 AM",
    duration: "1h 30m",
    topic: "Persuasive Speaking",
    description: "Focus on building strong arguments, using persuasive language techniques, and improving confidence in public speaking scenarios.",
    learner: {
      name: "Sarah Johnson",
      level: "Intermediate",
      feedback: "Good Speaking Skill, Should improve vocabulary"
    }
  };

  const aiAnalysis = {
    score: 85,
    performance: "Excellent",
    strengths: [
      "Clear pronunciation and articulation",
      "Good use of persuasive techniques",
      "Confident delivery and body language"
    ],
    improvements: [
      "Expand vocabulary for more variety",
      "Work on transition phrases",
      "Practice handling counterarguments"
    ]
  };

  const mentorFeedback = {
    score: 82,
    performance: "Very Good",
    strengths: [
      "Engaged actively throughout session",
      "Showed improvement from last session",
      "Asked thoughtful questions"
    ],
    improvements: [
      "Continue vocabulary building exercises",
      "Practice speaking at a slightly slower pace",
      "Work on using more complex sentence structures"
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center">
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors mr-4">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Session Details</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Session Info */}
          <div className="space-y-6">
            {/* Main Session Card */}
            <Card>
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{sessionData.title}</h2>
                <Badge variant="private">{sessionData.type}</Badge>
              </div>

              {/* Session Details */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-lime-50 rounded-lg">
                  <Clock className="w-8 h-8 text-lime-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">Start Time</div>
                  <div className="font-semibold text-gray-900">{sessionData.startTime}</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">End Time</div>
                  <div className="font-semibold text-gray-900">{sessionData.endTime}</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">Duration</div>
                  <div className="font-semibold text-gray-900">{sessionData.duration}</div>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-lime-600" />
                  Topic
                </h3>
                <div className="bg-lime-100 text-lime-800 px-3 py-2 rounded-lg font-medium">
                  {sessionData.topic}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Session Description</h3>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-700 leading-relaxed">{sessionData.description}</p>
                </div>
              </div>
            </Card>

            {/* Learner Info Card */}
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-lime-600" />
                Learner Information
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-semibold text-gray-900">{sessionData.learner.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Level:</span>
                  <Badge variant="peer">{sessionData.learner.level}</Badge>
                </div>
                <div>
                  <div className="text-gray-600 mb-2">Feedback Note:</div>
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                    <p className="text-amber-800">{sessionData.learner.feedback}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Analysis Cards */}
          <div className="space-y-6">
            {/* AI Analysis Card */}
            <Card variant="info">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-white">{aiAnalysis.score}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">AI Analysis</h3>
                <p className="text-blue-600 font-semibold">Overall Performance: {aiAnalysis.performance}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-green-700 mb-2">Strengths</h4>
                  <ul className="space-y-1">
                    {aiAnalysis.strengths.map((strength, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-orange-700 mb-2">Areas for Improvement</h4>
                  <ul className="space-y-1">
                    {aiAnalysis.improvements.map((improvement, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start">
                        <span className="text-orange-500 mr-2">•</span>
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>

            {/* Mentor Feedback Card */}
            <Card variant="secondary">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-lime-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-white">{mentorFeedback.score}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Mentor Feedback</h3>
                <p className="text-lime-700 font-semibold">Overall Performance: {mentorFeedback.performance}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-green-700 mb-2">Strengths</h4>
                  <ul className="space-y-1">
                    {mentorFeedback.strengths.map((strength, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-orange-700 mb-2">Areas for Improvement</h4>
                  <ul className="space-y-1">
                    {mentorFeedback.improvements.map((improvement, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start">
                        <span className="text-orange-500 mr-2">•</span>
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button variant="secondary" className="flex-1">
                Download Report
              </Button>
              <Button variant="primary" className="flex-1 bg-lime-500 hover:bg-lime-600">
                Schedule Follow-up
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionDetail;