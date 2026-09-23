import os

from dotenv import load_dotenv
from pymongo import MongoClient, ASCENDING
from pymongo.errors import ConnectionFailure


# Load .env
load_dotenv()


# MongoDB connection string
MONGODB_URI = os.getenv("MONGODB_URI")

if not MONGODB_URI:
    raise ValueError("MONGODB_URI is not set in .env")


# MongoDB client
client = MongoClient(MONGODB_URI)


# Database
db = client["news_pulse"]


# Collections
articles_collection = db["articles"]


def test_database_connection():
    """
    Test MongoDB connection.
    """

    try:
        client.admin.command("ping")

        print("============================================")
        print("MongoDB connection successful!")
        print("Database: news_pulse")
        print("Collection: articles")
        print("============================================")

        return True

    except ConnectionFailure as error:
        print("MongoDB connection failed!")
        print(f"Reason: {error}")

        return False


def create_indexes():
    """
    Create indexes required for efficient querying
    and duplicate prevention.
    """

    articles_collection.create_index(
        [("articleId", ASCENDING)],
        unique=True
    )

    articles_collection.create_index(
        [("publishedAt", ASCENDING)]
    )

    articles_collection.create_index(
        [("clusterId", ASCENDING)]
    )

    print("MongoDB indexes created successfully.")


def save_articles(articles):
    """
    Insert new articles into MongoDB.

    Existing articles are skipped using articleId.
    """

    if not articles:
        print("No articles to save.")
        return 0

    inserted_count = 0

    for article in articles:

        article_id = article.get("articleId")

        if not article_id:
            continue

        result = articles_collection.update_one(
            {"articleId": article_id},
            {"$setOnInsert": article},
            upsert=True
        )

        if result.upserted_id:
            inserted_count += 1

    print(f"New articles saved to MongoDB: {inserted_count}")

    return inserted_count


def get_all_articles():
    """
    Get all articles from MongoDB.
    """

    return list(
        articles_collection.find(
            {},
            {"_id": 0}
        )
    )


if __name__ == "__main__":

    if test_database_connection():
        create_indexes()