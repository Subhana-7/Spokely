import React, { useState, useRef, useEffect } from "react";
import {
  BookOpen,
  Mic,
  Headphones,
  PenTool,
  CheckCircle,
  X,
  Sparkles,
} from "lucide-react";
import { useAuthStore } from "../../../store/userAuthStore";
import { latestSubmission,topicGenerate,submitResponse } from "../../../services/dailyTaskService";

const DailyTaskPage = () => {
  const [selectedTopic, setSelectedTopic] = useState("");
  const [taskData, setTaskData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [submittedTasks, setSubmittedTasks] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<any>(null);
  const [feedbackModal, setFeedbackModal] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  const user = useAuthStore((s) => s.user);

  const [responses, setResponses] = useState<{
    writing: string;
    speaking: string | null;
    listening: Record<number, string>;
    reading: Record<number, string>;
  }>({
    writing: "",
    speaking: null,
    listening: {},
    reading: {},
  });

  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const topics = [
    { id: "communication", label: "Communication", icon: "💬" },
    { id: "technology", label: "Technology", icon: "💻" },
    { id: "environment", label: "Environment", icon: "🌍" },
    { id: "education", label: "Education", icon: "📚" },
    { id: "health", label: "Health", icon: "🏥" },
    { id: "culture", label: "Culture", icon: "🎭" },
  ];

  const taskCards = [
    { id: "writing", title: "Writing Task", icon: PenTool, color: "from-purple-500 to-pink-500", description: "Express your thoughts in writing" },
    { id: "speaking", title: "Speaking Task", icon: Mic, color: "from-blue-500 to-cyan-500", description: "Practice your spoken communication" },
    { id: "listening", title: "Listening Task", icon: Headphones, color: "from-green-500 to-emerald-500", description: "Enhance your listening comprehension" },
    { id: "reading", title: "Reading Task", icon: BookOpen, color: "from-orange-500 to-red-500", description: "Improve your reading skills" },
  ];

  useEffect(() => {
  const fetchExistingTask = async () => {
    setLoading(true);
    try {
      const response = await latestSubmission(); 
      const data = response.data;
      console.log("Fetched task:", data);

      if (data.task) {
        setSelectedTopic(data.task.topic);
        setTaskData(data.task);

        setResponses(
          data.task.userResponses || {
            writing: "",
            speaking: null,
            listening: {},
            reading: {},
          }
        );

        setSubmittedTasks(taskCards.map((c) => c.id));

        const normalizedFeedback: any = {};
        for (const key of ["writing", "reading", "listening", "speaking"]) {
          const fb =
            data.task[key]?.feedback ||
            data.task.feedback?.[key] || 
            null;

          if (fb) {
            normalizedFeedback[key] = fb.feedback
              ? fb 
              : {
                  strengths: fb.strengths || "",
                  weaknesses: fb.weaknesses || "",
                  feedback: fb.feedback || fb || "",
                };
          }
        }

        setFeedback(Object.keys(normalizedFeedback).length ? normalizedFeedback : {});
        setAlreadySubmitted(true);
      }
    } catch (err) {
      console.error("Failed to fetch existing task:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchExistingTask();
}, []);


  const handleTopicSelect = async (topic: string) => {
    setSelectedTopic(topic);
    setLoading(true);
    try {
      const response = await topicGenerate(topic);
      const data = await response.data;
      setTaskData(data.task);
      const existingResponses = data.task.userResponses || {};
      setResponses({
        writing: existingResponses.writing || "",
        speaking: existingResponses.speaking || null,
        listening: existingResponses.listening || {},
        reading: existingResponses.reading || {},
      });
      if (data.task.feedback) {
        setFeedback(data.task.feedback);
        setAlreadySubmitted(true);
      }
    } catch (error) {
      console.error("Error fetching task:", error);
      alert("Failed to load tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (taskType: string) => {
    setActiveModal(taskType);
    setAudioUrl((responses[taskType as keyof typeof responses] as string) || null);
  };

  const handleCloseModal = () => setActiveModal(null);

  const handleTaskComplete = () => {
    if (!activeModal) return;
    const response = responses[activeModal as keyof typeof responses];
    const isValid = typeof response === "string" ? response.trim() !== "" : response && Object.values(response).some((val) => val.trim() !== "");
    if (!isValid) {
      alert("Please provide a response first!");
      return;
    }
    if (!submittedTasks.includes(activeModal)) {
      setSubmittedTasks((prev) => [...prev, activeModal]);
    }
    handleCloseModal();
  };

  const handleFinalSubmit = async () => {
    if (submittedTasks.length !== taskCards.length) {
      alert("Please complete all tasks before submitting!");
      return;
    }
    try {
      const response = await submitResponse(taskData.id,responses);
      const data = await response.data;
      console.log(data)
      console.log(data.feedback)
      setFeedback(data.feedback);
      localStorage.setItem("dailyTaskSubmitted", new Date().toISOString());
      setAlreadySubmitted(true);
      alert("✅ Submitted! Click 'View Answers & Feedback' to see your results.");
    } catch (err) {
      console.error(err);
      alert("Failed to submit. Try again.");
    }
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];
    mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setResponses((prev) => ({ ...prev, speaking: url }));
    };
    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const handlePlayAudio = () => {
    if (taskData.listening?.paragraph) {
      const utterance = new SpeechSynthesisUtterance(taskData.listening.paragraph);
      utterance.lang = "en-US";
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen text-white relative bg-cover bg-center" style={{ backgroundImage: `url('/gradient-bg.jpg')` }}>
      <div className="absolute inset-0 bg-black/40" />
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="text-yellow-400" size={32} />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">Daily Task</h1>
            <Sparkles className="text-yellow-400" size={32} />
          </div>
          <p className="text-gray-300 text-lg">Challenge yourself with today's language tasks</p>
        </div>

        {!selectedTopic && !alreadySubmitted && (
          <div className="mb-16">
            <h2 className="text-2xl font-semibold text-center mb-8">Choose Your Topic</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {topics.map((topic) => (
                <button key={topic.id} onClick={() => handleTopicSelect(topic.id)} className="group relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{topic.icon}</div>
                  <div className="text-sm font-semibold">{topic.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
            <p className="mt-4 text-xl text-gray-300">Loading your tasks...</p>
          </div>
        )}

        {selectedTopic && taskData && !loading && (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold capitalize">{selectedTopic} Tasks</h2>
                <p className="text-gray-400 mt-1">Complete all four tasks to master today's challenge</p>
              </div>
              {!alreadySubmitted && (
                <button onClick={() => { setSelectedTopic(""); setTaskData(null); setSubmittedTasks([]); setResponses({ writing: "", speaking: null, listening: {}, reading: {} }); }} className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all">Change Topic</button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {taskCards.map((card) => {
                const Icon = card.icon;
                const isCompleted = submittedTasks.includes(card.id) || alreadySubmitted;
                return (
                  <div key={card.id} className="group relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                    {isCompleted && (<div className="absolute top-4 right-4"><CheckCircle className="text-green-400" size={32} /></div>)}
                    <div className="relative z-10">
                      <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${card.color} mb-4`}><Icon size={32} className="text-white" /></div>
                      <h3 className="text-2xl font-bold mb-2">{card.title}</h3>
                      <p className="text-gray-300 mb-6">{card.description}</p>
                      {!alreadySubmitted && (
                        <button onClick={() => handleOpenModal(card.id)} disabled={isCompleted} className={`w-full py-3 px-6 rounded-xl font-semibold transition-all ${isCompleted ? "bg-green-500/50 cursor-not-allowed" : `bg-gradient-to-r ${card.color} hover:shadow-lg hover:scale-105`}`}>{isCompleted ? "Completed ✓" : "Start Task"}</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {alreadySubmitted && (
              <div className="mt-10 text-center">
                <button onClick={() => setFeedbackModal(true)} className="px-8 py-4 text-lg font-bold bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl hover:scale-105 transition-all">View Answers & Feedback 📝</button>
              </div>
            )}

            {!alreadySubmitted && submittedTasks.length === taskCards.length && (
              <div className="mt-10 text-center">
                <button onClick={handleFinalSubmit} className="px-8 py-4 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl hover:scale-105 transition-all">Submit All Tasks 🚀</button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Active Task Modal */}
      {activeModal && taskData && !alreadySubmitted && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-white/20">
            <div className={`bg-gradient-to-r ${taskCards.find((t) => t.id === activeModal)?.color} p-6 flex items-center justify-between`}>
              <div className="flex items-center gap-3">{React.createElement(taskCards.find((t) => t.id === activeModal)?.icon || PenTool, { size: 28 })}<h3 className="text-2xl font-bold capitalize">{activeModal} Task</h3></div>
              <button onClick={handleCloseModal} className="p-2 hover:bg-white/20 rounded-full transition-all"><X size={24} /></button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="bg-white/5 rounded-2xl p-6 mb-6 border border-white/10">
                <h4 className="text-lg font-semibold mb-3 text-purple-400">Task Instructions</h4>
                <div className="text-gray-300 whitespace-pre-wrap">{taskData[activeModal]?.prompt || "No prompt available"}</div>
              </div>

              {activeModal === "listening" && (
                <div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700" onClick={handlePlayAudio}><Headphones /> Play Audio</button>
                  <ul className="mt-4 space-y-6 text-gray-300">
                    {taskData.listening.questions?.map((q: string, idx: number) => (
                      <li key={idx} className="border-b border-white/10 pb-4">
                        <p className="mb-2">{q}</p>
                        <textarea value={responses.listening?.[idx] || ""} onChange={(e) => { const val = e.target.value; setResponses((prev) => ({ ...prev, listening: { ...prev.listening, [idx]: val } })); }} placeholder="Type your answer..." className="w-full h-20 px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-gray-400 resize-none" />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {activeModal === "speaking" && (
                <div className="space-y-4">
                  {!recording ? (<button onClick={startRecording} className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700">🎤 Start Recording</button>) : (<button onClick={stopRecording} className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700">⏹ Stop Recording</button>)}
                  {audioUrl && <audio controls src={audioUrl}></audio>}
                </div>
              )}
              {activeModal === "writing" && (
                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-300">Your Response</label>
                  <textarea value={responses.writing} onChange={(e) => setResponses((prev) => ({ ...prev, writing: e.target.value }))} placeholder="Type your response here..." className="w-full h-64 px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400 resize-none" />
                </div>
              )}
              {activeModal === "reading" && (
                <div>
                  <div className="mt-2 text-gray-300"><h4 className="font-semibold text-lg mb-2">Paragraph</h4><p>{taskData.reading.paragraph}</p></div>
                  <ul className="mt-4 space-y-6 text-gray-300">
                    {taskData.reading.questions?.map((q: string, idx: number) => (
                      <li key={idx} className="border-b border-white/10 pb-4">
                        <p className="mb-2">{q}</p>
                        <textarea value={responses.reading?.[idx] || ""} onChange={(e) => { const val = e.target.value; setResponses((prev) => ({ ...prev, reading: { ...prev.reading, [idx]: val } })); }} placeholder="Type your answer..." className="w-full h-20 px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder-gray-400 resize-none" />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-white/10 flex gap-3">
              <button onClick={handleCloseModal} className="flex-1 py-3 px-6 bg-white/10 hover:bg-white/20 rounded-xl font-semibold transition-all">Cancel</button>
              <button onClick={handleTaskComplete} className="flex-1 py-3 px-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:scale-105 transition-all rounded-xl font-semibold">Mark as Complete ✓</button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackModal && feedback && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden border border-white/20">
            <div className="flex justify-between items-center p-6 border-b border-white/10">
              <h3 className="text-2xl font-bold">AI Feedback & Your Answers</h3>
              <button
                onClick={() => setFeedbackModal(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-all"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
              {Object.keys(feedback || {}).map((taskKey) => {
                const taskFeedback = feedback[taskKey];
                return (
                  <div key={taskKey} className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <h4 className="text-xl font-semibold capitalize mb-3">{taskKey} Feedback</h4>
                    <p className="text-gray-300 mb-2 whitespace-pre-wrap"><strong>✅ Your Response:</strong> {JSON.stringify(responses[taskKey as keyof typeof responses])}</p>
                    <p className="text-green-400 font-semibold mb-1">Strengths</p>
                    <p className="text-gray-300 mb-3 whitespace-pre-wrap">{taskFeedback.strengths}</p>
                    <p className="text-red-400 font-semibold mb-1">Weaknesses</p>
                    <p className="text-gray-300 mb-3 whitespace-pre-wrap">{taskFeedback.weaknesses}</p>
                    <p className="text-blue-400 font-semibold mb-1">💡 Feedback</p>
                    <p className="text-gray-300 whitespace-pre-wrap">{taskFeedback.feedback}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyTaskPage;
