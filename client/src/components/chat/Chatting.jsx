import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../config/api";
import socketAPI from "../../config/webSocket";
import EmojiPicker from "./EmojiPicker";
import { IoSend } from "react-icons/io5";
import { BsEmojiSmile, BsEmojiSmileFill } from "react-icons/bs";
import {
  formatMessageTime,
  formatMessageDayAndDate,
  formatFullDateTime,
  getDateDividerLabel,
} from "../../utils/dateUtils";

const Chatting = ({ selectedFriend, currentUser }) => {
  const { user } = useAuth();
  const [filteredChatData, setFilteredChatData] = useState([]);
  const [receiver, setReceiver] = useState("");
  const [sender, setSender] = useState("");
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isReceiverTyping, setIsReceiverTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isSelfTypingRef = useRef(false);
  // Message currently being replied to
  const [replyingTo, setReplyingTo] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [filteredChatData, isReceiverTyping]);

  const fetchChatData = async () => {
    try {
      const res = await api.get(`/user/get-messages/${selectedFriend._id}`);
      setFilteredChatData(res.data.data);
    } catch (error) {
      console.error("Failed to fetch chat data", error);
    }
  };

  const stopTypingEmitter = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    if (isSelfTypingRef.current && receiver?._id && socketAPI.connected) {
      socketAPI.emit("typing:stop", {
        senderId: user._id,
        receiverId: receiver._id,
      });
      isSelfTypingRef.current = false;
    }
  };

  const handleTypingChange = (newVal) => {
    setMessage(newVal);

    if (!receiver?._id || !socketAPI.connected) return;

    if (newVal.trim().length > 0) {
      if (!isSelfTypingRef.current) {
        isSelfTypingRef.current = true;
        socketAPI.emit("typing:start", {
          senderId: user._id,
          receiverId: receiver._id,
        });
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        if (isSelfTypingRef.current && socketAPI.connected && receiver?._id) {
          socketAPI.emit("typing:stop", {
            senderId: user._id,
            receiverId: receiver._id,
          });
          isSelfTypingRef.current = false;
        }
      }, 2000);
    } else {
      stopTypingEmitter();
    }
  };

  const handleMessageSendSocket = async () => {
    if (!message || !message.trim()) return;

    stopTypingEmitter();

    const payload = {
      senderId: user._id,
      receiverId: receiver?._id,
      message: message.trim(),
      replyTo: replyingTo?._id || null,
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
            replyTo: replyingTo || null,
            updatedAt: timeStamp,
            createdAt: timeStamp,
          },
        ]);
        setMessage("");
        setReplyingTo(null);
        setShowEmojiPicker(false);
      }
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  const handleReceiveMessage = (newMessagePack) => {
    if (
      newMessagePack.senderId === selectedFriend?._id ||
      newMessagePack.receiverId === selectedFriend?._id
    ) {
      setIsReceiverTyping(false);
      const msg = {
        ...newMessagePack,
        createdAt: newMessagePack.createdAt || new Date().toISOString(),
      };
      setFilteredChatData((prev) => [...prev, msg]);
    }
  };

  const handleReply = (chat) => {
    setReplyingTo(chat);

    // Automatically focus the message input
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  useEffect(() => {
    fetchChatData();
    setSender(user);
    setReceiver(selectedFriend);
    setIsReceiverTyping(false);
    isSelfTypingRef.current = false;

    const handleTypingStart = (data) => {
      if (data.senderId === selectedFriend?._id) {
        setIsReceiverTyping(true);
      }
    };

    const handleTypingStop = (data) => {
      if (data.senderId === selectedFriend?._id) {
        setIsReceiverTyping(false);
      }
    };

    if (selectedFriend) {
      socketAPI.on("receive", handleReceiveMessage);
      socketAPI.on("typing:start", handleTypingStart);
      socketAPI.on("typing:stop", handleTypingStop);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isSelfTypingRef.current && selectedFriend?._id && socketAPI.connected) {
        socketAPI.emit("typing:stop", {
          senderId: user._id,
          receiverId: selectedFriend._id,
        });
      }
      socketAPI.off("receive", handleReceiveMessage);
      socketAPI.off("typing:start", handleTypingStart);
      socketAPI.off("typing:stop", handleTypingStop);
    };
  }, [selectedFriend]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleMessageSendSocket();
    }
  };

  const handleSelectEmoji = (emojiChar) => {
    let updatedMessage = "";
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart ?? message.length;
      const end = textareaRef.current.selectionEnd ?? message.length;
      updatedMessage =
        message.substring(0, start) + emojiChar + message.substring(end);
      handleTypingChange(updatedMessage);

      // Restore cursor position right after the newly inserted emoji
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const nextCursor = start + emojiChar.length;
          textareaRef.current.setSelectionRange(nextCursor, nextCursor);
        }
      }, 0);
    } else {
      updatedMessage = message + emojiChar;
      handleTypingChange(updatedMessage);
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
            {isReceiverTyping ? (
              <span className="text-xs text-primary font-medium flex items-center gap-1.5">
                <span className="inline-block animate-pulse font-semibold">typing</span>
                <span className="inline-flex gap-0.5 items-center">
                  <span className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1 h-1 rounded-full bg-primary animate-bounce"></span>
                </span>
              </span>
            ) : (
              <span className="text-xs text-base-content/60">Online</span>
            )}
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-3 flex flex-col gap-3 justify-between overflow-hidden">
        <div className="h-[70vh] w-full card p-3 overflow-y-auto bg-accent/20 custom-scrollbar space-y-2">
          {filteredChatData.map((chat, idx) => {
            const rawTime = chat.createdAt || chat.updatedAt || chat.timestamp;
            const currentDate = rawTime ? new Date(rawTime).toDateString() : null;
            const prevRawTime =
              idx > 0
                ? filteredChatData[idx - 1].createdAt ||
                filteredChatData[idx - 1].updatedAt ||
                filteredChatData[idx - 1].timestamp
                : null;
            const prevDate = prevRawTime ? new Date(prevRawTime).toDateString() : null;
            const showDateDivider = currentDate && currentDate !== prevDate;

            return (
              <React.Fragment key={chat._id || idx}>
                {showDateDivider && (
                  <div className="flex justify-center my-3 sticky top-0 z-10">
                    <span className="badge badge-sm py-2 px-3 bg-base-100/90 border border-base-300 backdrop-blur shadow-sm text-base-content/80 text-[11px] font-medium rounded-full">
                      {getDateDividerLabel(rawTime)}
                    </span>
                  </div>
                )}

                <div
                  className={`chat ${chat.senderId !== sender._id ? "chat-receiver" : "chat-sender"}`}
                >
                  <div className="chat-avatar avatar"></div>
                  <div className="chat-header text-base-content flex items-center flex-wrap gap-1 mb-1">
                    <span className="font-semibold text-xs">
                      {chat.senderId !== sender._id
                        ? receiver.fullName
                        : sender.fullName}
                    </span>
                    {rawTime && (
                      <time
                        title={formatFullDateTime(rawTime)}
                        className="text-base-content/60 text-[11px] ml-1.5"
                      >
                        • {formatMessageDayAndDate(rawTime)} at {formatMessageTime(rawTime)}
                      </time>
                    )}
                  </div>
                  <div className="flex items-end gap-1">
                    <div className="chat-bubble break-words">
                      {chat.replyTo && (
                        <div className="mb-2 p-2 rounded-lg bg-base-300/50 border-l-4 border-primary">
                          <div className="text-xs font-semibold text-primary">
                            {chat.replyTo.senderId === sender._id
                              ? sender.fullName
                              : receiver.fullName}
                          </div>

                          <div className="text-xs text-base-content/70 truncate max-w-[250px]">
                            {chat.replyTo.message}
                          </div>
                        </div>
                      )}

                      <div>{chat.message}</div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleReply(chat)}
                      className="btn btn-ghost btn-xs text-base-content/50 hover:text-primary"
                      title="Reply"
                    >
                      ↩
                    </button>
                  </div>
                </div>
              </React.Fragment>
            );
          })}

          {/* Real-time Typing Bubble Indicator */}
          {isReceiverTyping && (
            <div className="chat chat-receiver transition-all duration-300">
              <div className="chat-avatar avatar"></div>
              <div className="chat-header text-base-content flex items-center gap-1 mb-1">
                <span className="font-semibold text-xs text-primary">
                  {receiver?.fullName}
                </span>
              </div>
              <div className="chat-bubble bg-base-100 text-base-content/80 py-2.5 px-4 shadow-sm border border-base-300 rounded-2xl flex items-center gap-2 w-fit">
                <span className="text-xs text-base-content/60 italic font-medium">
                  {receiver?.fullName?.split(" ")[0] || "Friend"} is typing
                </span>
                <span className="inline-flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"></span>
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar with Emoji Trigger & Popover */}
        <div className="relative">

          {/* Reply Preview */}
          {replyingTo && (
            <div className="mb-2 px-4 py-2 bg-base-100 border border-base-300 rounded-xl flex items-center justify-between shadow-sm">

              <div className="border-l-4 border-primary pl-3 min-w-0">
                <div className="text-xs font-semibold text-primary">
                  Replying to{" "}
                  {replyingTo.senderId === sender._id
                    ? sender.fullName
                    : receiver.fullName}
                </div>

                <div className="text-sm text-base-content/70 truncate">
                  {replyingTo.message}
                </div>
              </div>

              <button
                type="button"
                onClick={cancelReply}
                className="btn btn-ghost btn-sm btn-circle"
                title="Cancel reply"
              >
                ✕
              </button>
            </div>
          )}

          {/* Emoji Picker Popover */}
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
              className={`btn btn-ghost btn-circle btn-sm text-xl transition-all ${showEmojiPicker
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
              onChange={(e) => handleTypingChange(e.target.value)}
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