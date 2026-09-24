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

const Chatting = ({ selectedFriend, currentUser, onBack }) => {
  const { user } = useAuth();
  const [filteredChatData, setFilteredChatData] = useState([]);
  const [receiver, setReceiver] = useState("");
  const [sender, setSender] = useState("");
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isReceiverTyping, setIsReceiverTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isSelfTypingRef = useRef(false);
  const fileInputRef = useRef(null);
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

  const handleAttachmentSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setAttachment({
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl: reader.result,
      });
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleMessageSendSocket = async () => {
    if ((!message || !message.trim()) && !attachment) return;

    stopTypingEmitter();

    const payload = {
      senderId: user._id,
      receiverId: receiver?._id,
      message: message.trim(),
      attachment: attachment ? { ...attachment } : null,
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
            attachment: attachment ? { ...attachment } : null,
            replyTo: replyingTo || null,
            updatedAt: timeStamp,
            createdAt: timeStamp,
          },
        ]);
        setMessage("");
        setAttachment(null);
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
    <div className="flex flex-col h-full w-full bg-base-300 min-w-0 overflow-hidden">
      {/* Chat Top Header */}
      <div className="h-14 sm:h-16 bg-base-200/95 backdrop-blur px-3 sm:px-4 border-b border-base-300 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Mobile Back Button (WhatsApp style) */}
          <button
            type="button"
            onClick={onBack}
            className="md:hidden btn btn-ghost btn-circle btn-sm -ml-1 text-base-content/80 hover:text-base-content shrink-0"
            title="Back to contacts"
            aria-label="Back to contacts"
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <div className="avatar placeholder shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/20 text-primary font-semibold flex items-center justify-center ring-1 ring-primary/30">
              <span className="text-sm sm:text-base">
                {receiver?.fullName?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
          </div>

          <div className="min-w-0">
            <h3 className="font-semibold text-sm sm:text-base text-base-content leading-tight truncate">
              {receiver?.fullName || "Chat"}
            </h3>
            {isReceiverTyping ? (
              <span className="text-[11px] sm:text-xs text-primary font-medium flex items-center gap-1">
                <span className="animate-pulse">typing</span>
                <span className="inline-flex gap-0.5 items-center">
                  <span className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1 h-1 rounded-full bg-primary animate-bounce"></span>
                </span>
              </span>
            ) : (
              <span className="text-[11px] sm:text-xs text-success font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success"></span> Online
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 text-base-content/70">
          <button
            type="button"
            onClick={fetchChatData}
            className="btn btn-ghost btn-circle btn-xs sm:btn-sm text-base-content/70 hover:text-base-content"
            title="Refresh messages"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area - dynamically fills height without hardcoded vh */}
      <div className="flex-1 min-h-0 w-full p-2.5 sm:p-4 overflow-y-auto bg-base-300/40 custom-scrollbar space-y-2 sm:space-y-3">
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
                <div className="flex justify-center my-2 sticky top-1 z-10">
                  <span className="badge badge-sm py-1.5 px-3 bg-base-100/90 border border-base-300/80 backdrop-blur shadow-sm text-base-content/80 text-[10px] sm:text-[11px] font-medium rounded-full">
                    {getDateDividerLabel(rawTime)}
                  </span>
                </div>
              )}

              <div
                className={`chat ${chat.senderId !== sender._id ? "chat-receiver" : "chat-sender"}`}
              >
                <div className="chat-avatar avatar hidden sm:inline-flex"></div>
                <div className="chat-header text-base-content flex items-center flex-wrap gap-1 mb-0.5">
                  <span className="font-semibold text-[11px] sm:text-xs">
                    {chat.senderId !== sender._id
                      ? receiver.fullName
                      : sender.fullName}
                  </span>
                  {rawTime && (
                    <time
                      title={formatFullDateTime(rawTime)}
                      className="text-base-content/50 text-[10px] sm:text-[11px] ml-1"
                    >
                      • {formatMessageTime(rawTime)}
                    </time>
                  )}
                </div>

                <div className="flex items-end gap-1 max-w-[88%] sm:max-w-[75%]">
                  <div className="chat-bubble break-words break-all sm:break-normal text-sm leading-relaxed p-2.5 sm:p-3 shadow-sm">
                    {chat.replyTo && (
                      <div className="mb-1.5 p-1.5 px-2 rounded-lg bg-base-300/60 border-l-4 border-primary text-xs">
                        <div className="font-semibold text-primary text-[11px]">
                          {chat.replyTo.senderId === sender._id
                            ? sender.fullName
                            : receiver.fullName}
                        </div>
                        <div className="text-base-content/70 truncate max-w-[200px] sm:max-w-[280px]">
                          {chat.replyTo.message}
                        </div>
                      </div>
                    )}

                    {chat.attachment?.dataUrl && (
                      <div className="mb-2">
                        {chat.attachment.type?.startsWith("image/") ? (
                          <img
                            src={chat.attachment.dataUrl}
                            alt={chat.attachment.name || "Shared image"}
                            className="max-w-full max-h-64 rounded-xl border border-base-300 object-cover"
                          />
                        ) : (
                          <a
                            href={chat.attachment.dataUrl}
                            download={chat.attachment.name || "file"}
                            className="inline-flex items-center gap-2 rounded-xl bg-base-200 px-3 py-2 text-xs font-medium text-primary hover:underline"
                          >
                            <span>📎</span>
                            {chat.attachment.name || "Attachment"}
                          </a>
                        )}
                      </div>
                    )}

                    {chat.message && <div>{chat.message}</div>}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleReply(chat)}
                    className="btn btn-ghost btn-xs text-base-content/40 hover:text-primary p-0.5 shrink-0"
                    title="Reply"
                  >
                    ↩
                  </button>
                </div>
              </div>
            </React.Fragment>
          );
        })}

        {/* Real-time Typing Indicator */}
        {isReceiverTyping && (
          <div className="chat chat-receiver transition-all duration-300">
            <div className="chat-header text-base-content flex items-center gap-1 mb-0.5">
              <span className="font-semibold text-[11px] text-primary">
                {receiver?.fullName}
              </span>
            </div>
            <div className="chat-bubble bg-base-100 text-base-content/80 py-2 px-3 shadow-sm border border-base-300 rounded-2xl flex items-center gap-2 w-fit">
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
      <div className="p-2 sm:p-3 bg-base-200/90 backdrop-blur border-t border-base-300 shrink-0 relative">
        {/* Reply Preview */}
        {replyingTo && (
          <div className="mb-2 px-3 py-1.5 bg-base-100 border border-base-300 rounded-xl flex items-center justify-between shadow-sm">
            <div className="border-l-4 border-primary pl-2.5 min-w-0 flex-1">
              <div className="text-[11px] font-semibold text-primary">
                Replying to{" "}
                {replyingTo.senderId === sender._id
                  ? sender.fullName
                  : receiver.fullName}
              </div>
              <div className="text-xs text-base-content/70 truncate">
                {replyingTo.message}
              </div>
            </div>

            <button
              type="button"
              onClick={cancelReply}
              className="btn btn-ghost btn-xs btn-circle ml-2"
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

        {attachment && (
          <div className="mb-2 flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-base-content/80">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base">📎</span>
              <span className="truncate">{attachment.name}</span>
            </div>
            <button
              type="button"
              onClick={() => setAttachment(null)}
              className="btn btn-ghost btn-xs btn-circle"
              title="Remove attachment"
            >
              ✕
            </button>
          </div>
        )}

        {/* Input Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-base-100 border border-base-300 rounded-2xl p-1.5 sm:p-2 shadow-sm focus-within:border-primary/60 transition-colors">
          <button
            type="button"
            data-emoji-trigger="true"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className={`btn btn-ghost btn-circle btn-sm text-lg transition-transform ${
              showEmojiPicker
                ? "text-primary scale-110 bg-base-200"
                : "text-base-content/60 hover:text-base-content"
            }`}
            title="Add Emoji"
          >
            {showEmojiPicker ? (
              <BsEmojiSmileFill className="size-5 text-primary" />
            ) : (
              <BsEmojiSmile className="size-5" />
            )}
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-ghost btn-circle btn-sm text-lg text-base-content/60 hover:text-base-content"
            title="Upload file or image"
          >
            📎
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.csv"
            className="hidden"
            onChange={handleAttachmentSelect}
          />

          <textarea
            ref={textareaRef}
            className="flex-1 outline-none resize-none bg-transparent text-base-content placeholder-base-content/50 py-1 text-sm max-h-28 min-h-[28px] leading-relaxed"
            placeholder="Type a message..."
            rows="1"
            onChange={(e) => handleTypingChange(e.target.value)}
            onKeyDown={handleKeyDown}
            value={message}
          ></textarea>

          <button
            type="button"
            onClick={handleMessageSendSocket}
            disabled={(!message || !message.trim()) && !attachment}
            className="btn btn-primary btn-sm btn-circle shrink-0 disabled:opacity-40 transition-transform active:scale-95 shadow-sm"
            title="Send message"
          >
            <IoSend className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatting;