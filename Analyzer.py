import os
import json
import ollama
from datetime import datetime
import re

import sys
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

# Enable GPU acceleration for Ollama
os.environ["OLLAMA_ACCELERATE"] = "1"

# File paths
processed_resume_file = "resume_raw_text.txt"
job_requirements_file = "jobRequirement.json"
alternate_resume_file = "resume_processed_text.txt"
evaluation_results_file = "high_score_candidates.csv"

# Minimum score to save candidate
MINIMUM_SCORE = 80

def extract_contact_info(text):
    """Extract name and email from resume text with multiple methods"""
    # Method 1: Direct extraction from first lines
    first_lines = text.split('\n')[:3]
    name, email = None, None
    
    # Try to find name (typically first line)
    if first_lines:
        name_line = first_lines[0].strip()
        if re.match(r"^[A-Z][a-z]+ [A-Z][a-z]+$", name_line):
            name = name_line
    
    # Try to find email in first 3 lines
    for line in first_lines:
        email_match = re.search(r"\b([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.com)\b", line)
        if email_match:
            email = email_match.group(0)
            break
    
    # Method 2: Ask AI model if not found
    if not name or not email:
        contact_prompt = f"""Extract just the candidate's full name and email address from this resume text.
Return ONLY in this format: NAME|EMAIL

Resume Text:
{text[:1000]}... [truncated]"""
        
        try:
            ai_response = ollama.chat(
                model="mistral",
                messages=[{"role": "user", "content": contact_prompt}]
            )
            contact_info = ai_response['message']['content'].strip()
            if '|' in contact_info:
                ai_name, ai_email = contact_info.split('|')[:2]
                name = name or ai_name.strip()
                email = email or ai_email.strip()
        except Exception as e:
            print(f"⚠️ Error getting contact info from AI: {str(e)}")
    
    # Final fallbacks
    name = name or "Unknown Candidate"
    email = email or "No email found"
    
    return name, email

try:
    # Read the processed resume text file
    with open(processed_resume_file, "r", encoding="utf-8") as file:
        resume_text = file.read().strip()

    # Check if the resume text is empty
    if not resume_text:
        print("⚠️ Resume text is empty. Please check the extracted file.")
        exit()

    # Extract candidate info from resume text
    candidate_name, candidate_email = extract_contact_info(resume_text)
    print(f"\n👤 Candidate: {candidate_name}")
    print(f"📧 Email: {candidate_email}\n")

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

    # Construct the evaluation prompt
    prompt = f"""**Candidate Application Review**
    
**Job Requirements:**
{job_requirements_str}

**Resume Content:**
{resume_text[:3000]}... [truncated if long]

Please evaluate this candidate strictly against the job requirements. Consider:
1. Technical skills match (30%)
2. Relevant experience (25%)
3. Project quality (20%)
4. Education (15%)
5. Overall fit (10%)

Provide a brief evaluation (3-5 bullet points) and conclude with:
FINAL_SCORE: XX/100
"""

    print("🔍 Analyzing resume with AI...\n")

    # Get the AI response
    response = ""
    for chunk in ollama.chat(model="mistral", messages=[{"role": "user", "content": prompt}], stream=True):
        message_content = chunk.get("message", {}).get("content", "")
        if message_content:
            response += message_content
            print(message_content, end="", flush=True)

    # Extract the score
    final_score = 0
    if "FINAL_SCORE:" in response:
        try:
            score_part = response.split("FINAL_SCORE:")[1].strip()
            final_score = int(score_part.split("/")[0].strip())
            print(f"\n\n✨ Final Score: {final_score}/100")
        except (ValueError, IndexError):
            print("\n⚠️ Could not extract score - setting to 0")
    else:
        print("\n⚠️ No score found in response")

    # Save candidate if score meets threshold
    if final_score >= MINIMUM_SCORE:
        evaluation_data = {
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "candidate_name": candidate_name,
            "candidate_email": candidate_email,
            "job_title": job_requirements.get('jobTitle', 'N/A'),
            "score": final_score,
            "evaluation": response.replace('\n', ' | ')
        }

        try:
            file_exists = os.path.exists(evaluation_results_file)
            with open(evaluation_results_file, "a", encoding="utf-8") as f:
                if not file_exists:
                    f.write("Timestamp,Name,Email,Job Title,Score,Evaluation\n")
                f.write(
                    f'"{evaluation_data["timestamp"]}",'
                    f'"{evaluation_data["candidate_name"]}",'
                    f'"{evaluation_data["candidate_email"]}",'
                    f'"{evaluation_data["job_title"]}",'
                    f'{evaluation_data["score"]},"\n'
                )
            print(f"\n✅ Saved candidate to {evaluation_results_file}")
        except Exception as e:
            print(f"\n❌ Error saving results: {str(e)}")

    # Cleanup
    for file_path in [processed_resume_file, alternate_resume_file]:
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as e:
                print(f"⚠️ Could not delete {file_path}: {str(e)}")

except Exception as e:
    print(f"\n❌ Error: {str(e)}")