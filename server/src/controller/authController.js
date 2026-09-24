import { generateToken } from "../config/authToken.js";
import User from "../models/userModel.js";
import bcrypt from "bcrypt";

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// ================= REGISTER =================
export const UserRegister = async (req, res, next) => {
  try {
    const { fullName, email, mobileNumber, password } = req.body;

    if (!fullName || !email || !mobileNumber || !password) {
      const error = new Error("All fields required");
      error.statusCode = 400;
      return next(error);
    }

    if (!PASSWORD_REGEX.test(password)) {
      const error = new Error("Password must be at least 8 characters with uppercase, lowercase, number and special character");
      error.statusCode = 400;
      return next(error);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error("Email already exists");
      error.statusCode = 400;
      return next(error);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullName,
      email,
      mobileNumber,
      password: hashedPassword,
    });

    generateToken(newUser._id, res);

    const userData = newUser.toObject();
    delete userData.password;

    res.status(201).json({
      message: "Registration successful",
      data: userData,
    });
  } catch (error) {
    next(error);
  }
};

// ================= LOGIN =================
export const UserLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const error = new Error("All fields required");
      error.statusCode = 400;
      return next(error);
    }

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      const error = new Error("Email not registered");
      error.statusCode = 400;
      return next(error);
    }

    const isPasswordMatch = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordMatch) {
      const error = new Error("Password did not match");
      error.statusCode = 400;
      return next(error);
    }

    generateToken(existingUser._id, res);

    const userData = existingUser.toObject();
    delete userData.password;

    res.status(200).json({
      message: "Login successful",
      data: userData,
    });
  } catch (error) {
    next(error);
  }
};

// ================= UPDATE PASSWORD =================
export const UpdatePassword = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      const error = new Error("Current password and new password are required");
      error.statusCode = 400;
      return next(error);
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      const error = new Error("New password must be at least 8 characters with uppercase, lowercase, number and special character");
      error.statusCode = 400;
      return next(error);
    }

    const user = await User.findById(currentUser._id);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordMatch) {
      const error = new Error("Current password is incorrect");
      error.statusCode = 400;
      return next(error);
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ================= FORGOT PASSWORD =================
export const ForgotPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      const error = new Error("Email and new password are required");
      error.statusCode = 400;
      return next(error);
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      const error = new Error("New password must be at least 8 characters with uppercase, lowercase, number and special character");
      error.statusCode = 400;
      return next(error);
    }

    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error("No account found with this email");
      error.statusCode = 404;
      return next(error);
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ================= LOGOUT =================
export const UserLogout = async (req, res, next) => {
  try {
    const isProduction = process.env.NODE_ENV === "production" || process.env.RENDER === "true";
    res.clearCookie("token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });

    res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};