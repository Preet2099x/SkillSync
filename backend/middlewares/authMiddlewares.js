import JWT from "jsonwebtoken";
import Candidate from "../models/CandidateModel.js";
import Company from "../models/CompanyModel.js";

// Protected Routes Middleware (Requires Token)
export const requireSignin = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided, authorization denied.",
      });
    }

    // Decode Token
    const decoded = JWT.verify(token, process.env.JWT_SECRET);
    req.userId = decoded._id;
    req.userType = decoded.userType; // 'candidate' or 'company'

    // Fetch User Based on Type
    if (req.userType === "candidate") {
      req.user = await Candidate.findById(req.userId).select("-password");
    } else if (req.userType === "company") {
      req.user = await Company.findById(req.userId).select("-password");
    }

    if (!req.user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};
