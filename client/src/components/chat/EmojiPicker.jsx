import React, { useState, useEffect, useMemo, useRef } from "react";
import { EMOJI_CATEGORIES, QUICK_REACTIONS, EMOJIS } from "./emojiData";
import { FiSearch, FiX } from "react-icons/fi";

const RECENT_KEY = "mingo_recent_emojis";

const EmojiPicker = ({ onSelectEmoji, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("smileys");
  const [recentEmojis, setRecentEmojis] = useState([]);
  const pickerRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
      setRecentEmojis(saved);
    } catch {
      setRecentEmojis([]);
    }
  }, []);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        // Also check if clicked the trigger button
        if (!e.target.closest("[data-emoji-trigger]")) {
          onClose?.();
        }
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const handleEmojiClick = (emojiChar) => {
    onSelectEmoji(emojiChar);

    // Update recent emojis in localStorage
    setRecentEmojis((prev) => {
      const filtered = prev.filter((e) => e !== emojiChar);
      const updated = [emojiChar, ...filtered].slice(0, 18);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
      return updated;
    });
  };

  // Filtered emojis based on search or category
  const filteredEmojis = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return null;

    return EMOJIS.filter(
      (e) =>
        e.name.toLowerCase().includes(query) ||
        e.keywords.some((kw) => kw.toLowerCase().includes(query)) ||
        e.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const groupedEmojis = useMemo(() => {
    const groups = {};
    for (const cat of EMOJI_CATEGORIES) {
      if (cat.id === "recent") continue;
      groups[cat.id] = EMOJIS.filter((e) => e.category === cat.id);
    }
    return groups;
  }, []);

  return (
    <div
      ref={pickerRef}
      className="absolute bottom-16 left-2 sm:left-4 z-50 w-[320px] sm:w-[360px] max-w-[95vw] bg-base-100/95 backdrop-blur-md text-base-content border border-base-300 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-200 animate-in fade-in zoom-in-95"
      style={{ height: "420px" }}
    >
      {/* Header with Search & Quick Close */}
      <div className="p-3 pb-2 border-b border-base-300 flex items-center gap-2">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50 size-4" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search emoji..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-sm w-full pl-9 pr-8 bg-base-200/70 border-base-300 rounded-full text-sm focus:outline-primary placeholder:text-base-content/40"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content size-4"
            >
              <FiX />
            </button>
          )}
        </div>
        <button
          onClick={onClose}
          className="btn btn-ghost btn-circle btn-xs text-base-content/60 hover:text-base-content"
          title="Close"
        >
          <FiX className="size-4" />
        </button>
      </div>

      {/* Quick Reactions Bar (WhatsApp/Instagram style) */}
      {!searchQuery && (
        <div className="px-3 py-1.5 bg-base-200/40 border-b border-base-300 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-semibold text-base-content/60 uppercase tracking-wider pl-1 shrink-0">
            Top
          </span>
          <div className="flex gap-1">
            {QUICK_REACTIONS.map((emoji, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleEmojiClick(emoji)}
                className="w-7 h-7 flex items-center justify-center text-lg hover:scale-125 hover:bg-base-200 rounded-lg transition-transform active:scale-95 shrink-0"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category Tabs (when not searching) */}
      {!searchQuery && (
        <div className="flex items-center justify-between px-2 py-1 bg-base-200/50 border-b border-base-300 text-xs overflow-x-auto no-scrollbar">
          {recentEmojis.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveCategory("recent")}
              className={`px-2 py-1 rounded-lg text-sm transition-colors ${
                activeCategory === "recent"
                  ? "bg-primary text-primary-content font-bold shadow-sm"
                  : "text-base-content/60 hover:bg-base-200 hover:text-base-content"
              }`}
              title="Recently Used"
            >
              🕒
            </button>
          )}
          {EMOJI_CATEGORIES.filter((c) => c.id !== "recent").map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setActiveCategory(cat.id);
                const elem = document.getElementById(`cat-${cat.id}`);
                if (elem) elem.scrollIntoView({ behavior: "smooth" });
              }}
              className={`px-2 py-1 rounded-lg text-sm transition-colors ${
                activeCategory === cat.id
                  ? "bg-primary text-primary-content font-bold shadow-sm"
                  : "text-base-content/60 hover:bg-base-200 hover:text-base-content"
              }`}
              title={cat.name}
            >
              {cat.icon}
            </button>
          ))}
        </div>
      )}

      {/* Emoji Content List */}
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-4">
        {searchQuery ? (
          <div>
            <div className="text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-2">
              Results ({filteredEmojis.length})
            </div>
            {filteredEmojis.length > 0 ? (
              <div className="grid grid-cols-7 sm:grid-cols-8 gap-1">
                {filteredEmojis.map((emoji, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleEmojiClick(emoji.char)}
                    title={emoji.name}
                    className="h-10 w-10 flex items-center justify-center text-2xl hover:scale-125 hover:bg-base-200 rounded-xl transition-transform active:scale-90"
                  >
                    {emoji.char}
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-base-content/50 text-sm">
                No emojis found for "{searchQuery}"
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Recently Used */}
            {recentEmojis.length > 0 && (
              <div id="cat-recent">
                <div className="text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span>🕒</span> Recently Used
                </div>
                <div className="grid grid-cols-7 sm:grid-cols-8 gap-1">
                  {recentEmojis.map((char, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleEmojiClick(char)}
                      className="h-10 w-10 flex items-center justify-center text-2xl hover:scale-125 hover:bg-base-200 rounded-xl transition-transform active:scale-90"
                    >
                      {char}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Categorized Emojis */}
            {EMOJI_CATEGORIES.filter((c) => c.id !== "recent").map((cat) => {
              const list = groupedEmojis[cat.id] || [];
              return (
                <div key={cat.id} id={`cat-${cat.id}`}>
                  <div className="text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span>{cat.icon}</span> {cat.name}
                  </div>
                  <div className="grid grid-cols-7 sm:grid-cols-8 gap-1">
                    {list.map((emoji, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleEmojiClick(emoji.char)}
                        title={emoji.name}
                        className="h-10 w-10 flex items-center justify-center text-2xl hover:scale-125 hover:bg-base-200 rounded-xl transition-transform active:scale-90"
                      >
                        {emoji.char}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Footer hint */}
      <div className="px-3 py-1 bg-base-200/50 border-t border-base-300 text-[11px] text-base-content/50 flex justify-between items-center">
        <span>Click to insert</span>
        <span>Esc to close</span>
      </div>
    </div>
  );
};

export default EmojiPicker;
