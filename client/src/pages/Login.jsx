import React, { useState } from "react";
import toast from "react-hot-toast";
import api from "../config/api";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const REGEX = {
  email: /^[\w.]+@(gmail|outlook|yahoo|ricr)\.(com|in|co\.in)$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
};

const MESSAGES = {
  email: "Enter a valid email (e.g. user@gmail.com)",
  password: "Min 8 chars with uppercase, lowercase, number & special character",
};

const Login = () => {
  const navigate = useNavigate();
  const { setUser, setIsLogin } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotData, setForgotData] = useState({ email: "", newPassword: "", confirmPassword: "" });
  const [forgotLoading, setForgotLoading] = useState(false);

  const validateField = (name, value) => {
    if (!value.trim()) return "This field is required";
    if (name === "confirmPassword") return value !== forgotData.newPassword ? "Passwords do not match" : "";
    if (REGEX[name] && !REGEX[name].test(value)) return MESSAGES[name];
    return "";
  };

  const validateAll = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const msg = validateField(key, formData[key]);
      if (msg) newErrors[key] = msg;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleClearForm = () => {
    setFormData({ email: "", password: "" });
    setErrors({});
    setTouched({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!validateAll()) {
      toast.error("Please fix the errors before submitting");
      return;
    }
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

  const handleForgotPasswordChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...forgotData, [name]: value };
    setForgotData(updatedData);
    if (name === "newPassword" && forgotData.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: updatedData.confirmPassword !== value ? "Passwords do not match" : "" }));
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();

    const emailIsValid = REGEX.email.test(forgotData.email);
    const newPasswordValid = REGEX.password.test(forgotData.newPassword);
    const passwordsMatch = forgotData.newPassword === forgotData.confirmPassword;

    if (!forgotData.email || !forgotData.newPassword || !forgotData.confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!emailIsValid) {
      toast.error("Enter a valid email");
      return;
    }
    if (!newPasswordValid) {
      toast.error("Password must be at least 8 characters with uppercase, lowercase, number and special character");
      return;
    }
    if (!passwordsMatch) {
      toast.error("Passwords do not match");
      return;
    }

    setForgotLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", {
        email: forgotData.email,
        newPassword: forgotData.newPassword,
      });
      toast.success(res.data.message || "Password reset successfully");
      setForgotData({ email: "", newPassword: "", confirmPassword: "" });
      setShowForgotPassword(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Password reset failed");
    } finally {
      setForgotLoading(false);
    }
  };

  const inputClass = (name) => {
    const base = "input input-bordered w-full h-11 sm:h-12 text-sm";
    if (!touched[name]) return base;
    return errors[name] ? `${base} input-error` : `${base} input-success`;
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

            {!showForgotPassword ? (
              <form onSubmit={handleSubmit} onReset={handleClearForm} className="space-y-3 sm:space-y-4" noValidate>
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email address"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={loading}
                    className={inputClass("email")}
                  />
                  {touched.email && errors.email && (
                    <p className="text-error text-xs mt-1 flex items-center gap-1">
                      <span>⚠</span> {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={loading}
                    className={inputClass("password")}
                  />
                  {touched.password && errors.password && (
                    <p className="text-error text-xs mt-1 flex items-center gap-1">
                      <span>⚠</span> {errors.password}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <button
                    type="button"
                    className="text-primary text-xs sm:text-sm font-semibold hover:underline"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Forgot password?
                  </button>
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
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-3 sm:space-y-4" noValidate>
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Registered email"
                    autoComplete="email"
                    value={forgotData.email}
                    onChange={handleForgotPasswordChange}
                    className="input input-bordered w-full h-11 sm:h-12 text-sm"
                  />
                </div>

                <div>
                  <input
                    type="password"
                    name="newPassword"
                    placeholder="New password"
                    autoComplete="new-password"
                    value={forgotData.newPassword}
                    onChange={handleForgotPasswordChange}
                    className="input input-bordered w-full h-11 sm:h-12 text-sm"
                  />
                </div>

                <div>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    value={forgotData.confirmPassword}
                    onChange={handleForgotPasswordChange}
                    className="input input-bordered w-full h-11 sm:h-12 text-sm"
                  />
                  {forgotData.confirmPassword && forgotData.confirmPassword !== forgotData.newPassword && (
                    <p className="text-error text-xs mt-1">Passwords do not match</p>
                  )}
                </div>

                <div className="flex gap-2.5 sm:gap-3 pt-3 sm:pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    disabled={forgotLoading}
                    className="btn btn-secondary btn-outline flex-1 min-h-[42px] sm:min-h-[46px] text-sm"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="btn btn-primary flex-1 min-h-[42px] sm:min-h-[46px] text-sm shadow-md"
                  >
                    {forgotLoading ? "Resetting..." : "Reset Password"}
                  </button>
                </div>
              </form>
            )}

            {!showForgotPassword && (
              <p className="text-center text-xs sm:text-sm text-base-content/60 mt-4 sm:mt-6">
                No account?{" "}
                <Link to="/register" className="text-primary font-semibold hover:underline">
                  Register here
                </Link>
              </p>
            )}
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