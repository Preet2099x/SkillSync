import os
import json
import ollama
from datetime import datetime

import sys
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

# Enable GPU acceleration for Ollama
os.environ["OLLAMA_ACCELERATE"] = "1"

# File paths
processed_resume_file = "resume_raw_text.txt"
job_requirements_file = "jobRequirement.json"
alternate_resume_file = "resume_processed_text.txt"
evaluation_results_file = "high_score_candidates.csv"  # Changed file name to reflect content

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

    # Extract candidate info from job requirements
    candidate_name = job_requirements.get('candidateName', 'Unknown Candidate')
    candidate_email = job_requirements.get('candidateEmail', 'No email provided')

    # Build a job requirements string from the JSON data
    job_requirements_str = (
        f"Job Title: {job_requirements.get('jobTitle', 'N/A')}\n"
        f"Job Description: {job_requirements.get('description', 'N/A')}\n"
        f"Required Skills: {', '.join(job_requirements.get('skills', []))}\n"
        f"Required Experience: {job_requirements.get('experience', 'N/A')}\n"
    )

    # Construct the AI prompt
    prompt = f"""You are a highly experienced recruiter specializing in evaluating candidates for tech roles.
Below are the job requirements and a candidate's resume text.

Job Requirements:
{job_requirements_str}

Resume:
{resume_text}

[Previous prompt content remains the same...]
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

    # Extract the score from the response
    final_score = 0
    if "**Final Score:**" in response:
        try:
            score_line = response.split("**Final Score:**")[1].strip().split("\n")[0]
            final_score = int(score_line.split("/")[0].strip())
        except (ValueError, IndexError):
            print("\n⚠️ Could not extract valid score from evaluation")

    # Only save if score is 80 or above
    if final_score >= 80:
        # Prepare minimal data for saving (name, email, score)
        evaluation_data = {
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "candidate_name": candidate_name,
            "candidate_email": candidate_email,
            "job_title": job_requirements.get('jobTitle', 'N/A'),
            "final_score": final_score
        }

        # Save evaluation results to CSV file
        try:
            # Check if file exists to write headers
            file_exists = os.path.exists(evaluation_results_file)
            
            with open(evaluation_results_file, "a", encoding="utf-8") as f:
                if not file_exists:
                    f.write("Timestamp,Candidate Name,Candidate Email,Job Title,Score\n")
                
                f.write(
                    f'"{evaluation_data["timestamp"]}",'
                    f'"{evaluation_data["candidate_name"]}",'
                    f'"{evaluation_data["candidate_email"]}",'
                    f'"{evaluation_data["job_title"]}",'
                    f'{evaluation_data["final_score"]}\n'
                )
            
            print(f"\n✅ High score candidate saved to {evaluation_results_file}")
        except Exception as save_error:
            print(f"\n❌ Error saving evaluation results: {save_error}")
    else:
        print(f"\nℹ️ Candidate score {final_score} is below 80, not saving to high score list.")

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