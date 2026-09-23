import React, { useState } from "react";
import toast from "react-hot-toast";
import api from "../config/api";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
  const [validationError, setValidationError] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClearForm = () => {
    setFormData({
      fullName: "",
      email: "",
      mobileNumber: "",
      password: "",
      confirmPassword: "",
    });
    setValidationError({});
  };

  const validate = () => {
    let Error = {};

    if (formData.fullName.length < 3) {
      Error.fullName = "Name should be more than 3 characters";
    } else if (!/^[A-Za-z ]+$/.test(formData.fullName)) {
      Error.fullName = "Only alphabets and spaces allowed";
    }

    if (
      !/^[\w.]+@(gmail|outlook|yahoo|ricr)\.(com|in|co\.in)$/.test(
        formData.email
      )
    ) {
      Error.email = "Use proper email format";
    }

    if (!/^[6-9]\d{9}$/.test(formData.mobileNumber)) {
      Error.mobileNumber = "Only Indian mobile numbers allowed";
    }

    if (formData.password !== formData.confirmPassword) {
      Error.confirmPassword = "Passwords do not match";
    }

    setValidationError(Error);
    return Object.keys(Error).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validate()) {
      setIsLoading(false);
      toast.error("Fill the form correctly");
      return;
    }

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

            <form onSubmit={handleSubmit} onReset={handleClearForm} className="space-y-3 sm:space-y-4">
              <div>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  autoComplete="name"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="input input-bordered w-full h-11 sm:h-12 text-sm"
                />
                {validationError.fullName && (
                  <p className="text-error text-xs mt-1">{validationError.fullName}</p>
                )}
              </div>

              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="input input-bordered w-full h-11 sm:h-12 text-sm"
                />
                {validationError.email && (
                  <p className="text-error text-xs mt-1">{validationError.email}</p>
                )}
              </div>

              <div>
                <input
                  type="tel"
                  name="mobileNumber"
                  placeholder="Mobile Number (10 digits)"
                  autoComplete="tel"
                  maxLength="10"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="input input-bordered w-full h-11 sm:h-12 text-sm"
                />
                {validationError.mobileNumber && (
                  <p className="text-error text-xs mt-1">{validationError.mobileNumber}</p>
                )}
              </div>

              <div>
                <input
                  type="password"
                  name="password"
                  placeholder="Create Password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="input input-bordered w-full h-11 sm:h-12 text-sm"
                />
              </div>

              <div>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="input input-bordered w-full h-11 sm:h-12 text-sm"
                />
                {validationError.confirmPassword && (
                  <p className="text-error text-xs mt-1">{validationError.confirmPassword}</p>
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