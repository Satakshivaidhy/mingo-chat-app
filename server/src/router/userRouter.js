import express from "express";
import { getAllUsers, updateProfile } from "../controller/userController.js";
import { SendMessage, GetMessages } from "../controller/messageController.js";
import { Protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/allUsers", Protect, getAllUsers);
router.get("/allusers", Protect, getAllUsers);
router.put("/profile", Protect, updateProfile);

router.post("/send-message", Protect, SendMessage);
router.get("/get-messages/:friendId", Protect, GetMessages);

export default router;