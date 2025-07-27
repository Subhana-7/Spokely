import React, { useState } from "react";
import {
  MessageCircle,
  Video,
  Users,
  Trophy,
  BarChart3,
  BookOpen,
  ArrowRight,
  Play,
  Star,
  Target,
} from "lucide-react";
import SignupModal from "../modals/SignupModal";
import LoginModal from "../modals/LoginModal";
import OTPModal from "../modals/OTPModal";
import RoleSelectionModal from "../modals/RoleSelectionModal";
import ChangePasswordModal from "../modals/ChangePasswordModal";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { setRole } from "../services/authServices";
import { useAuthStore } from "../store/userAuthStore";
import AppIcon from "../assets/app-icon.png";

const LandingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("auth-token");
  const showRoleFlag = queryParams.get("showRole") === "true";
  const { setRole: setGlobalRole } = useAuthStore();

  const [activeModal, setActiveModal] = useState<string | null>(null);

  const openModal = (modalName: string) => setActiveModal(modalName);
  const closeModal = () => setActiveModal(null);

  const showRoleModal = location.pathname === "/role-selection";

  const handleRoleContinue = async (role: "user" | "mentor") => {
    const token = useAuthStore.getState().token;
    try {
      await setRole(role);
      setGlobalRole(role);
      if (role === "user") navigate("/user/home");
      else navigate("/mentor/home");
    } catch (error) {
      console.error("Role update failed:", error);
    }
  };

  useEffect(() => {
    if (token) {
      if (showRoleFlag) setActiveModal("role");

      const newURL = window.location.pathname;
      window.history.replaceState({}, document.title, newURL);
    }
  }, [token, showRoleFlag]);

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 md:py-2">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img
                  src={AppIcon}
                  alt="Spokely Logo"
                  className="w-18 h-18 rounded-full object-cover m-0 p-0"
                />
                <span className="text-2xl font-bold text-gray-900">
                  Spokely
                </span>
              </div>
              <div className="hidden md:block">
                <span className="text-gray-600 text-sm font-medium">
                  Learn communication for speaking
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => openModal("login")}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => openModal("signup")}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors shadow-sm"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-br from-emerald-50 to-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Spokely
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-4xl mx-auto leading-relaxed">
            Transform your communication skills through personalized video
            sessions with expert mentors and passionate peers.
          </p>

          <div className="flex flex-col md:flex-row gap-6 justify-center items-center max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 flex-1 max-w-md">
              <div className="flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-lg mb-4 mx-auto">
                <BookOpen className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                For Learners
              </h3>
              <p className="text-gray-600 mb-6">
                Connect with expert mentors and join interactive sessions to
                boost your speaking confidence.
              </p>
              <button
                onClick={() => openModal("signup")}
                className="w-full bg-emerald-600 text-white py-3 px-6 rounded-lg hover:bg-emerald-700 font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <span>Start your Journey</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 flex-1 max-w-md">
              <div className="flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-lg mb-4 mx-auto">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                For Mentors
              </h3>
              <p className="text-gray-600 mb-6">
                Share your expertise, mentor passionate learners, and make a
                meaningful impact on their journey.
              </p>
              <button
                onClick={() => openModal("signup")}
                className="w-full bg-emerald-600 text-white py-3 px-6 rounded-lg hover:bg-emerald-700 font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <span>Start your Journey</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to excel
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools and features designed to accelerate your
              communication journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-center w-14 h-14 bg-emerald-100 rounded-xl mb-6">
                <Video className="h-7 w-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Public & Private Mentor Sessions
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Join live group sessions or book one-on-one mentoring calls with
                industry experts to practice real-world communication scenarios.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-center w-14 h-14 bg-emerald-100 rounded-xl mb-6">
                <Trophy className="h-7 w-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Quizzes & Gamified Learning
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Engage with interactive quizzes, challenges, and gamified
                exercises that make learning communication skills fun and
                memorable.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-center w-14 h-14 bg-emerald-100 rounded-xl mb-6">
                <BarChart3 className="h-7 w-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Track Your Journey with Reports
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Monitor your progress with detailed analytics, performance
                insights, and personalized feedback to continuously improve your
                skills.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Empower others as a mentor
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join our community of expert mentors and make a lasting impact on
              learners worldwide
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-center w-14 h-14 bg-emerald-100 rounded-xl mb-6">
                <Target className="h-7 w-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Share Your Expertise
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Lead impactful sessions, share industry insights, and help
                learners develop confidence in their communication abilities.
              </p>
              <button
                onClick={() => openModal("signup")}
                className="bg-emerald-600 text-white py-2 px-6 rounded-lg hover:bg-emerald-700 font-medium transition-colors inline-flex items-center space-x-2"
              >
                <span>Start Mentoring</span>
                <Play className="h-4 w-4" />
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-center w-14 h-14 bg-emerald-100 rounded-xl mb-6">
                <Star className="h-7 w-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Build Your Reputation
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Grow your professional network, earn recognition for your
                mentoring skills, and establish yourself as a thought leader.
              </p>
              <button
                onClick={() => openModal("signup")}
                className="bg-emerald-600 text-white py-2 px-6 rounded-lg hover:bg-emerald-700 font-medium transition-colors inline-flex items-center space-x-2"
              >
                <span>Join Community</span>
                <Users className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 bg-gray-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Demo Modal Components
          </h3>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => openModal("signup")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Signup Modal
            </button>
            <button
              onClick={() => openModal("login")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Login Modal
            </button>
            <button
              onClick={() => openModal("otp")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              OTP Modal
            </button>
            <button
              onClick={() => openModal("role")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Role Selection
            </button>
            <button
              onClick={() => openModal("password")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Change Password
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <MessageCircle className="h-8 w-8 text-emerald-400" />
                <span className="text-2xl font-bold">Spokely</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
                Spokely is a revolutionary communication training platform that
                connects learners with expert mentors to transform speaking
                skills through personalized video sessions and interactive
                learning experiences.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    For Learners
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    For Mentors
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Group Sessions
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Private Coaching
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Community
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Resources
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              ©2025 Spokely. Built with passion for better communication.
            </p>
          </div>
        </div>
      </footer>

      <SignupModal
        isOpen={activeModal === "signup"}
        onClose={closeModal}
        onSwitchToLogin={() => openModal("login")}
      />

      <LoginModal
        isOpen={activeModal === "login"}
        onClose={closeModal}
        onSwitchToSignup={() => openModal("signup")}
        onForgotPassword={() => openModal("password")}
      />

      <OTPModal
        isOpen={activeModal === "otp"}
        onClose={closeModal}
        email="demo@example.com"
        role="user"
        onVerify={() => openModal("role")}
      />

      <RoleSelectionModal
        isOpen={activeModal === "role"}
        onClose={closeModal}
        onContinue={async (role) => {
          try {
            await setRole(role);
            closeModal();
            if (role === "mentor") {
              navigate("/mentor/home");
            } else {
              navigate("/user/home");
            }
          } catch (err) {
            console.error(err);
            alert("Error updating role");
          }
        }}
      />

      <ChangePasswordModal
        isOpen={activeModal === "password"}
        onClose={closeModal}
        onChangePassword={() => {
          console.log("Password changed");
          closeModal();
        }}
      />

      {showRoleModal && (
        <RoleSelectionModal
          isOpen={true}
          onClose={() => navigate("/")}
          onContinue={handleRoleContinue}
        />
      )}
    </div>
  );
};

export default LandingPage;
