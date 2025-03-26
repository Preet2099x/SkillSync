import JWT from "jsonwebtoken";
import Candidate from "../models/CandidateModel.js";
import Company from "../models/CompanyModel.js";

// Protected Routes Middleware (Requires Token)
export const requireSignin = async (req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided, authorization denied.",
      });
    }

    // Extract token from "Bearer <token>" format
    if (token.startsWith("Bearer ")) {
      token = token.split(" ")[1];
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in environment variables.");
      return res.status(500).json({
        success: false,
        message: "Server configuration error. Please check environment variables.",
      });
    }

    // Decode Token
    const decoded = JWT.verify(token, process.env.JWT_SECRET);
    req.userId = decoded._id;
    req.userType = decoded.userType; // 'candidate' or 'company'

    // Fetch User Based on Type
    req.user = req.userType === "candidate"
      ? await Candidate.findById(req.userId).select("-password")
      : await Company.findById(req.userId).select("-password");

    if (!req.user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(401).json({
      success: false,
      message: error.name === "TokenExpiredError" 
        ? "Token has expired. Please log in again."
        : "Invalid or malformed token.",
    });
  }
};

// Middleware to Check if User is a Company
export const isCompany = async (req, res, next) => {
  try {
    if (req.user?.userType !== "company") {
      return res.status(403).json({
        success: false,
        message: "Only companies can perform this action.",
      });
    }
    next();
  } catch (error) {
    console.error("Company Middleware Error:", error);
    res.status(500).json({
      success: false,
      message: "Error in Company Middleware",
      error: error.message,
    });
  }
};
