import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Button from "../../modals/Button";
import {
  mentorVerification,
  approveMentor,
  rejectMentor,
} from "../../services/adminService";

interface Mentor {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  document?: {
    documentUrl: string;
    textMessage: string;
    verificationStatus: "pending" | "approved" | "rejected";
    rejectionReason?: string;
  };
}

const MentorVerification = () => {
  const { id } = useParams<{ id: string }>();
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [showRejectionInput, setShowRejectionInput] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) fetchMentor();
  }, [id]);

  const fetchMentor = async () => {
    try {
      if (!id) return;
      setLoading(true);
      const res = await mentorVerification(id);
      setMentor(res.data[0] || null);
    } catch (err) {
      console.error("Error fetching mentor:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveMentor(id);
      fetchMentor(); // Refresh status
    } catch (err) {
      console.error("Error approving mentor:", err);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectionReason) return alert("Please provide a rejection reason.");
    try {
      await rejectMentor(id, { rejectionReason });
      fetchMentor(); // Refresh status
    } catch (err) {
      console.error("Error rejecting mentor:", err);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        🧾 Mentor Document Verifications
      </h2>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : !mentor ? (
        <p className="text-gray-600">
          Mentor not found or document not submitted.
        </p>
      ) : (
        <div
          key={mentor._id}
          className="bg-white shadow-md rounded-xl p-6 mb-6 border border-gray-200"
        >
          <div className="flex justify-between mb-4">
            <div>
              <p className="font-semibold text-lg">{mentor.name}</p>
              <p className="text-gray-600 text-sm">{mentor.email}</p>
              <p className="text-gray-500 text-sm">
                Email Verified on{" "}
                {new Date(mentor.createdAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <span
              className={`text-sm rounded-2xl font-medium px-2 py-0.5 ${
                mentor.document?.verificationStatus === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : mentor.document?.verificationStatus === "approved"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {mentor.document?.verificationStatus || "No document"}
            </span>
          </div>

          {mentor.document ? (
            <>
              <div className="mb-3">
                <p className="font-medium text-gray-800">Text Message:</p>
                <p className="text-gray-700 bg-gray-50 p-3 rounded mt-1">
                  {mentor.document.textMessage}
                </p>
              </div>

              <div className="mb-3">
                <p className="font-medium text-gray-800 mb-1">
                  Submitted Document:
                </p>
                <a
                  href={mentor.document.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  View Document
                </a>
              </div>

              {mentor.document.verificationStatus === "pending" && (
                <div className="flex flex-col gap-2 mt-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      onClick={() => handleApprove(mentor._id)}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setShowRejectionInput(true);
                        setRejectionReason("");
                      }}
                    >
                      Reject
                    </Button>
                  </div>

                  {showRejectionInput && (
                    <>
                      <textarea
                        placeholder="Write rejection reason here..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="mt-2 border border-red-300 focus:outline-none focus:ring-2 focus:ring-red-400 rounded p-2 text-sm text-gray-700"
                      />
                      <Button
                        variant="primary"
                        onClick={() => handleReject(mentor._id)}
                        className="mt-2"
                      >
                        Confirm Reject
                      </Button>
                    </>
                  )}
                </div>
              )}

              {mentor.document.verificationStatus === "rejected" && (
                <div className="mt-4">
                  <p className="text-sm text-red-600 font-medium mb-1">
                    Rejection Reason:
                  </p>
                  <div className="border border-red-300 bg-red-50 rounded p-3 text-sm text-gray-800">
                    {mentor.document.rejectionReason || "No reason provided."}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-gray-600 bg-yellow-50 p-4 rounded-lg">
              <p>No document information available for this mentor.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MentorVerification;
