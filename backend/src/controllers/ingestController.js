const {
    startIngestion,
    getIngestionStatus,
} = require("../services/ingestService");


/**
 * POST /ingest/trigger
 *
 * Start a new Python ingestion job.
 */
const triggerIngestion = async (req, res) => {
    try {

        const jobId = startIngestion();

        res.status(202).json({
            success: true,
            message: "Ingestion job started",
            jobId,
            status: "running",
        });

    } catch (error) {

        console.error(
            "Failed to start ingestion:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to start ingestion job",
        });
    }
};


/**
 * GET /ingest/status/:jobId
 *
 * Return the current status of an ingestion job.
 */
const getIngestionJobStatus = async (req, res) => {
    try {

        const { jobId } = req.params;

        const job = getIngestionStatus(jobId);


        if (!job) {

            return res.status(404).json({
                success: false,
                message: "Ingestion job not found",
            });
        }


        res.status(200).json({
            success: true,
            job,
        });

    } catch (error) {

        console.error(
            "Failed to get ingestion status:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to get ingestion status",
        });
    }
};


module.exports = {
    triggerIngestion,
    getIngestionJobStatus,
};