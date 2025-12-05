import React, { useState } from "react";
import { User, Lock, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/authServices";
import { useAuthStore } from "../../store/userAuthStore";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const { setUser } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await login({ email, password }, "admin");
      const admin = res.data.admin;

      setUser({
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: "admin",
      });

      navigate("/admin/home");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#EAE6F7" }}
    >
      <div
        className="w-full max-w-md shadow-2xl"
        style={{
          backgroundColor: "#3F5F5B",
          borderRadius: "30px",
          padding: "2rem",
        }}
      >
        <div className="space-y-6">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
              <User className="w-8 h-8 text-gray-600" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Spokely</h1>
            <p className="text-gray-300 text-sm">Spokely Administrator Login</p>
            <p className="text-gray-400 text-xs mt-1">
              Where voices meet and stories begin
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border-0 rounded-xl shadow-md text-gray-800 placeholder-gray-500"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border-0 rounded-xl shadow-md text-gray-800 placeholder-gray-500"
                required
              />
            </div>

            {error && (
              <p className="text-red-300 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
              style={{ backgroundColor: "#C365E1", border: "none" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#A752D1")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#C365E1")
              }
            >
              Login
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-gray-400 text-xs">
              Secure administrator access to Spokely platform
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
