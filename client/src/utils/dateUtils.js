// Utility functions for formatting message timestamp, day, and date

export const formatMessageTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
};

export const formatMessageDayAndDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";

  const dayName = d.toLocaleDateString("en-US", { weekday: "short" }); // e.g. "Fri"
  const dateFormatted = d.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }); // e.g. "04 Sep 2026"

  return `${dayName}, ${dateFormatted}`;
};

export const formatFullDateTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

export const getDateDividerLabel = (dateStr) => {
  if (!dateStr) return "";
  const msgDate = new Date(dateStr);
  if (isNaN(msgDate.getTime())) return "";

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isToday = msgDate.toDateString() === today.toDateString();
  const isYesterday = msgDate.toDateString() === yesterday.toDateString();

  const dayName = msgDate.toLocaleDateString("en-US", { weekday: "long" });
  const fullDate = msgDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (isToday) {
    return `Today (${dayName}, ${fullDate})`;
  } else if (isYesterday) {
    return `Yesterday (${dayName}, ${fullDate})`;
  } else {
    return `${dayName}, ${fullDate}`;
  }
};
