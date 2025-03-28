const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create a readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Helper function to prompt user and get input
function promptUser(query) {
    return new Promise(resolve => {
        rl.question(query, answer => resolve(answer));
    });
}

async function main() {
    try {
        console.log("Enter Job Requirement Details:");

        // Prompt the user for job details
        const jobTitle = await promptUser("Job Title: ");
        const description = await promptUser("Job Description: ");
        const skills = await promptUser("Required Skills (comma separated): ");
        const experience = await promptUser("Required Experience (years): ");

        // Create a job requirement object
        const jobRequirement = {
            jobTitle: jobTitle.trim(),
            description: description.trim(),
            skills: skills.split(',').map(skill => skill.trim()),
            experience: experience.trim()
        };

        // Define output file path
        const outputFilePath = path.join(__dirname, "jobRequirement.json");

        // Write job requirement data to a JSON file
        fs.writeFileSync(outputFilePath, JSON.stringify(jobRequirement, null, 2));
        console.log(`\n✅ Job requirement saved to ${outputFilePath}`);
    } catch (error) {
        console.error("❌ Error saving job requirement:", error.message);
    } finally {
        rl.close();
    }
}

// Run the main function
main();
