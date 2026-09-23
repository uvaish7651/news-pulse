const express = require("express");

const {
    triggerIngestion,
    getIngestionJobStatus,
} = require("../controllers/ingestController");


const router = express.Router();

router.post("/trigger", triggerIngestion);


router.get(
    "/status/:jobId",
    getIngestionJobStatus
);


module.exports = router;