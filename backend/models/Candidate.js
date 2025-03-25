import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resume: { type: String }, // Can store a URL
}, { timestamps: true });

export default mongoose.model("Candidate", candidateSchema);
