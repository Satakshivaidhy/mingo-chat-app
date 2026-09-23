import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../config/api";
import { useNavigate } from "react-router-dom";

const UserDashboard = () => {
  const { user, isLogin, setUser, setIsLogin } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        mobileNumber: user.mobileNumber || "",
      });
    }
  }, [user]);

  if (!isLogin) {
    return (
      <div className="container mx-auto mt-10 px-4">
        <h1 className="text-3xl font-bold mb-4 text-error">Unauthorized</h1>
        <p className="text-lg">Please log in to access the dashboard.</p>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      fullName: user.fullName || "",
      email: user.email || "",
      mobileNumber: user.mobileNumber || "",
    });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.put("/user/profile", {
        fullName: formData.fullName,
        email: formData.email,
        mobileNumber: formData.mobileNumber,
      });

      if (response.data.data) {
        const updatedUser = { ...user, ...response.data.data };
        setUser(updatedUser);
        sessionStorage.setItem("AppUser", JSON.stringify(updatedUser));
        setSuccess(response.data.message || "Profile updated successfully!");
        setIsEditing(false);
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      sessionStorage.removeItem("AppUser");
      setIsLogin(false);
      navigate("/login");
    }
  };

  return (
    <div className="flex-1 container mx-auto py-6 sm:py-10 max-w-2xl px-3 sm:px-6">
      <h1 className="text-2xl sm:text-4xl font-extrabold mb-6 sm:mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
        User Dashboard
      </h1>

      {error && (
        <div className="alert alert-error mb-4 sm:mb-6 text-xs sm:text-sm shadow-md">
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success mb-4 sm:mb-6 text-xs sm:text-sm shadow-md">
          <span>{success}</span>
        </div>
      )}

      {!isEditing ? (
        <div className="card bg-base-100 shadow-xl border border-base-300/60 p-4 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 pb-4 border-b border-base-200">
            <div className="flex items-center gap-3">
              <div className="avatar placeholder">
                <div className="bg-primary text-primary-content rounded-full w-12 h-12 text-lg font-bold ring-2 ring-primary/20">
                  <span>{user?.fullName?.charAt(0).toUpperCase() || "U"}</span>
                </div>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold leading-tight">{user?.fullName || "User"}</h2>
                <p className="text-xs text-base-content/60">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={() => navigate("/chat")}
              className="btn btn-primary btn-sm gap-1.5 w-full sm:w-auto shadow-sm"
            >
              <span>💬</span> Go to Chats
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="bg-base-200/70 p-3.5 sm:p-4 rounded-xl border border-base-300/40">
              <label className="text-[11px] sm:text-xs font-semibold uppercase text-base-content/60">Full Name</label>
              <p className="text-sm sm:text-base font-medium mt-1 truncate">{user?.fullName || "Not provided"}</p>
            </div>

            <div className="bg-base-200/70 p-3.5 sm:p-4 rounded-xl border border-base-300/40">
              <label className="text-[11px] sm:text-xs font-semibold uppercase text-base-content/60">Email</label>
              <p className="text-sm sm:text-base font-medium mt-1 truncate">{user?.email || "Not provided"}</p>
            </div>

            <div className="bg-base-200/70 p-3.5 sm:p-4 rounded-xl border border-base-300/40">
              <label className="text-[11px] sm:text-xs font-semibold uppercase text-base-content/60">Mobile Number</label>
              <p className="text-sm sm:text-base font-medium mt-1">{user?.mobileNumber || "Not provided"}</p>
            </div>

            {user?.createdAt && (
              <div className="bg-base-200/70 p-3.5 sm:p-4 rounded-xl border border-base-300/40">
                <label className="text-[11px] sm:text-xs font-semibold uppercase text-base-content/60">Joined On</label>
                <p className="text-sm sm:text-base font-medium mt-1">
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2.5 sm:gap-3">
            <button
              onClick={() => navigate("/chat")}
              className="btn btn-primary w-full min-h-[44px] text-sm sm:text-base shadow-md"
            >
              💬 Open Chats
            </button>
            <button
              onClick={handleEdit}
              className="btn btn-outline w-full min-h-[44px] text-sm sm:text-base"
            >
              ✏️ Edit Profile
            </button>
            <button
              onClick={handleLogout}
              className="btn btn-error btn-outline w-full min-h-[44px] text-sm sm:text-base"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      ) : (
        <div className="card bg-base-100 shadow-xl border border-base-300/60 p-4 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Edit Profile</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold mb-1">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="input input-bordered w-full h-11 sm:h-12 text-sm"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="input input-bordered w-full h-11 sm:h-12 text-sm"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold mb-1">Mobile Number</label>
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleInputChange}
                className="input input-bordered w-full h-11 sm:h-12 text-sm"
                placeholder="Enter your mobile number"
              />
            </div>

            <div className="flex gap-2.5 sm:gap-4 pt-3 sm:pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-success flex-1 min-h-[44px] text-sm font-semibold shadow-md"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="btn btn-ghost flex-1 min-h-[44px] text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;