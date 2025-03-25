import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  skills: [{ type: String, required: true }],
  salary: { type: String },
  experience: { type: String },
  company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true }, // References Company
}, { timestamps: true });

export default mongoose.model("Job", jobSchema);
