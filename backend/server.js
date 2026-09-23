const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./src/config/db");

const clusterRoutes = require("./src/routes/clusterRoutes");
const timelineRoutes = require("./src/routes/timelineRoutes");
const ingestRoutes = require("./src/routes/ingestRoutes");


// --------------------------------------------------
// Load environment variables
// --------------------------------------------------

dotenv.config();


// --------------------------------------------------
// Create Express app
// --------------------------------------------------

const app = express();

const PORT = process.env.PORT || 5000;


// --------------------------------------------------
// Middleware
// --------------------------------------------------

app.use(
    cors({
        origin: "*",
    })
);

app.use(express.json());


// --------------------------------------------------
// Health Check
// --------------------------------------------------

app.get("/", (req, res) => {

    res.status(200).json({
        success: true,
        message: "News Pulse API is running",
    });

});


// --------------------------------------------------
// API Routes
// --------------------------------------------------

app.use(
    "/clusters",
    clusterRoutes
);

app.use(
    "/timeline",
    timelineRoutes
);

app.use(
    "/ingest",
    ingestRoutes
);


// --------------------------------------------------
// 404 Handler
// --------------------------------------------------

app.use((req, res) => {

    res.status(404).json({
        success: false,
        message: "Route not found",
    });

});


// --------------------------------------------------
// Global Error Handler
// --------------------------------------------------

app.use((error, req, res, next) => {

    console.error(
        "Server error:",
        error.message
    );

    res.status(500).json({
        success: false,
        message: "Internal server error",
    });

});


// --------------------------------------------------
// Start Server
// --------------------------------------------------

const startServer = async () => {

    try {

        await connectDB();

        app.listen(
            PORT,
            () => {

                console.log(
                    "================================="
                );

                console.log(
                    `News Pulse API running on port ${PORT}`
                );

                console.log(
                    `http://localhost:${PORT}`
                );

                console.log(
                    "================================="
                );

            }
        );

    } catch (error) {

        console.error(
            "Failed to start server:",
            error.message
        );

        process.exit(1);
    }
};


startServer();