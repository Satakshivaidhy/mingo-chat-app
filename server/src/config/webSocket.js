import Message from "../models/messageModel.js";

const OnlineUsers = {}

const WebSocket = (io) => {
    console.log("Socket Connected");

    io.on("connection", (socket) => {

        //console.log("User Connected", socket.id);

        socket.on("user:online", (userId) => {
            OnlineUsers[userId] = socket.id; // socket id store in object in Backend
            console.log("Online Users:", OnlineUsers);
            console.log("Path Created", userId);
            io.emit("users:list Online users", OnlineUsers) // send list of online users to Frontend
        });

        socket.on("user:disconnect", (userId) => {
            delete OnlineUsers[userId];   // user disconnect remove from object
            console.log("Online Users:", OnlineUsers);
            console.log("Path Destroyed", userId);
            io.emit("users:list Online users", OnlineUsers) // send list of online users to Frontend
            io.emit("typing:stop", { senderId: userId });
        });

        // Handle native socket disconnection
        socket.on("disconnect", () => {
            let disconnectedUserId = null;
            for (const [userId, socketId] of Object.entries(OnlineUsers)) {
                if (socketId === socket.id) {
                    disconnectedUserId = userId;
                    delete OnlineUsers[userId];
                    break;
                }
            }
            if (disconnectedUserId) {
                console.log("Online Users after disconnect:", OnlineUsers);
                io.emit("users:list Online users", OnlineUsers);
                io.emit("typing:stop", { senderId: disconnectedUserId });
            }
        });

        // Typing indicator events
        socket.on("typing:start", ({ senderId, receiverId }) => {
            const receiverSocketId = OnlineUsers[receiverId];
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("typing:start", { senderId, receiverId });
            }
        });

        socket.on("typing:stop", ({ senderId, receiverId }) => {
            const receiverSocketId = OnlineUsers[receiverId];
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("typing:stop", { senderId, receiverId });
            }
        });

        // message send
        socket.on("send", async (payload) => {
            console.log("Payload (Message Pack)", payload);
            try {
                let newMessage = await Message.create({
                    senderId: payload.senderId,
                    receiverId: payload.receiverId,
                    message: payload.message || "",
                    attachment: payload.attachment || null,
                    replyTo: payload.replyTo || null,
                });

                if (payload.replyTo) {
                    newMessage = await newMessage.populate("replyTo");
                }

                console.log("Message saved to database", newMessage);

                const newMessagePack = newMessage.toObject();

                const receiverSocketId = OnlineUsers[payload.receiverId];

                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("receive", newMessagePack);
                    io.to(receiverSocketId).emit("typing:stop", { senderId: payload.senderId, receiverId: payload.receiverId });
                }
            } catch (err) {
                console.error("Error saving/sending message:", err);
            }
        });
    });
};

export default WebSocket;
