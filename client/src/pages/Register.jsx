import React, { useState } from "react";
import toast from "react-hot-toast";
import api from "../config/api";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ─── Regex Patterns ───────────────────────────────────────────────────────────
const REGEX = {
  fullName: /^[A-Za-z ]{3,}$/,
  email: /^[\w.]+@(gmail|outlook|yahoo|ricr)\.(com|in|co\.in)$/,
  mobileNumber: /^[6-9]\d{9}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
};

const MESSAGES = {
  fullName: "Min 3 characters, only alphabets and spaces allowed",
  email: "Enter a valid email (e.g. user@gmail.com)",
  mobileNumber: "Enter a valid 10-digit Indian mobile number (starts with 6-9)",
  password: "Min 8 chars with uppercase, lowercase, number & special character",
  confirmPassword: "Passwords do not match",
};

const Register = () => {
  const navigate = useNavigate();
  const { setUser, setIsLogin } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // ─── Validate a single field ───────────────────────────────────────────────
  const validateField = (name, value, currentFormData = formData) => {
    if (!value.trim()) return "This field is required";

    if (name === "confirmPassword") {
      return value !== currentFormData.password ? MESSAGES.confirmPassword : "";
    }

    if (REGEX[name] && !REGEX[name].test(value)) return MESSAGES[name];
    return "";
  };

  // ─── Validate all fields, returns true if valid ────────────────────────────
  const validateAll = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const msg = validateField(key, formData[key], formData);
      if (msg) newErrors[key] = msg;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);

    // Real-time validation after field is touched
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value, updated) }));
    }
    // Also re-validate confirmPassword live when password changes
    if (name === "password" && touched.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateField("confirmPassword", updated.confirmPassword, updated),
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleClearForm = () => {
    setFormData({
      fullName: "",
      email: "",
      mobileNumber: "",
      password: "",
      confirmPassword: "",
    });
    setErrors({});
    setTouched({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Mark all fields as touched so errors become visible
    setTouched({
      fullName: true,
      email: true,
      mobileNumber: true,
      password: true,
      confirmPassword: true,
    });

    if (!validateAll()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post("/auth/register", formData);
      toast.success(res.data.message);
      if (res.data.data) {
        sessionStorage.setItem("AppUser", JSON.stringify(res.data.data));
        setUser(res.data.data);
        setIsLogin(true);
      }
      handleClearForm();
      navigate("/chat");
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper: border class based on validation state
  const inputClass = (name) => {
    const base = "input input-bordered w-full h-11 sm:h-12 text-sm";
    if (!touched[name]) return base;
    return errors[name] ? `${base} input-error` : `${base} input-success`;
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-base-200/60 p-3 sm:p-6 py-6 sm:py-10">
      <div className="w-full max-w-lg my-auto">
        <div className="card bg-base-100 shadow-xl border border-base-300/60">
          <div className="card-body p-5 sm:p-8">
            <h2 className="card-title text-2xl sm:text-3xl justify-center text-primary font-bold">
              Register
            </h2>
            <p className="text-center text-xs sm:text-sm text-base-content/70 mb-4 sm:mb-6">
              Create your Mingo Chat account 🫡
            </p>

            <form onSubmit={handleSubmit} onReset={handleClearForm} className="space-y-3 sm:space-y-4" noValidate>
              {/* Full Name */}
              <div>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  autoComplete="name"
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isLoading}
                  className={inputClass("fullName")}
                />
                {touched.fullName && errors.fullName && (
                  <p className="text-error text-xs mt-1 flex items-center gap-1">
                    <span>⚠</span> {errors.fullName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isLoading}
                  className={inputClass("email")}
                />
                {touched.email && errors.email && (
                  <p className="text-error text-xs mt-1 flex items-center gap-1">
                    <span>⚠</span> {errors.email}
                  </p>
                )}
              </div>

              {/* Mobile Number */}
              <div>
                <input
                  type="tel"
                  name="mobileNumber"
                  placeholder="Mobile Number (10 digits)"
                  autoComplete="tel"
                  maxLength="10"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isLoading}
                  className={inputClass("mobileNumber")}
                />
                {touched.mobileNumber && errors.mobileNumber && (
                  <p className="text-error text-xs mt-1 flex items-center gap-1">
                    <span>⚠</span> {errors.mobileNumber}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <input
                  type="password"
                  name="password"
                  placeholder="Create Password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isLoading}
                  className={inputClass("password")}
                />
                {touched.password && errors.password && (
                  <p className="text-error text-xs mt-1 flex items-center gap-1">
                    <span>⚠</span> {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isLoading}
                  className={inputClass("confirmPassword")}
                />
                {touched.confirmPassword && errors.confirmPassword && (
                  <p className="text-error text-xs mt-1 flex items-center gap-1">
                    <span>⚠</span> {errors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="flex gap-2.5 sm:gap-3 pt-3 sm:pt-4">
                <button
                  type="reset"
                  disabled={isLoading}
                  className="btn btn-secondary btn-outline flex-1 min-h-[42px] sm:min-h-[46px] text-sm"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary flex-1 min-h-[42px] sm:min-h-[46px] text-sm shadow-md"
                >
                  {isLoading ? "Submitting..." : "Register"}
                </button>
              </div>
            </form>

            <p className="text-center text-xs sm:text-sm text-base-content/60 mt-4 sm:mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-base-content/50 mt-4">
          We respect your privacy 🔒
        </p>
      </div>
    </div>
  );
};

export default Register;