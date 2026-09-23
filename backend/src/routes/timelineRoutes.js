const express = require("express");

const {
    getTimelineData,
} = require("../controllers/timelineController");


const router = express.Router();

router.get("/", getTimelineData);


module.exports = router;