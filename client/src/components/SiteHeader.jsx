import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SiteHeader = () => {
  const { user, isLogin } = useAuth();
  const navigate = useNavigate();
  const [selectedTheme, setSelectedTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("mingoTheme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    setSelectedTheme(savedTheme);
  }, []);

  const handleThemeChange = (e) => {
    const theme = e.target.value;
    setSelectedTheme(theme);
    localStorage.setItem("mingoTheme",theme);
    document.documentElement.setAttribute("data-theme", theme);
  };

  return (
    <header className="bg-primary text-primary-content h-14 sm:h-15 px-3 sm:px-6 flex items-center justify-between shrink-0 shadow-md z-30 transition-colors">
      <div
        className="flex items-center gap-2 cursor-pointer select-none group"
        onClick={() => navigate("/")}
      >
        <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform">💬</span>
        <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-primary-content whitespace-nowrap">
          Mingo<span className="hidden xs:inline sm:inline font-light opacity-90"> Chat</span>
        </h1>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3">
        {isLogin ? (
          <>
            <button
              className="btn btn-sm btn-ghost text-primary-content hover:bg-primary-focus/40 flex items-center gap-1.5 font-semibold px-2 sm:px-3 text-xs sm:text-sm"
              onClick={() => navigate("/chat")}
              title="Open Chats"
            >
              <span>💬</span>
              <span className="hidden sm:inline">Chats</span>
            </button>
            <div
              className="flex items-center gap-1.5 cursor-pointer py-1 px-2 sm:px-3 border border-primary-content/60 rounded-lg transition hover:bg-primary-focus/40 text-xs sm:text-sm"
              onClick={() => navigate("/dashboard")}
              title="View Profile Dashboard"
            >
              <span className="text-primary-content font-medium truncate max-w-[90px] sm:max-w-[140px]">
                👤 {user?.fullName?.split(" ")[0] || user?.email?.split("@")[0]}
              </span>
            </div>
          </>
        ) : (
          <>
            <button
              className="btn btn-xs sm:btn-sm btn-outline btn-primary-content text-primary-content border-primary-content/80 hover:bg-primary-focus/30 font-medium px-2 sm:px-3"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
            <button
              className="btn btn-xs sm:btn-sm btn-primary-content text-primary bg-primary-content hover:bg-primary-content/90 font-medium px-2 sm:px-3 hidden xs:inline-flex"
              onClick={() => navigate("/register")}
            >
              Register
            </button>
          </>
        )}

        {/* Theme Selector */}
        <div className="relative flex items-center">
          <select
            name="theme"
            id="theme"
            aria-label="Select theme"
            className="select select-sm select-bordered bg-primary-content/10 text-primary-content border-primary-content/40 hover:border-primary-content text-xs font-medium cursor-pointer rounded-lg py-0 pl-2 pr-6 h-8 min-h-8 focus:bg-primary-focus focus:text-primary-content"
            value={selectedTheme}
            onChange={handleThemeChange}
          >
            <option value="light" className="text-base-content bg-base-100">☀️ Light</option>
            <option value="dark" className="text-base-content bg-base-100">🌙 Dark</option>
            <option value="black" className="text-base-content bg-base-100">🖤 Black</option>
            <option value="spotify" className="text-base-content bg-base-100">🟢 Spotify</option>
            <option value="claude" className="text-base-content bg-base-100">🟤 Claude</option>
            <option value="corporate" className="text-base-content bg-base-100">🏢 Corporate</option>
            <option value="ghibli" className="text-base-content bg-base-100">🍃 Ghibli</option>
            <option value="halloween" className="text-base-content bg-base-100">🎃 Halloween</option>
          </select>
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;