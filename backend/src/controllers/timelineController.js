const {
    getTimeline,
} = require("../services/timelineService");



const getTimelineData = async (req, res) => {
    try {

        const timeline = await getTimeline();

        res.status(200).json({
            success: true,
            count: timeline.length,
            timeline,
        });

    } catch (error) {

        console.error(
            "Error fetching timeline:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch timeline",
        });
    }
};


module.exports = {
    getTimelineData,
};