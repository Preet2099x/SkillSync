import Candidate from "../models/CandidateModel.js";
import Company from "../models/CompanyModel.js";
import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import JWT from "jsonwebtoken";

// REGISTER CONTROLLER FOR CANDIDATE
export const candidateRegisterController = async (req, res) => {
    try {
        const { name, email, password, resume } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const existingCandidate = await Candidate.findOne({ email });
        if (existingCandidate) {
            return res.status(400).json({ success: false, message: "Candidate already registered, please login" });
        }

        const hashedPassword = await hashPassword(password);
        const candidate = await new Candidate({ name, email, password: hashedPassword, resume }).save();

        res.status(201).json({ success: true, message: "Candidate registered successfully", candidate });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error in Registration", error: error.message });
    }
};

// REGISTER CONTROLLER FOR COMPANY
export const companyRegisterController = async (req, res) => {
    try {
        const { name, email, password, industry, website } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const existingCompany = await Company.findOne({ email });
        if (existingCompany) {
            return res.status(400).json({ success: false, message: "Company already registered, please login" });
        }

        const hashedPassword = await hashPassword(password);
        const company = await new Company({ name, email, password: hashedPassword, industry, website }).save();

        res.status(201).json({ success: true, message: "Company registered successfully", company });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error in Registration", error: error.message });
    }
};

// LOGIN CONTROLLER (FOR BOTH CANDIDATES & COMPANIES)
export const loginController = async (req, res) => {
    try {
        const { email, password, userType } = req.body; // userType: 'candidate' or 'company'
        
        if (!email || !password || !userType) {
            return res.status(400).json({ success: false, message: "Email, password, and userType are required" });
        }

        let user;
        if (userType === "candidate") {
            user = await Candidate.findOne({ email });
        } else if (userType === "company") {
            user = await Company.findOne({ email });
        } else {
            return res.status(400).json({ success: false, message: "Invalid user type" });
        }

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const match = await comparePassword(password, user.password);
        if (!match) {
            return res.status(401).json({ success: false, message: "Invalid password" });
        }

        const token = JWT.sign({ _id: user._id, userType }, process.env.JWT_SECRET, { expiresIn: "7d" });
        console.log(token); // just for testing

        // Store token in the database
        user.token = token;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                userType,
                ...(userType === "candidate" ? { resume: user.resume } : { industry: user.industry, website: user.website }),
                token
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error in Login", error: error.message });
    }
};
