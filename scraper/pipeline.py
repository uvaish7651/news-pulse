from rss_parser import fetch_all_feeds
from deduplicator import deduplicate_articles
from normalizer import normalize_articles
from clusterer import cluster_articles

from database import (
    test_database_connection,
    create_indexes,
    save_articles,
)


def run_pipeline():
    """
    Run the complete News Pulse ingestion pipeline.

    Steps:
    1. Connect to MongoDB
    2. Fetch articles from RSS feeds
    3. Remove duplicates
    4. Normalize article data
    5. Group articles into topic clusters
    6. Create MongoDB indexes
    7. Save articles to MongoDB
    """

    print("\n" + "=" * 60)
    print("NEWS PULSE - INGESTION PIPELINE")
    print("=" * 60)


    print("\n[1/7] Connecting to MongoDB...")

    if not test_database_connection():
        print("\nMongoDB connection failed.")
        print("Pipeline stopped.")
        return []

    print("MongoDB connection successful.")



    print("\n[2/7] Fetching articles from RSS feeds...")

    articles = fetch_all_feeds()

    print(
        f"Fetched {len(articles)} unique articles."
    )

    if not articles:
        print("\nNo articles were fetched.")
        return []



    print("\n[3/7] Removing duplicate articles...")

    unique_articles = deduplicate_articles(
        articles
    )

    print(
        f"Articles after deduplication: "
        f"{len(unique_articles)}"
    )



    print("\n[4/7] Normalizing article data...")

    normalized_articles = normalize_articles(
        unique_articles
    )

    print(
        f"Normalized articles: "
        f"{len(normalized_articles)}"
    )


    print("\n[5/7] Grouping articles into topics...")

    clustered_articles = cluster_articles(
        normalized_articles
    )

    # Count clusters
    cluster_ids = {
        article.get("clusterId")
        for article in clustered_articles
        if article.get("clusterId")
    }

    print(
        f"Created {len(cluster_ids)} topic clusters."
    )

 
    print("\n[6/7] Creating MongoDB indexes...")

    create_indexes()


    print("\n[7/7] Saving articles to MongoDB...")

    saved_count = save_articles(
        clustered_articles
    )

    print(
        f"New articles saved: {saved_count}"
    )


    print("\n" + "=" * 60)
    print("PIPELINE COMPLETED SUCCESSFULLY")
    print("=" * 60)

    return clustered_articles


if __name__ == "__main__":

    articles = run_pipeline()

    print("\nSample article:")

    if articles:

        sample = articles[0]

        print("\nTitle:")
        print(sample["title"])

        print("\nSource:")
        print(sample["source"])

        print("\nPublished:")
        print(sample["publishedAt"])

        print("\nCluster ID:")
        print(sample["clusterId"])

        print("\nCluster Label:")
        print(sample["clusterLabel"])

        print("\nURL:")
        print(sample["url"])

        print("\nContent length:")
        print(
            len(sample["content"])
            if sample["content"]
            else 0
        )

    else:

        print("No articles available.")