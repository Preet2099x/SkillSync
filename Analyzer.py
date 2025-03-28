import os
import ollama

# Enable GPU acceleration for Ollama
os.environ["OLLAMA_ACCELERATE"] = "1"

# Path to the extracted resume text
resume_file = "resume_raw_text.txt"

try:
    # Read the resume text file
    with open(resume_file, "r", encoding="utf-8") as file:
        resume_text = file.read().strip()

    # Handle empty files
    if not resume_text:
        print("⚠️ Resume text is empty. Please check the extracted file.")
        exit()

    # AI Prompt
    prompt = f"""You are a highly experienced recruiter specializing in frontend development.
    Given the following resume text, evaluate the candidate's suitability for a frontend developer role.
    
    Resume:
    {resume_text}

    Provide a structured evaluation based on:
    - **Technical skills** (HTML, CSS, JavaScript, React, etc.)
    - **Experience & projects** (notable contributions, real-world work)
    - **UI/UX understanding** (design principles, user experience focus)
    - **Code quality & best practices** (clean code, modern methodologies)
    - **Industry relevance** (alignment with frontend industry standards)

    Format your response as:
    **Strengths:**
    - ...

    **Weaknesses:**
    - ...

    **Final Score:** X/100
    """

    print("\n🔍 Analyzing resume with AI...\n")

    # Stream the AI response
    response = ""
    for chunk in ollama.chat(model="mistral", messages=[{"role": "user", "content": prompt}], stream=True):
        message_content = chunk.get("message", {}).get("content", "")
        if message_content:
            response += message_content
            print(message_content, end="", flush=True)

    print("\n" + "-" * 50)  # Separator for clarity

except FileNotFoundError:
    print("❌ Error: Resume file 'resume_text.txt' not found. Please run the extraction step first.")
except Exception as e:
    print(f"\n❌ Unexpected Error: {str(e)}")
