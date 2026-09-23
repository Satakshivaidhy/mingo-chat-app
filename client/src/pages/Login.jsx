import React, { useState } from "react";
import toast from "react-hot-toast";
import api from "../config/api";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { setUser, setIsLogin } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClearForm = () => {
    setFormData({ email: "", password: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", formData);
      toast.success(res.data.message);
      sessionStorage.setItem("AppUser", JSON.stringify(res.data.data));
      setUser(res.data.data);
      setIsLogin(true);
      handleClearForm();
      navigate("/chat");
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-base-200/60 p-3 sm:p-6">
      <div className="w-full max-w-md my-auto">
        <div className="card bg-base-100 shadow-xl border border-base-300/60">
          <div className="card-body p-5 sm:p-8">
            <h2 className="card-title text-2xl sm:text-3xl justify-center text-primary font-bold">
              Login
            </h2>
            <p className="text-center text-xs sm:text-sm text-base-content/70 mb-4 sm:mb-6">
              Welcome back to Mingo Chat 👋
            </p>

            <form onSubmit={handleSubmit} onReset={handleClearForm} className="space-y-3 sm:space-y-4">
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  className="input input-bordered w-full h-11 sm:h-12 text-sm"
                />
              </div>

              <div>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  className="input input-bordered w-full h-11 sm:h-12 text-sm"
                />
              </div>

              <div className="flex gap-2.5 sm:gap-3 pt-3 sm:pt-4">
                <button
                  type="reset"
                  disabled={loading}
                  className="btn btn-secondary btn-outline flex-1 min-h-[42px] sm:min-h-[46px] text-sm"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary flex-1 min-h-[42px] sm:min-h-[46px] text-sm shadow-md"
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </div>
            </form>

            <p className="text-center text-xs sm:text-sm text-base-content/60 mt-4 sm:mt-6">
              No account?{" "}
              <Link to="/register" className="text-primary font-semibold hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-base-content/50 mt-4">
          Your data is safe with us 🔐
        </p>
      </div>
    </div>
  );
};

export default Login;