import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../config/api";
import socketAPI from "../../config/webSocket";
import EmojiPicker from "./EmojiPicker";
import { IoSend } from "react-icons/io5";
import { BsEmojiSmile, BsEmojiSmileFill } from "react-icons/bs";

const Chatting = ({ selectedFriend, currentUser }) => {
  const { user } = useAuth();
  const [filteredChatData, setFilteredChatData] = useState([]);
  const [receiver, setReceiver] = useState("");
  const [sender, setSender] = useState("");
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [filteredChatData]);

  const fetchChatData = async () => {
    try {
      const res = await api.get(`/user/get-messages/${selectedFriend._id}`);
      setFilteredChatData(res.data.data);
    } catch (error) {
      console.error("Failed to fetch chat data", error);
    }
  };

  const handleMessageSendSocket = async () => {
    if (!message || !message.trim()) return;

    const payload = {
      senderId: user._id,
      receiverId: receiver?._id,
      message: message.trim(),
    };

    const timeStamp = new Date().toISOString();

    try {
      if (socketAPI.connected) {
        socketAPI.emit("send", payload);

        setFilteredChatData((prev) => [
          ...prev,
          {
            senderId: user._id,
            receiverId: receiver?._id,
            message: message.trim(),
            updatedAt: timeStamp,
            createdAt: timeStamp,
          },
        ]);
        setMessage("");
        setShowEmojiPicker(false);
      }
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  const handleReceiveMessage = (newMessagePack) => {
    setFilteredChatData((prev) => [...prev, newMessagePack]);
  };

  useEffect(() => {
    fetchChatData();
    setSender(user);
    setReceiver(selectedFriend);

    if (selectedFriend) {
      socketAPI.on("receive", handleReceiveMessage);
    }

    return () => {
      socketAPI.off("receive", handleReceiveMessage);
    };
  }, [selectedFriend]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleMessageSendSocket();
    }
  };

  const handleSelectEmoji = (emojiChar) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart ?? message.length;
      const end = textareaRef.current.selectionEnd ?? message.length;
      const updatedMessage =
        message.substring(0, start) + emojiChar + message.substring(end);
      setMessage(updatedMessage);

      // Restore cursor position right after the newly inserted emoji
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const nextCursor = start + emojiChar.length;
          textareaRef.current.setSelectionRange(nextCursor, nextCursor);
        }
      }, 0);
    } else {
      setMessage((prev) => prev + emojiChar);
    }
  };

  return (
    <div className="flex flex-col h-full bg-base-300">
      {/* Chat Top Header */}
      <div className="bg-base-200 px-4 py-3 border-b border-base-300 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="avatar placeholder">
            <div className="w-10 h-10 rounded-full bg-primary/20 text-primary font-semibold flex items-center justify-center">
              <span>{receiver?.fullName?.charAt(0).toUpperCase() || "U"}</span>
            </div>
          </div>
          <div>
            <h3 className="font-medium text-base text-base-content leading-tight">
              {receiver?.fullName || "No friend selected"}
            </h3>
            <span className="text-xs text-base-content/60">Online</span>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-3 flex flex-col gap-3 justify-between overflow-hidden">
        <div className="h-[70vh] w-full card p-3 overflow-y-auto bg-accent/20 custom-scrollbar">
          {filteredChatData.map((chat, idx) => (
            <div
              key={chat._id || idx}
              className={`chat ${chat.senderId !== sender._id ? "chat-receiver" : "chat-sender"}`}
            >
              <div className="chat-avatar avatar"></div>
              <div className="chat-header text-base-content">
                {chat.senderId !== sender._id
                  ? receiver.fullName
                  : sender.fullName}
                <time className="text-base-content/50 ml-2">
                  {chat.createdAt
                    ? new Date(chat.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : chat.timestamp}
                </time>
              </div>
              <div className="chat-bubble break-words">{chat.message}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar with Emoji Trigger & Popover */}
        <div className="relative">
          {showEmojiPicker && (
            <EmojiPicker
              onSelectEmoji={handleSelectEmoji}
              onClose={() => setShowEmojiPicker(false)}
            />
          )}

          <div className="h-full px-3 py-2 input flex items-center gap-2 bg-base-100 border border-base-300 rounded-2xl shadow-sm">
            <button
              type="button"
              data-emoji-trigger="true"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className={`btn btn-ghost btn-circle btn-sm text-xl transition-all ${
                showEmojiPicker
                  ? "text-primary scale-110 bg-base-200"
                  : "text-base-content/70 hover:text-base-content hover:scale-105"
              }`}
              title="Add Emoji"
            >
              {showEmojiPicker ? (
                <BsEmojiSmileFill className="size-5 text-primary" />
              ) : (
                <BsEmojiSmile className="size-5" />
              )}
            </button>

            <textarea
              ref={textareaRef}
              type="text"
              className="w-full outline-0 resize-none bg-transparent text-base-content placeholder-base-content/50 py-1 max-h-32 min-h-[32px] leading-relaxed"
              placeholder="Type a message..."
              rows="1"
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              value={message}
            ></textarea>

            <button
              type="button"
              onClick={handleMessageSendSocket}
              disabled={!message.trim()}
              className="btn btn-primary btn-sm btn-circle shrink-0 disabled:opacity-40 transition-transform active:scale-95"
              title="Send message"
            >
              <IoSend className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatting;