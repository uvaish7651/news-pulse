const { spawn } = require("child_process");
const path = require("path");
const crypto = require("crypto");

const jobs = new Map();

const generateJobId = () => {
    return crypto.randomUUID();
};

const startIngestion = () => {
    const jobId = generateJobId();

    jobs.set(jobId, {
        jobId,
        status: "running",
        startedAt: new Date(),
        finishedAt: null,
        error: null,
    });

    const scraperPath = path.resolve(
        __dirname,
        "../../../scraper"
    );

    const pipelinePath = path.join(
        scraperPath,
        "pipeline.py"
    );

    // Windows virtual environment Python
    const pythonPath = path.join(
        scraperPath,
        "venv",
        "Scripts",
        "python.exe"
    );

    console.log(
        `[INGEST ${jobId}] Starting Python ingestion...`
    );

    console.log(
        `[INGEST ${jobId}] Python: ${pythonPath}`
    );

    console.log(
        `[INGEST ${jobId}] Pipeline: ${pipelinePath}`
    );

    const pythonProcess = spawn(
        pythonPath,
        [pipelinePath],
        {
            cwd: scraperPath,
            windowsHide: true,
        }
    );

    pythonProcess.stdout.on(
        "data",
        (data) => {
            console.log(
                `[INGEST ${jobId}] ${data.toString()}`
            );
        }
    );

    pythonProcess.stderr.on(
        "data",
        (data) => {
            console.error(
                `[INGEST ${jobId}] ${data.toString()}`
            );
        }
    );

    pythonProcess.on(
        "close",
        (code) => {
            const job = jobs.get(jobId);

            if (!job) {
                return;
            }

            job.finishedAt = new Date();

            if (code === 0) {
                job.status = "completed";

                console.log(
                    `[INGEST ${jobId}] Completed successfully`
                );
            } else {
                job.status = "failed";

                job.error =
                    `Python process exited with code ${code}`;

                console.error(
                    `[INGEST ${jobId}] Failed`
                );
            }
        }
    );

    pythonProcess.on(
        "error",
        (error) => {
            const job = jobs.get(jobId);

            if (!job) {
                return;
            }

            job.status = "failed";
            job.finishedAt = new Date();
            job.error = error.message;

            console.error(
                `[INGEST ${jobId}] Process error:`,
                error.message
            );
        }
    );

    return jobId;
};

const getIngestionStatus = (jobId) => {
    return jobs.get(jobId) || null;
};

module.exports = {
    startIngestion,
    getIngestionStatus,
};