import React from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex items-center justify-center p-3 sm:p-6 bg-gradient-to-br from-base-200 via-base-100 to-base-300">
      <div className="max-w-2xl w-full my-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="card bg-base-100/90 backdrop-blur shadow-2xl border border-base-300/60"
        >
          <div className="card-body flex flex-col items-center justify-center gap-6 sm:gap-8 text-center p-6 sm:p-12">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
            >
              <div className="text-4xl sm:text-6xl mb-2 sm:mb-3">💬</div>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-2 sm:mb-3 tracking-tight">
                Mingo Chat
              </h1>
              <p className="text-base sm:text-xl font-medium text-base-content/80">
                Connect. Chat. Communicate.
              </p>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-xs sm:text-base text-base-content/70 max-w-md leading-relaxed"
            >
              Experience seamless, instant real-time messaging with multiple themes, emojis, active typing indicators, and message replies.
            </motion.p>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="grid grid-cols-3 gap-2 sm:gap-4 w-full py-2"
            >
              <div className="flex flex-col items-center gap-1.5 p-2.5 sm:p-3 rounded-2xl bg-base-200/60 border border-base-300/40">
                <div className="text-2xl sm:text-3xl">⚡</div>
                <p className="text-[11px] sm:text-sm font-semibold">Real-Time</p>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-2.5 sm:p-3 rounded-2xl bg-base-200/60 border border-base-300/40">
                <div className="text-2xl sm:text-3xl">🔒</div>
                <p className="text-[11px] sm:text-sm font-semibold">Secure</p>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-2.5 sm:p-3 rounded-2xl bg-base-200/60 border border-base-300/40">
                <div className="text-2xl sm:text-3xl">🎨</div>
                <p className="text-[11px] sm:text-sm font-semibold">Themed</p>
              </div>
            </motion.div>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-3 w-full"
            >
              <button
                onClick={() => navigate("/login")}
                className="btn btn-primary flex-1 shadow-md hover:shadow-lg transition-shadow text-sm sm:text-base min-h-[44px]"
              >
                Login to Chat
              </button>
              <button
                onClick={() => navigate("/contact")}
                className="btn btn-outline flex-1 text-sm sm:text-base min-h-[44px]"
              >
                Contact Us
              </button>
            </motion.div>

            {/* Footer Text */}
            <p className="text-xs sm:text-sm text-base-content/60">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/register")}
                className="link link-primary font-semibold hover:underline"
              >
                Sign up
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;