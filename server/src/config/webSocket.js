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
        });

        // message send
        socket.on("send", async (payload) => {
            console.log("Payload (Messsage Pack)", payload);
            const newMessage = await Message.create({
                senderId: payload.senderId,
                receiverId: payload.receiverId,
                message: payload.message,
                replyTo: payload.replyTo || null,

            });
            console.log("Message saved to database", newMessage);

            const newMessagePack = newMessage.toObject();
            delete newMessagePack._id;
            delete newMessagePack.__v;

            const receiverSocketId = OnlineUsers[payload.receiverId];
            // const senderSocketId = OnlineUsers[payload.senderId];

            if (receiverSocketId) {
                io.to(receiverSocketId).emit("receive", newMessagePack);
            }
            // if(senderSocketId) {
            //     io.to(senderSocketId).emit("receive", newMessagePack);
            // }

        });
    });
};

export default WebSocket;
