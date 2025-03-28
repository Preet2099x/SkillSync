import React, { useState } from "react";
import "./JobRequirment.scss";

const JobRequirement = () => {
  const [formData, setFormData] = useState({
    jobTitle: "",
    description: "",
    skills: "",
    experience: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const jobData = {
      jobTitle: formData.jobTitle,
      description: formData.description,
      skills: formData.skills.split(",").map((skill) => skill.trim()),
      experience: formData.experience,
    };

    try {
      const response = await fetch("http://localhost:5000/save-job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jobData),
      });

      if (response.ok) {
        alert("✅ Job requirement saved successfully!");
      } else {
        alert("❌ Error saving job requirement.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Error saving job requirement.");
    }
  };

  return (
    <div className="job-form-container">
      <h2>Enter Job Requirements</h2>
      <form onSubmit={handleSubmit}>
        <label>Job Title:</label>
        <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange} required />

        <label>Job Description:</label>
        <textarea name="description" value={formData.description} onChange={handleChange} required></textarea>

        <label>Required Skills (comma-separated):</label>
        <input type="text" name="skills" value={formData.skills} onChange={handleChange} required />

        <label>Required Experience (years):</label>
        <input type="number" name="experience" value={formData.experience} onChange={handleChange} required />

        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default JobRequirement;
