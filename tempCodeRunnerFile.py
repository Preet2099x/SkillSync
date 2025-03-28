import os
import json
import ollama

import sys
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')


# Enable GPU acceleration for Ollama
os.environ["OLLAMA_ACCELERATE"] = "1"

# File paths
processed_resume_file = "resume_raw_text.txt"
job_requirements_file = "jobRequirement.json"
alternate_resume_file = "resume_processed_text.txt"

try:
    # Read the processed resume text file
    with open(processed_resume_file, "r", encoding="utf-8") as file:
        resume_text = file.read().strip()

    # Check if the resume text is empty
    if not resume_text:
        print("⚠️ Resume text is empty. Please check the extracted file.")
        exit()

    # Read the job requirements JSON file
    with open(job_requirements_file, "r", encoding="utf-8") as file:
        job_requirements = json.load(file)

    # Build a job requirements string from the JSON data
    job_requirements_str = (
        f"Job Title: {job_requirements.get('jobTitle', 'N/A')}\n"
        f"Job Description: {job_requirements.get('description', 'N/A')}\n"
        f"Required Skills: {', '.join(job_requirements.get('skills', []))}\n"
        f"Required Experience: {job_requirements.get('experience', 'N/A')}\n"
    )

    # Construct a stricter AI prompt including both the job requirements and the resume text
    prompt = f"""You are a highly experienced recruiter specializing in evaluating candidates for tech roles.
Below are the job requirements and a candidate's resume text.

Job Requirements:
{job_requirements_str}

Resume:
{resume_text}

Evaluate the candidate's overall fitness for the role described above with a critical approach. Do not be overly generous. 
Consider the following points strictly:
- The candidate must meet the technical skills required (e.g., Docker, Node, AWS, MongoDB, PostgreSQL).
- The candidate should have solid backend experience. A short duration of internships should be scored lower.
- Missing key backend skills should significantly lower the score.
- Prioritize depth and relevance of experience over breadth of skills that are not directly related to backend development.
- If critical skills or experience are lacking, the final score should reflect these deficiencies.
- Ensure that your final score is consistent with your detailed evaluation. Avoid significant fluctuations or inconsistent scoring between similar evaluations.

Provide a structured evaluation with detailed observations, and justify your score with specific reference to the job requirements. 
Format your response as:

**Strengths:**
- ...

**Weaknesses:**
- ...

**Final Score:** X/100
"""

    print("\n🔍 Analyzing resume with AI (strict evaluation)...\n")

    # Stream the AI response from Ollama
    response = ""
    for chunk in ollama.chat(model="mistral", messages=[{"role": "user", "content": prompt}], stream=True):
        message_content = chunk.get("message", {}).get("content", "")
        if message_content:
            response += message_content
            print(message_content, end="", flush=True)

    print("\n" + "-" * 50)  # Separator for clarity

    # After evaluation, attempt to delete the resume text files if they exist
    for file_path in [processed_resume_file, alternate_resume_file]:
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
                print(f"\n✅ Deleted file: {file_path}")
            except Exception as delete_error:
                print(f"\n❌ Error deleting file {file_path}: {delete_error}")
        else:
            print(f"\nℹ️ File {file_path} not found, skipping deletion.")

except FileNotFoundError as fnf_error:
    print(f"❌ Error: {fnf_error}")
except Exception as e:
    print(f"\n❌ Unexpected Error: {str(e)}")
