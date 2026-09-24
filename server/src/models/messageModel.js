import mongoose from "mongoose";

const messageSchema = mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    message: {
      type: String,
      default: "",
    },
    attachment: {
      name: {
        type: String,
        default: "",
      },
      type: {
        type: String,
        default: "",
      },
      dataUrl: {
        type: String,
        default: "",
      },
      size: {
        type: Number,
        default: 0,
      },
    },
    // Message that this message is replying to
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
  },
  { timestamps: true },
);

const Message = mongoose.model("Message", messageSchema);
export default Message;