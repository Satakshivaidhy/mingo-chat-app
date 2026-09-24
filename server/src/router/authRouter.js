import express from "express";
import { UserRegister, UserLogin, UserLogout, UpdatePassword, ForgotPassword } from "../controller/authController.js";
import { Protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", UserRegister);
router.post("/login", UserLogin);
router.post("/logout", UserLogout);
router.post("/update-password", Protect, UpdatePassword);
router.post("/forgot-password", ForgotPassword);

export default router;