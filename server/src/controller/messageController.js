import Message from "../models/messageModel.js";

export const SendMessage = async (req, res, next) => {
  try {
    const { receiverID, message, attachment } = req.body;
    const currentUser = req.user;

    if (!receiverID || (!message && !attachment)) {
      const error = new Error("Receiver and message or attachment are required");
      error.statusCode = 400;
      return next(error);
    }

    const newMessage = await Message.create({
      senderId: currentUser._id,
      receiverId: receiverID,
      message: message || "",
      attachment: attachment || null,
    });
    res
      .status(201)
      .json({ message: "Message sent successfully", data: newMessage });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const GetMessages = async (req, res, next) => {
  try {
    const { friendId } = req.params;
    const currentUser = req.user;

    const messages = await Message.find({
      $or: [
        { senderId: currentUser._id, receiverId: friendId },
        { senderId: friendId, receiverId: currentUser._id },
      ],
    })
      .populate("replyTo")
      .sort({ createdAt: 1 });
    res.status(200).json({ data: messages });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};