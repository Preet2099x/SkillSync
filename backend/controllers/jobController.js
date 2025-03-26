import Job from '../models/JobModel.js'

// Create a Job
export const createJob = async (req, res) => {
  try {
    const { title, description, location, salary, requirements, category, type } = req.body;
    if (!title || !description || !location || !salary || !requirements || !category || !type) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const newJob = new Job({ title, description, location, salary, requirements, category, type, company: req.user._id });
    await newJob.save();
    res.status(201).json({ success: true, message: "Job created successfully", job: newJob });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating job", error: error.message });
  }
};

// Get All Jobs
export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate("company", "name email");
    res.status(200).json({ success: true, jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching jobs", error: error.message });
  }
};

// Get Job by ID
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("company", "name email");
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }
    res.status(200).json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching job", error: error.message });
  }
};

// Update Job
export const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    if (job.company.toString() !== req.user._id) {
      return res.status(403).json({ success: false, message: "Unauthorized to update this job" });
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, message: "Job updated successfully", job: updatedJob });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating job", error: error.message });
  }
};

// Delete Job
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    if (job.company.toString() !== req.user._id) {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this job" });
    }

    await Job.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting job", error: error.message });
  }
};
