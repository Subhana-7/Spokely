import React, { useState, useRef, useEffect, Suspense, lazy } from "react";
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
import {
  latestSubmission,
  topicGenerate,
  submitResponse,
} from "../../../services/dailyTaskService";

const DashboardHeader = lazy(() => import("../DashBoardComponents/Header"));
const Button = lazy(() => import("../../../modals/Button"));

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
  const [paused, setPaused] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [listeningSpeaking, setListeningSpeaking] =
    useState<SpeechSynthesisUtterance | null>(null);
  const [listeningPaused, setListeningPaused] = useState(false);

  const topics = [
    { id: "communication", label: "Communication", icon: "💬" },
    { id: "technology", label: "Technology", icon: "💻" },
    { id: "environment", label: "Environment", icon: "🌍" },
    { id: "education", label: "Education", icon: "📚" },
    { id: "health", label: "Health", icon: "🏥" },
    { id: "culture", label: "Culture", icon: "🎭" },
  ];

  const taskCards = [
    {
      id: "writing",
      title: "Writing Task",
      icon: PenTool,
      color: "from-green-500 to-emerald-500",
      description: "Express your thoughts in writing",
    },
    {
      id: "speaking",
      title: "Speaking Task",
      icon: Mic,
      color: "from-blue-500 to-cyan-500",
      description: "Practice your spoken communication",
    },
    {
      id: "listening",
      title: "Listening Task",
      icon: Headphones,
      color: "from-purple-500 to-pink-500",
      description: "Enhance your listening comprehension",
    },
    {
      id: "reading",
      title: "Reading Task",
      icon: BookOpen,
      color: "from-orange-500 to-red-500",
      description: "Improve your reading skills",
    },
  ];

  useEffect(() => {
    const fetchExistingTask = async () => {
      setLoading(true);
      try {
        const response = await latestSubmission();
        const data = response.data;
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
              data.task[key]?.feedback || data.task.feedback?.[key] || null;
            if (fb)
              normalizedFeedback[key] = fb.feedback
                ? fb
                : {
                    strengths: fb.strengths || "",
                    weaknesses: fb.weaknesses || "",
                    feedback: fb.feedback || fb || "",
                  };
          }

          setFeedback(
            Object.keys(normalizedFeedback).length ? normalizedFeedback : {}
          );
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
    setAudioUrl(
      (responses[taskType as keyof typeof responses] as string) || null
    );
  };

  const handleCloseModal = () => setActiveModal(null);

  const handleTaskComplete = () => {
    if (!activeModal) return;
    const response = responses[activeModal as keyof typeof responses];
    const isValid =
      typeof response === "string"
        ? response.trim() !== ""
        : response && Object.values(response).some((val) => val.trim() !== "");
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
      const response = await submitResponse(taskData.id, responses);
      const data = await response.data;
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
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setResponses((prev) => ({ ...prev, speaking: url }));
    };
    mediaRecorder.start();
    setRecording(true);
    setPaused(false);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    setPaused(false);
  };

  const pauseRecording = () => {
    mediaRecorderRef.current?.pause();
    setPaused(true);
  };

  const resumeRecording = () => {
    mediaRecorderRef.current?.resume();
    setPaused(false);
  };

  const handlePlayAudio = () => {
    if (!taskData.listening?.paragraph) return;

    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(
      taskData.listening.paragraph
    );
    utterance.lang = "en-US";

    utterance.onend = () => {
      setListeningSpeaking(null);
      setListeningPaused(false);
    };

    speechSynthesis.speak(utterance);
    setListeningSpeaking(utterance);
    setListeningPaused(false);
  };

  const pauseListening = () => {
    speechSynthesis.pause();
    setListeningPaused(true);
  };

  const resumeListening = () => {
    speechSynthesis.resume();
    setListeningPaused(false);
  };

  const stopListening = () => {
    speechSynthesis.cancel();
    setListeningSpeaking(null);
    setListeningPaused(false);
  };

  return (
    <Suspense fallback={<p>Loading Daily Task...</p>}>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-24">
        <DashboardHeader />

        <div className="max-w-7xl mx-auto px-6 pt-6">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent tracking-tight mb-2">
              Daily Language Tasks
            </h1>
            <p className="text-gray-400 text-lg">
              Challenge yourself with interactive skill tasks each day
            </p>
          </div>

          {/* Topic Selection */}
          {!selectedTopic && !alreadySubmitted && (
            <div className="mb-16">
              <h2 className="text-2xl font-semibold text-center mb-8 text-green-400">
                Choose Your Topic
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {topics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => handleTopicSelect(topic.id)}
                    className="group relative bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-green-500/20"
                  >
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                      {topic.icon}
                    </div>
                    <div className="text-sm font-semibold text-white">
                      {topic.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500"></div>
              <p className="mt-4 text-xl text-gray-300">
                Loading your tasks...
              </p>
            </div>
          )}

          {/* Tasks Display */}
          {selectedTopic && taskData && !loading && (
            <>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-emerald-400 capitalize">
                    {selectedTopic} Tasks
                  </h2>
                  <p className="text-gray-400 mt-1">
                    Complete all four tasks to master today’s challenge
                  </p>
                </div>
                {!alreadySubmitted && (
                  <Button
                    onClick={() => {
                      setSelectedTopic("");
                      setTaskData(null);
                      setSubmittedTasks([]);
                      setResponses({
                        writing: "",
                        speaking: null,
                        listening: {},
                        reading: {},
                      });
                    }}
                    className="px-6 py-3 bg-white/10 backdrop-blur-md border border-gray-700 rounded-xl hover:bg-white/20 transition-all"
                  >
                    Change Topic
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {taskCards.map((card) => {
                  const Icon = card.icon;
                  const isCompleted =
                    submittedTasks.includes(card.id) || alreadySubmitted;
                  return (
                    <div
                      key={card.id}
                      className="backdrop-blur-lg bg-white/10 border border-white/10 rounded-2xl p-8 hover:border-green-500/40 shadow-lg transition-all duration-300 hover:shadow-emerald-500/10 hover:scale-[1.02]"
                    >
                      <div
                        className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${card.color} mb-4`}
                      >
                        <Icon size={32} className="text-white" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">{card.title}</h3>
                      <p className="text-gray-300 mb-6">{card.description}</p>
                      {!alreadySubmitted && (
                        <Button
                          onClick={() => handleOpenModal(card.id)}
                          disabled={isCompleted}
                          className={`w-full py-3 px-6 rounded-xl font-semibold transition-all ${
                            isCompleted
                              ? "bg-green-500/50 cursor-not-allowed"
                              : `bg-gradient-to-r ${card.color} hover:shadow-lg hover:scale-105`
                          }`}
                        >
                          {isCompleted ? "Completed ✓" : "Start Task"}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>

              {alreadySubmitted && (
                <div className="mt-10 text-center">
                  <Button
                    onClick={() => setFeedbackModal(true)}
                    className="px-8 py-4 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl hover:scale-105 transition-all"
                  >
                    View Answers & Feedback 📝
                  </Button>
                </div>
              )}

              {!alreadySubmitted &&
                submittedTasks.length === taskCards.length && (
                  <div className="mt-10 text-center">
                    <Button
                      onClick={handleFinalSubmit}
                      className="px-8 py-4 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl hover:scale-105 transition-all"
                    >
                      Submit All Tasks 🚀
                    </Button>
                  </div>
                )}
            </>
          )}

          {/* Feedback Modal */}
          {feedbackModal && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-gray-900 rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden border border-white/20">
                <div className="flex justify-between items-center p-6 border-b border-white/10">
                  <h3 className="text-2xl font-bold text-green-400">
                    AI Feedback & Your Answers
                  </h3>
                  <button
                    onClick={() => setFeedbackModal(false)}
                    className="p-2 hover:bg-white/20 rounded-full transition-all"
                  >
                    <X size={24} />
                  </button>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
                  {feedback && Object.keys(feedback).length > 0 ? (
                    Object.keys(feedback).map((taskKey) => {
                      const taskFeedback = feedback[taskKey];
                      return (
                        <div
                          key={taskKey}
                          className="bg-white/5 p-4 rounded-xl border border-white/10"
                        >
                          <h4 className="text-xl font-semibold capitalize mb-3 text-emerald-400">
                            {taskKey} Feedback
                          </h4>
                          <p className="text-green-400 font-semibold mb-1">
                            Strengths
                          </p>
                          <p className="text-gray-300 mb-3 whitespace-pre-wrap">
                            {taskFeedback.strengths || "N/A"}
                          </p>
                          <p className="text-red-400 font-semibold mb-1">
                            Weaknesses
                          </p>
                          <p className="text-gray-300 mb-3 whitespace-pre-wrap">
                            {taskFeedback.weaknesses || "N/A"}
                          </p>
                          <p className="text-blue-400 font-semibold mb-1">
                            💡 Feedback
                          </p>
                          <p className="text-gray-300 whitespace-pre-wrap">
                            {taskFeedback.feedback || "No feedback provided."}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-400 text-center">
                      No feedback available yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Suspense>
  );
};

export default DailyTaskPage;
