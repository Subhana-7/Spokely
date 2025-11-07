import { useEffect, useState } from "react";
import DashboardHeader from "./DashBoardComponents/Header";
import { Award, Star, User, MessageSquare } from "lucide-react";
import Badge from "../../components/common/Badge";
import {
  subscriptionStartPayment,
  subscriptionConfirmPayment,
} from "../../services/paymentService";
import { useAuthStore } from "../../store/userAuthStore";
import { useParams } from "react-router-dom";
import {
  getMentorPlans,
  subscribeMentor,
  getUserSubscriptions,
} from "../../services/subscriptionService";
import { mentorProfile } from "../../services/authServices";

interface Plan {
  _id: string;
  type: string;
  price: number;
  time: number;
}

interface Mentor {
  _id: string;
  name: string;
  bio?: string;
  profilePicture?: string;
  tags?: string[];
  sessionsDone?: number;
  role?: "mentor" | "user";
  uniqueCode?: string;
}

interface Subscription {
  _id: string;
  userId: string;
  mentorId: {
    _id: string;
    name?: string;
    profilePicture?: string;
  };
  plan: string;
  price: number;
  status: string;
}

const UserViewMentorProfile = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [userSubscriptions, setUserSubscriptions] = useState<Subscription[]>([]);
  const [showPayPalModal, setShowPayPalModal] = useState(false);
  const [activePlan, setActivePlan] = useState<Plan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<{
    status: "success" | "error";
    message: string;
  } | null>(null);

  const { user } = useAuthStore();
  const mentorId = useParams<{ id: string }>();

  // ⭐ Rating & Feedback State
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!mentorId.id || !user?.id) return;

    const fetchMentorDetails = async () => {
      try {
        const data = await mentorProfile(mentorId.id!);
        setMentor(data);
      } catch (err) {
        console.error("Failed to fetch mentor details:", err);
      }
    };

    const fetchPlans = async () => {
      try {
        const res = await getMentorPlans(mentorId.id!);
        setPlans(res.data || []);
      } catch (err) {
        console.error("Failed to load subscription plans:", err);
        setPlans([]);
      }
    };

    const fetchUserSubscriptions = async () => {
      try {
        const res = await getUserSubscriptions(user.id);
        const subs =
          Array.isArray(res.data)
            ? res.data
            : res.data?.subscriptions || res.subscriptions || [];
        setUserSubscriptions(subs);
      } catch (err) {
        console.error("Failed to fetch user subscriptions:", err);
        setUserSubscriptions([]);
      }
    };

    fetchMentorDetails();
    fetchPlans();
    fetchUserSubscriptions();
  }, [mentorId, user?.id]);

  const formatTime = (hour: number) => {
    if (hour >= 1 && hour <= 8) return `${hour} PM`;
    if (hour >= 9 && hour <= 11) return `${hour} AM`;
    if (hour === 12) return `12 PM`;
    return `${hour} AM`;
  };

  const handleSubscribe = (plan: Plan) => {
    setActivePlan(plan);
    setShowPayPalModal(true);
  };

  const isSubscribedToPlan = (plan: Plan) => {
    return userSubscriptions.some(
      (sub) =>
        sub.mentorId._id === mentorId.id &&
        sub.plan.toLowerCase() === plan.type.toLowerCase() &&
        sub.status === "ACTIVE"
    );
  };

  useEffect(() => {
    if (!showPayPalModal || !activePlan) return;

    const container = document.getElementById("paypal-button-container");
    if (!container) return;
    container.innerHTML = "";

    const loadPaypalButtons = async () => {
      try {
        const paypalNamespace = await import("@paypal/paypal-js");
        const paypal = await paypalNamespace.loadScript({
          clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
          currency: "USD",
        });

        if (!paypal?.Buttons) {
          setPaymentResult({
            status: "error",
            message: "PayPal failed to load",
          });
          setShowPayPalModal(false);
          return;
        }

        const buttons = paypal.Buttons({
          createOrder: async () => {
            try {
              const resp = await subscriptionStartPayment(
                activePlan._id,
                activePlan.price
              );
              return resp.data?.id || resp.orderId;
            } catch (err: any) {
              console.error("createOrder error:", err);
              setShowPayPalModal(false);
              setPaymentResult({
                status: "error",
                message: err?.message || "Failed to create order.",
              });
              throw err;
            }
          },

          onApprove: async (data: any) => {
            try {
              setIsProcessing(true);
              const orderId = data.orderID;
              const verify = await subscriptionConfirmPayment(
                orderId,
                activePlan._id
              );

              if (
                verify.data?.status === "COMPLETED" ||
                verify.data?.message
                  ?.toLowerCase()
                  .includes("captured successfully")
              ) {
                await subscribeMentor({
                  mentorId: mentorId.id,
                  plan: activePlan.type,
                  price: activePlan.price,
                  userId: user?.id,
                  time: activePlan.time,
                });

                setPaymentResult({
                  status: "success",
                  message:
                    verify.data?.message || "Subscription successful! 🎉",
                });

                const res = await getUserSubscriptions(user!.id);
                setUserSubscriptions(res.data || []);
              } else {
                setPaymentResult({
                  status: "error",
                  message:
                    verify.data?.message || "Payment verification failed.",
                });
              }
            } catch (err: any) {
              console.error("onApprove error:", err);
              setPaymentResult({
                status: "error",
                message: err?.message || "Payment failed.",
              });
            } finally {
              setIsProcessing(false);
              setShowPayPalModal(false);
            }
          },

          onCancel: () => {
            setShowPayPalModal(false);
            setPaymentResult({ status: "error", message: "Payment cancelled" });
          },
          onError: (err: any) => {
            console.error("PayPal error:", err);
            setShowPayPalModal(false);
            setPaymentResult({
              status: "error",
              message: "Payment error. Please try again.",
            });
          },
        });

        buttons.render("#paypal-button-container");
      } catch (err) {
        console.error("PayPal script load error:", err);
        const container = document.getElementById("paypal-button-container");
        if (container) container.innerText = "PayPal failed to load";
      }
    };

    loadPaypalButtons();
  }, [showPayPalModal, activePlan, mentorId, user]);

  if (!mentor) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <DashboardHeader />

      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT PROFILE CARD */}
          <div className="lg:col-span-1">
            <div className="backdrop-blur-lg bg-white/10 rounded-2xl shadow-lg p-6 border border-white/10">
              <div className="text-center mb-6">
                <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                  {mentor.profilePicture ? (
                    <img
                      src={mentor.profilePicture}
                      alt={mentor.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User size={48} className="text-white" />
                  )}
                </div>

                <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent mb-2">
                  {mentor.name || "Mentor Name"}
                </h2>

                <Badge variant="mentor" className="mb-2">
                  {mentor.role === "mentor" ? "Mentor" : "User"}
                </Badge>

                <p className="text-sm text-gray-300 mb-4">
                  {mentor.bio
                    ? mentor.bio.slice(0, 80) + "..."
                    : "No bio available"}
                </p>

                <div className="flex items-center justify-center mb-4">
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

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-400">
                      {mentor.uniqueCode?.slice(-3) || "000"}
                    </div>
                    <div className="text-xs text-gray-400">Mentor ID</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-400">
                      {mentor.sessionsDone || 0}
                    </div>
                    <div className="text-xs text-gray-400">Sessions Done</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-400">98%</div>
                    <div className="text-xs text-gray-400">Success Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE DETAILS */}
          <div className="lg:col-span-2 space-y-6">
            {/* ABOUT */}
            <div className="backdrop-blur-lg bg-white/10 rounded-2xl shadow-lg p-6 border border-white/10">
              <h3 className="text-xl font-bold flex items-center mb-4 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                <User size={20} className="mr-2 text-green-400" /> About{" "}
                {mentor.name}
              </h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                {mentor.bio || "This mentor has not added a bio yet."}
              </p>
            </div>

            {/* EXPERTISE */}
            <div className="backdrop-blur-lg bg-white/10 rounded-2xl shadow-lg p-6 border border-white/10">
              <h3 className="text-xl font-bold flex items-center mb-4 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                <Award size={20} className="mr-2 text-green-400" /> Expertise &
                Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {mentor.tags?.length ? (
                  mentor.tags.map((tag) => (
                    <Badge key={tag} variant="mentor">
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="mentor">No skills added</Badge>
                )}
              </div>
            </div>

            {/* SUBSCRIPTION */}
            <div className="backdrop-blur-lg bg-white/10 rounded-2xl shadow-lg p-6 border border-white/10">
              <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                Subscription Plans
              </h3>
              {plans.length === 0 ? (
                <p className="text-gray-300">Mentor has no subscription</p>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {plans.map((plan) => {
                    const subscribed = isSubscribedToPlan(plan);
                    return (
                      <div
                        key={plan._id}
                        className="p-4 rounded-xl bg-gray-800/40 border border-white/10"
                      >
                        <h4 className="text-lg font-semibold text-green-400">
                          {plan.type} ({formatTime(plan.time)})
                        </h4>
                        <p className="text-gray-300">₹{plan.price} / month</p>
                        <div className="mt-4">
                          {subscribed ? (
                            <div className="flex items-center gap-2 text-green-400 font-medium">
                              ✅ Subscribed Mentor
                            </div>
                          ) : (
                            <button
                              disabled={isProcessing || subscribed}
                              className={`px-6 py-2 rounded-full font-medium bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-105 transition disabled:opacity-50 ${
                                subscribed
                                  ? "cursor-not-allowed bg-gray-600/40"
                                  : ""
                              }`}
                              onClick={() => handleSubscribe(plan)}
                            >
                              {subscribed
                                ? "Subscribed"
                                : isProcessing
                                ? "Processing..."
                                : "Subscribe"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ⭐ FEEDBACK & RATING CARD */}
            <div className="backdrop-blur-lg bg-white/10 rounded-2xl shadow-lg p-6 border border-white/10">
              <h3 className="text-xl font-bold flex items-center mb-4 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                <MessageSquare size={20} className="mr-2 text-green-400" />{" "}
                Rate & Share Feedback
              </h3>

              <div className="flex items-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={28}
                    className={`cursor-pointer transition ${
                      star <= (hover || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-500"
                    }`}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>

              <textarea
                className="w-full bg-gray-900/50 text-gray-200 border border-gray-700 rounded-lg p-3 mb-3"
                placeholder="Write your feedback here..."
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />

              <button
                disabled={!rating}
                className={`px-6 py-2 rounded-full font-medium ${
                  rating
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-105"
                    : "bg-gray-600 cursor-not-allowed"
                } transition`}
              >
                Submit Feedback
              </button>

              {rating > 0 && (
                <p className="mt-3 text-sm text-gray-400">
                  ⭐ You rated this mentor <span className="text-yellow-400">{rating}</span>/5
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PAYMENT MODAL */}
      {showPayPalModal && activePlan && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative">
            <button
              onClick={() => (isProcessing ? null : setShowPayPalModal(false))}
              className={`absolute top-2 right-2 ${
                isProcessing
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-500 hover:text-gray-800"
              }`}
              disabled={isProcessing}
            >
              ✕
            </button>
            <h2 className="text-lg font-bold mb-4">Complete Payment</h2>
            <div id="paypal-button-container" />
            {isProcessing && (
              <div className="mt-4 text-sm text-gray-600 text-center">
                Finalizing payment… please wait
              </div>
            )}
          </div>
        </div>
      )}

      {/* PAYMENT RESULT */}
      {paymentResult && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative text-center">
            <h2
              className={`text-lg font-bold mb-4 ${
                paymentResult.status === "success"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {paymentResult.status === "success"
                ? "Payment Successful"
                : "Payment Failed"}
            </h2>
            <p className="text-gray-700 mb-6">{paymentResult.message}</p>
            <button
              onClick={() => setPaymentResult(null)}
              className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserViewMentorProfile;
