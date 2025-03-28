const { exec } = require("child_process");

// Helper function to run a command sequentially
function runCommand(command) {
    return new Promise((resolve, reject) => {
        const process = exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ Error running ${command}:\n`, error);
                reject(error);
            } else {
                console.log(`✅ Completed: ${command}`);
                resolve(stdout);
            }
        });

        // Print real-time logs
        process.stdout.on("data", (data) => console.log(data.toString()));
        process.stderr.on("data", (data) => console.error(data.toString()));
    });
}

// Run scripts sequentially
(async () => {
    try {
        console.log("🚀 Server started... Running files sequentially.");

        await runCommand("node TextExtractor.js");  // Run text extraction
        console.log("⏳ Extracting text from resume...");

        await runCommand("node JobRequirment.js");  // Run job requirements
        console.log("📄 Job requirements processed.");

        await runCommand("python Analyzer.py");  // Run the analyzer
        console.log("🔍 Running AI analysis...");

        console.log("✅ All tasks completed!");
    } catch (err) {
        console.error("❌ Server encountered an error:", err);
    }
})();
