import express from "express";
import { createJob, getJobs, getJobById, updateJob, deleteJob } from "../controllers/jobController.js";
import { requireSignin, isCompany } from "../middlewares/authMiddlewares.js";

const router = express.Router();

// Create Job (Only Companies)
router.post("/create", requireSignin, isCompany, createJob);

// Get All Jobs
router.get("/all", getJobs);

// Get Single Job by ID
router.get("/:id", getJobById);

// Update Job (Only the company that created it)
router.put("/:id", requireSignin, isCompany, updateJob);

// Delete Job (Only the company that created it)
router.delete("/:id", requireSignin, isCompany, deleteJob);

export default router;
