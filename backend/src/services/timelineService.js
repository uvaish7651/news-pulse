const Article = require("../models/Article");

const getTimeline = async () => {
    const articles = await Article.find({
        publishedAt: {
            $ne: null,
        },
    })
        .sort({
            publishedAt: 1,
        })
        .lean();

    if (articles.length === 0) {
        return [];
    }

    const timelineMap = new Map();

    for (const article of articles) {
        const clusterId =
            article.clusterId || "cluster-general";

        if (!timelineMap.has(clusterId)) {
            timelineMap.set(clusterId, {
                clusterId,
                clusterLabel:
                    article.clusterLabel ||
                    "General News",

                start: article.publishedAt,
                end: article.publishedAt,

                articleCount: 0,
                intensity: 0,

                sources: new Set(),
            });
        }

        const timelineItem =
            timelineMap.get(clusterId);

        timelineItem.articleCount += 1;

        if (article.source) {
            timelineItem.sources.add(
                article.source
            );
        }

        if (
            article.publishedAt <
            timelineItem.start
        ) {
            timelineItem.start =
                article.publishedAt;
        }

        if (
            article.publishedAt >
            timelineItem.end
        ) {
            timelineItem.end =
                article.publishedAt;
        }

        timelineItem.intensity =
            timelineItem.articleCount;
    }

    const timeline = Array.from(
        timelineMap.values()
    ).map((item) => ({
        ...item,
        sources: Array.from(item.sources),
    }));

    return timeline.sort(
        (a, b) =>
            new Date(a.start) -
            new Date(b.start)
    );
};

module.exports = {
    getTimeline,
};