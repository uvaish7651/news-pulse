const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema(
    {
        articleId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        summary: {
            type: String,
            default: "",
        },

        content: {
            type: String,
            default: "",
        },

        url: {
            type: String,
            required: true,
        },

        source: {
            type: String,
            required: true,
            index: true,
        },

        publishedAt: {
            type: Date,
            default: null,
            index: true,
        },

        clusterId: {
            type: String,
            default: null,
            index: true,
        },

        clusterLabel: {
            type: String,
            default: "General News",
        },
    },
    {
        timestamps: true,
    }
);

const Article = mongoose.model("Article", articleSchema);

module.exports = Article;