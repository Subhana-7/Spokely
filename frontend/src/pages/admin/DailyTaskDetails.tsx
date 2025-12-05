import { useEffect, useState, type JSX } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Book,
  Mic,
  Volume2,
  ClipboardList,
  FileText,
  User,
} from "lucide-react";
import { getAdminTaskById } from "../../services/adminService";

interface Feedback {
  strengths: string;
  weaknesses: string;
  feedback: string;
}

interface Section {
  prompt: string;
  paragraph?: string;
  questions?: string[];
  userResponse?: any;
  feedback?: Feedback;
}

interface DailyTask {
  _id: string;
  userId: string;
  topic: string;
  date: string;
  writing: Section;
  reading: Section;
  speaking: Section;
  listening: Section;
}

const DailyTaskDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [task, setTask] = useState<DailyTask | null>(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
  if (!id) {
    console.error("Missing ID param");
    return;
  }

  const fetchTask = async () => {
    try {
      const res = await getAdminTaskById(id); 
      setTask(res.data.task || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  fetchTask();
}, [id]);


  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-200">
        Loading task details...
      </div>
    );

  if (!task)
    return (
      <div className="min-h-screen flex justify-center items-center text-red-400">
        Task not found.
      </div>
    );

  const renderSection = (
    title: string,
    icon: JSX.Element,
    section: Section,
    type: "writing" | "reading" | "speaking" | "listening"
  ) => (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-lg mb-10">
      {/* Header */}
      <h2 className="text-xl font-semibold flex items-center gap-2 text-emerald-400 mb-4">
        {icon} {title}
      </h2>

      {/* Prompt */}
      <div className="mb-4">
        <p className="text-gray-400 text-sm mb-1">Prompt</p>
        <p className="text-white font-medium">{section.prompt}</p>
      </div>

      {/* Paragraph (for reading or listening) */}
      {section.paragraph && (
        <div className="mb-4 bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-300 whitespace-pre-line">
            {section.paragraph}
          </p>
        </div>
      )}

      {/* Audio Preview for speaking */}
      {type === "speaking" && section.userResponse && (
        <div className="my-4 bg-gray-800/40 p-4 rounded-xl border border-gray-700">
          <p className="text-gray-300 mb-2">User Audio Response:</p>
          <audio
            controls
            src={section.userResponse}
            className="w-full mt-2"
          ></audio>
        </div>
      )}

      {/* Question → Answer mapping */}
      {section.questions && section.questions.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-200 mb-3">
            Questions & Answers
          </h3>

          <div className="space-y-3">
            {section.questions.map((q, index) => (
              <div
                key={index}
                className="bg-gray-800/40 p-3 rounded-xl border border-gray-700"
              >
                <p className="text-gray-400 text-sm mb-1">
                  Q{index + 1}: {q}
                </p>
                <p className="text-white font-medium">
                  Answer:{" "}
                  {section.userResponse?.[index] || (
                    <span className="text-gray-500 italic">No answer</span>
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Simple response (writing / speaking) */}
      {typeof section.userResponse === "string" && type !== "speaking" && (
        <div className="mb-4">
          <p className="text-gray-400 text-sm mb-1">User Response</p>
          <p className="text-white bg-gray-800/40 p-3 rounded-xl border border-gray-700">
            {section.userResponse}
          </p>
        </div>
      )}

      {/* Feedback */}
      <div className="mt-6 bg-gray-800/40 p-4 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold text-emerald-400 mb-2">
          Feedback Summary
        </h3>
        <p className="text-gray-300 mb-2">
          <strong>Strengths:</strong> {section.feedback?.strengths || "N/A"}
        </p>
        <p className="text-gray-300 mb-2">
          <strong>Weaknesses:</strong> {section.feedback?.weaknesses || "N/A"}
        </p>
        <p className="text-gray-300">
          <strong>Feedback:</strong> {section.feedback?.feedback || "N/A"}
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-12 px-6">
      {/* Header */}
      <div className="flex items-center max-w-5xl mx-auto mb-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors mr-4"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
          Daily Task Details
        </h1>
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Task Summary */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-lg mb-10">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-2 text-emerald-400">
            <ClipboardList size={22} /> {task.topic.toUpperCase()}
          </h2>

          <div className="flex items-center gap-3 mb-3">
            <User size={18} className="text-emerald-400" />

            <button
              onClick={() =>
                (window.location.href = `/user-profile/${task.userId}`)
              }
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 
               transition text-white text-sm font-medium shadow-md"
            >
              View User Details
            </button>
          </div>

          <p className="text-gray-300">
            <FileText size={14} className="inline mr-2" />
            Date: {new Date(task.date).toLocaleDateString()}
          </p>
        </div>

        {/* Sections */}
        {renderSection(
          "Writing Section",
          <Book size={20} />,
          task.writing,
          "writing"
        )}
        {renderSection(
          "Reading Section",
          <FileText size={20} />,
          task.reading,
          "reading"
        )}
        {renderSection(
          "Speaking Section",
          <Mic size={20} />,
          task.speaking,
          "speaking"
        )}
        {renderSection(
          "Listening Section",
          <Volume2 size={20} />,
          task.listening,
          "listening"
        )}
      </div>
    </div>
  );
};

export default DailyTaskDetails;
