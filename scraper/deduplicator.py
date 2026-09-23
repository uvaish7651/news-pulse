import hashlib
from typing import Dict, List


def generate_article_id(article: Dict) -> str:
    """
    Generate a stable unique ID for an article.

    The article URL is used as the primary identity.
    If the URL is unavailable, title + source + publishedAt
    are used as a fallback.
    """

    url = article.get("url", "").strip()

    if url:
        identity = url
    else:
        identity = (
            f"{article.get('source', '').strip()}|"
            f"{article.get('title', '').strip()}|"
            f"{article.get('publishedAt', '')}"
        )

    return hashlib.sha256(
        identity.encode("utf-8")
    ).hexdigest()


def deduplicate_articles(articles: List[Dict]) -> List[Dict]:
    """
    Remove duplicate articles from the current article list.

    Two articles are considered duplicates when they generate
    the same article ID.
    """

    unique_articles = []
    seen_ids = set()

    for article in articles:

        article_id = generate_article_id(article)

        # Skip duplicate article
        if article_id in seen_ids:
            continue

        # Add stable ID to article
        article["articleId"] = article_id

        seen_ids.add(article_id)
        unique_articles.append(article)

    return unique_articles