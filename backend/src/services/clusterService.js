const Article = require("../models/Article");

/**
 * Get all news clusters.
 *
 * Each cluster contains:
 * - clusterId
 * - clusterLabel
 * - articleCount
 * - latestPublishedAt
 * - articles
 */
const getAllClusters = async () => {
    const articles = await Article.find({})
        .sort({ publishedAt: -1 })
        .lean();

    const clusterMap = new Map();

    for (const article of articles) {
        const clusterId = article.clusterId || "cluster-general";

        if (!clusterMap.has(clusterId)) {
            clusterMap.set(clusterId, {
                clusterId,
                clusterLabel:
                    article.clusterLabel || "General News",
                articleCount: 0,
                latestPublishedAt: article.publishedAt,
                articles: [],
            });
        }

        const cluster = clusterMap.get(clusterId);

        cluster.articleCount += 1;

        if (
            article.publishedAt &&
            (!cluster.latestPublishedAt ||
                article.publishedAt > cluster.latestPublishedAt)
        ) {
            cluster.latestPublishedAt = article.publishedAt;
        }

        cluster.articles.push({
            articleId: article.articleId,
            title: article.title,
            source: article.source,
            publishedAt: article.publishedAt,
            url: article.url,
        });
    }

    return Array.from(clusterMap.values());
};


/**
 * Get one specific cluster by cluster ID.
 */
const getClusterById = async (clusterId) => {
    const articles = await Article.find({
        clusterId,
    })
        .sort({ publishedAt: -1 })
        .lean();

    if (articles.length === 0) {
        return null;
    }

    return {
        clusterId,
        clusterLabel:
            articles[0].clusterLabel || "General News",

        articleCount: articles.length,

        articles: articles.map((article) => ({
            articleId: article.articleId,
            title: article.title,
            summary: article.summary,
            source: article.source,
            publishedAt: article.publishedAt,
            url: article.url,
        })),
    };
};


module.exports = {
    getAllClusters,
    getClusterById,
};