import React, { useEffect, useState } from "react";


import Chatting from "../components/chat/Chatting";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../config/api";
import socketAPI from "../config/webSocket";

const Chat = () => {
  const navigate = useNavigate();
  const { user, isLogin } = useAuth();
  const [recentUser, setRecentUser] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [isOpenChat, setIsOpenChat] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  const fetchRecentUsers = async () => {
    try {
      const res = await api.get("/user/allusers");
      setRecentUser(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch recent users", error);
      if (error?.response?.status === 401) {
        sessionStorage.removeItem("AppUser");
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    if (!isLogin) {
      navigate("/login");
      return;
    }

    const handlePopState = (event) => {
      event.preventDefault();

      if (selectedFriend || isOpenChat) {
        setSelectedFriend(null);
        setIsOpenChat(false);
        window.history.pushState(null, "", "/chat");
        return;
      }

      window.history.pushState(null, "", "/chat");
    };

    window.history.pushState(null, "", "/chat");
    window.addEventListener("popstate", handlePopState);

    if (user) {
      socketAPI.emit("user:online", user._id);
      fetchRecentUsers();

      const handleGlobalTypingStart = ({ senderId }) => {
        if (senderId) {
          setTypingUsers((prev) => ({ ...prev, [senderId]: true }));
        }
      };

      const handleGlobalTypingStop = ({ senderId }) => {
        if (senderId) {
          setTypingUsers((prev) => {
            const next = { ...prev };
            delete next[senderId];
            return next;
          });
        }
      };

      const handleGlobalReceive = (msg) => {
        if (msg?.senderId) {
          setTypingUsers((prev) => {
            const next = { ...prev };
            delete next[msg.senderId];
            return next;
          });
        }
      };

      socketAPI.on("typing:start", handleGlobalTypingStart);
      socketAPI.on("typing:stop", handleGlobalTypingStop);
      socketAPI.on("receive", handleGlobalReceive);

      return () => {
        socketAPI.emit("user:disconnect", user._id);
        socketAPI.off("typing:start", handleGlobalTypingStart);
        socketAPI.off("typing:stop", handleGlobalTypingStop);
        socketAPI.off("receive", handleGlobalReceive);
        window.removeEventListener("popstate", handlePopState);
      };
    }

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isLogin, user, selectedFriend, isOpenChat, navigate]);

  const filteredUsers = recentUser.filter((friend) =>
    friend.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBackToList = () => {
    setSelectedFriend(null);
    setIsOpenChat(false);
    window.history.pushState(null, "", "/chat");
  };

  return (
    <>
      {isLogin && (
        <div className="chat-container-height flex w-full overflow-hidden bg-base-300 relative">
          {/* Sidebar - Full width on mobile when no friend is selected, hidden on mobile when friend selected; always visible on desktop */}
          <div
            className={`w-full md:w-80 lg:w-96 shrink-0 h-full bg-base-100 flex-col border-r border-base-300 shadow-sm z-10 ${
              selectedFriend ? "hidden md:flex" : "flex"
            }`}
          >
            {/* Sidebar Header */}
            <div className="h-14 sm:h-16 bg-base-200/90 backdrop-blur px-4 flex items-center justify-between shrink-0 border-b border-base-300">
              <div
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => navigate("/dashboard")}
                title="View Profile"
              >
                <div className="avatar placeholder">
                  <div className="bg-primary text-primary-content rounded-full w-9 h-9 sm:w-10 sm:h-10 text-sm font-bold ring-2 ring-primary/20">
                    <span>{user?.fullName?.charAt(0).toUpperCase() || "U"}</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold leading-tight text-base-content group-hover:text-primary transition-colors">
                    {user?.fullName || "My Profile"}
                  </span>
                  <span className="text-[11px] text-success font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-success"></span> Online
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-base-content/70">
                <button
                  onClick={fetchRecentUsers}
                  className="btn btn-ghost btn-circle btn-xs text-base-content/70 hover:text-base-content"
                  title="Refresh users"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="p-2.5 border-b border-base-300 bg-base-100">
              <div className="bg-base-200 rounded-xl flex items-center px-3 py-1.5 h-9 transition-colors focus-within:ring-1 focus-within:ring-primary">
                <svg viewBox="0 0 24 24" width="16" height="16" className="text-base-content/50 mr-2 shrink-0" fill="currentColor">
                  <path d="M15.009 13.805h-.636l-.22-.219a5.184 5.184 0 001.256-3.386 5.207 5.207 0 10-5.207 5.208 5.183 5.183 0 003.385-1.255l.221.22v.635l4.004 3.999 1.194-1.195-3.997-4.007zm-4.808 0a3.605 3.605 0 110-7.21 3.605 3.605 0 010 7.21z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent outline-none text-xs sm:text-sm w-full text-base-content placeholder-base-content/50"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-xs text-base-content/50 hover:text-base-content"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Chats / Contacts List */}
            <div className="flex-1 overflow-y-auto bg-base-100 custom-scrollbar divide-y divide-base-200/60">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((friend) => (
                  <div
                    key={friend._id}
                    onClick={() => {
                      setSelectedFriend(friend);
                      setIsOpenChat(true);
                    }}
                    className={`flex items-center px-3.5 py-3 cursor-pointer transition-colors active:scale-[0.99] select-none ${
                      selectedFriend?._id === friend._id
                        ? "bg-primary/10 border-l-4 border-primary"
                        : "hover:bg-base-200/60"
                    }`}
                  >
                    <div className="avatar placeholder mr-3 shrink-0">
                      <div className="w-11 h-11 rounded-full bg-base-300 text-base-content font-semibold flex items-center justify-center">
                        <span className="text-base">{friend.fullName?.charAt(0).toUpperCase()}</span>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="text-sm font-semibold text-base-content truncate">
                          {friend.fullName}
                        </span>
                        <span className="text-[11px] text-base-content/50 shrink-0 ml-1">
                          {friend.mobileNumber ? `📱` : ""}
                        </span>
                      </div>
                      <div className="text-xs text-base-content/60 truncate">
                        {typingUsers[friend._id] ? (
                          <span className="text-primary font-medium italic flex items-center gap-1">
                            <span className="animate-pulse">typing</span>
                            <span className="inline-flex gap-0.5 items-center">
                              <span className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></span>
                              <span className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></span>
                              <span className="w-1 h-1 rounded-full bg-primary animate-bounce"></span>
                            </span>
                          </span>
                        ) : (
                          friend.email || "Tap to chat"
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-base-content/50 text-sm">
                  {searchQuery ? "No contacts match your search" : "No users found"}
                </div>
              )}
            </div>
          </div>

          {/* Main Chat Area - Full width on mobile when a friend is selected, hidden on mobile when no friend is selected; takes remaining space on desktop */}
          <div
            className={`w-full md:flex-1 h-full bg-base-300 relative overflow-hidden flex-col min-w-0 ${
              selectedFriend ? "flex" : "hidden md:flex"
            }`}
          >
            {selectedFriend ? (
              <Chatting
                selectedFriend={selectedFriend}
                currentUser={user}
                onBack={handleBackToList}
              />
            ) : (
              <div className="flex-1 h-full flex flex-col items-center justify-center p-6 text-center text-base-content bg-base-200/50">
                <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center text-4xl mb-4 animate-pulse">
                  💬
                </div>
                <h2 className="text-2xl font-bold mb-2">Mingo Real-Time Chat</h2>
                <p className="max-w-md text-sm text-base-content/60 leading-relaxed">
                  Select a contact from the sidebar to start a secure, real-time conversation with themes, emojis, and instant replies.
                </p>
                <div className="badge badge-primary badge-outline mt-6 text-xs py-2 px-3">
                  ✨ End-to-End Real-Time Socket Connection
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Chat;