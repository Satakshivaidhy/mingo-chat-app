import express from "express";
import { UserRegister, UserLogin, UserLogout } from "../controller/authController.js";

const router = express.Router();

router.post("/register", UserRegister);
router.post("/login", UserLogin);
router.post("/logout", UserLogout);

export default router;