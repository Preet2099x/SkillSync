import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  industry: { type: String },
  website: { type: String },
  token: { type: String },  // Store JWT token
}, { timestamps: true });

export default mongoose.model("Company", companySchema);
