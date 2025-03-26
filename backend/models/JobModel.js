import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to company
    location: { type: String, required: true },
    salary: { type: Number, required: true },
    requirements: { type: [String], required: true },
    category: { type: String, required: true },
    type: { type: String, enum: ["Full-time", "Part-time", "Contract", "Internship"], required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Job", jobSchema);
