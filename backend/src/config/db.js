const dns = require("dns");
const mongoose = require("mongoose");

dns.setServers([
    "1.1.1.1",
    "8.8.8.8",
]);

const connectDB = async () => {
    try {
        console.log("MongoDB URI exists:", !!process.env.MONGODB_URI);

        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
        });

       
        console.log("MongoDB connected successfully");
        console.log("Database: news_pulse");
       

    } catch (error) {

        console.error("MongoDB connection failed:");
        console.error(error);

        throw error;
    }
};

module.exports = connectDB;