const fs = require('fs').promises;
const pdf = require('pdf-parse');
const natural = require('natural');
const path = require('path');

async function extractTextFromResume(filePath) {
    try {
        // Read the PDF file
        const dataBuffer = await fs.readFile(filePath);

        // Extract text from the PDF
        const data = await pdf(dataBuffer);

        // Return the extracted text after trimming whitespace
        return data.text.trim();
    } catch (err) {
        console.error("❌ Error reading or parsing the resume file:", err.message);
        return null;
    }
}

function processResumeText(text) {
    if (!text) return "No text to process.";

    // Tokenize the text into individual words
    const tokenizer = new natural.WordTokenizer();
    let tokens = tokenizer.tokenize(text);

    // Remove common English stopwords
    const stopwords = new Set(natural.stopwords);
    tokens = tokens.filter((word) => !stopwords.has(word.toLowerCase()));

    // Apply stemming (reducing words to their root form)
    const stemmer = natural.PorterStemmer;
    tokens = tokens.map((word) => stemmer.stem(word));

    // Join the processed words into a cleaned-up text string
    return tokens.join(" ");
}

async function main() {
    // Set the default resume file path to 'resume1.pdf' in the same folder
    const resumeFilePath = process.argv[2] || path.join(__dirname, "resume1.pdf");

    // Extract text from the resume
    const resumeText = await extractTextFromResume(resumeFilePath);

    if (resumeText) {
        console.log("\n📝 Extracted Text from Resume:\n------------------------------------");
        console.log(resumeText.slice(0, 500) + (resumeText.length > 500 ? "...\n[Truncated]" : ""));

        // Process the extracted text
        const processedText = processResumeText(resumeText);

        // Define output file paths
        const outputRawPath = path.join(__dirname, "resume_raw_text.txt");
        const outputProcessedPath = path.join(__dirname, "resume_processed_text.txt");

        try {
            // Save raw and processed text to files
            await fs.writeFile(outputRawPath, resumeText, "utf-8");
            await fs.writeFile(outputProcessedPath, processedText, "utf-8");

            console.log(`✅ Raw resume text saved to: ${outputRawPath}`);
            console.log(`✅ Processed resume text saved to: ${outputProcessedPath}`);
        } catch (err) {
            console.error("❌ Error saving processed text:", err.message);
        }
    } else {
        console.log("⚠️ No text extracted from the resume file.");
    }
}

// Run the script
main();
