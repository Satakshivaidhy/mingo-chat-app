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

  // console.log(user);
  //const currentUser = 1;
  console.log(recentUser);

  useEffect(() => {
    if (!isLogin) {
      navigate("/login");
    }

    if (isLogin && user) {
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
      };
    }
  }, [isLogin, user]);

  return (
    <>
      {isLogin && (
        <div className="flex gap-2 h-screen bg-base-300 overflow-hidden ">
          <div className="w-3/17 bg-base-100 flex flex-col border-r border-base-300 min-w-[300px] shadow-sm z-10">
            {/* WhatsApp Sidebar Header */}
            <div className="h-16 bg-base-200 flex items-center justify-between px-4 shrink-0">
              <div className="avatar placeholder cursor-pointer">
                <div className="bg-neutral text-neutral-content rounded-full w-10 h-10">
                  <span className="text-lg flex justify-center items-center">{user?.fullName?.charAt(0).toUpperCase()}</span>
                </div>
              </div>
              <div className="flex gap-5 text-base-content/70">
                <svg viewBox="0 0 24 24" width="24" height="24" className="cursor-pointer hover:text-base-content transition-colors" fill="currentColor"><path d="M12.072 1.761a10.05 10.05 0 00-9.303 5.65.977.977 0 001.756.855 8.098 8.098 0 017.496-4.553.977.977 0 10.051-1.952zM1.926 13.64a10.052 10.052 0 007.461 7.925.977.977 0 00.471-1.895 8.097 8.097 0 01-6.012-6.386.977.977 0 00-1.92.356zm13.729 7.454a10.053 10.053 0 008.028-5.918.977.977 0 00-1.782-.803 8.097 8.097 0 01-6.469 4.77.977.977 0 00.223 1.948h.001zm6.059-15.11a10.05 10.05 0 00-6.195-3.871.977.977 0 00-.332 1.925 8.097 8.097 0 014.992 3.12.977.977 0 101.535-1.174z"></path></svg>
                <svg viewBox="0 0 24 24" width="24" height="24" className="cursor-pointer hover:text-base-content transition-colors" fill="currentColor"><path d="M19.005 3.175H4.674C3.642 3.175 3 3.789 3 4.821V21.02l3.544-3.514h12.461c1.033 0 2.064-1.06 2.064-2.093V4.821c-.001-1.032-1.032-1.646-2.064-1.646zm-4.989 9.869H7.041V11.1h6.975v1.944zm3-4H7.041V7.1h9.975v1.944z"></path></svg>
                <svg viewBox="0 0 24 24" width="24" height="24" className="cursor-pointer hover:text-base-content transition-colors" fill="currentColor"><path d="M12 7a2 2 0 1 0-.001-4.001A2 2 0 0 0 12 7zm0 2a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 9zm0 6a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 15z"></path></svg>
              </div>
            </div>

            {/* Search Bar */}
            <div className="p-2 border-b border-base-300 bg-base-100">
              <div className="bg-base-200 rounded-lg flex items-center px-3 py-1.5 h-9">
                <svg viewBox="0 0 24 24" width="20" height="20" className="text-base-content/60 mr-3" fill="currentColor"><path d="M15.009 13.805h-.636l-.22-.219a5.184 5.184 0 001.256-3.386 5.207 5.207 0 10-5.207 5.208 5.183 5.183 0 003.385-1.255l.221.22v.635l4.004 3.999 1.194-1.195-3.997-4.007zm-4.808 0a3.605 3.605 0 110-7.21 3.605 3.605 0 010 7.21z"></path></svg>
                <input type="text" placeholder="Search or start new chat" className="bg-transparent outline-none text-sm w-full text-base-content placeholder-base-content/60" />
              </div>
            </div>

            {/* Chats List */}
            <div className="flex-1 overflow-y-auto bg-base-100 custom-scrollbar">
              {recentUser.length > 0 ? (
                recentUser.map((friend, idx) => (
                  <div
                    key={idx}
                    onClick={() => { setSelectedFriend(friend); setIsOpenChat(true); }}
                    className={`flex items-center px-3 cursor-pointer transition-colors ${selectedFriend?._id === friend._id ? 'bg-base-200' : 'hover:bg-base-200/50'
                      }`}
                  >
                    <div className="avatar placeholder mr-3 py-2">
                      <div className="w-12 h-12 rounded-full bg-base-300 text-base-content/80">
                        <span className="text-xl font-normal flex justify-center content-center">{friend.fullName.charAt(0).toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-center border-b border-base-300/50 h-[72px] pr-2">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="text-[17px] text-base-content">{friend.fullName}</span>
                        <span className="text-xs text-base-content/60">Yesterday</span>
                      </div>
                      <div className="text-sm text-base-content/60 truncate">
                        {typingUsers[friend._id] ? (
                          <span className="text-primary font-medium italic flex items-center gap-1 text-xs">
                            <span className="animate-pulse font-semibold">typing</span>
                            <span className="inline-flex gap-0.5 items-center">
                              <span className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></span>
                              <span className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></span>
                              <span className="w-1 h-1 rounded-full bg-primary animate-bounce"></span>
                            </span>
                          </span>
                        ) : (
                          "Tap to open chat"
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-base-content/60 text-sm">No recent chats</div>
              )}
            </div>
          </div>
          <div className="w-14/17 bg-base-300 relative overflow-hidden">
            {selectedFriend ? (
              <Chatting
                selectedFriend={selectedFriend}
                currentUser={user}
              />
            ) : (
              <div className="flex-1 h-full flex flex-col items-center justify-center text-center text-base-content bg-base-200">
                <h1 className="text-3xl font-light mt-8">FlyonUI Styled WhatsApp</h1>
                <p className="mt-4 text-sm text-base-content/60">Send and receive messages dynamically matching your theme.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Chat;