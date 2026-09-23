from datetime import datetime, timezone, timedelta
from typing import Dict, Optional

from bs4 import BeautifulSoup


# Keep only reasonably recent news articles.
# This prevents old/stale RSS entries from entering the timeline.
MAX_ARTICLE_AGE_DAYS = 30


def normalize_text(value: Optional[str]) -> str:
    """
    Clean text and remove HTML tags.
    """

    if not value:
        return ""

    soup = BeautifulSoup(str(value), "html.parser")
    text = soup.get_text(" ", strip=True)

    return " ".join(text.split()).strip()


def normalize_published_at(
    value: Optional[str]
) -> Optional[str]:
    """
    Normalize published date to UTC ISO format.
    """

    if not value:
        return None

    try:
        datetime_value = datetime.fromisoformat(
            value.replace("Z", "+00:00")
        )

        if datetime_value.tzinfo is None:
            datetime_value = datetime_value.replace(
                tzinfo=timezone.utc
            )

        return datetime_value.astimezone(
            timezone.utc
        ).isoformat()

    except (ValueError, TypeError):
        return None


def is_recent_article(published_at: Optional[str]) -> bool:
    """
    Return True if the article was published within
    the configured recent-news window.
    """

    if not published_at:
        return False

    try:
        published_datetime = datetime.fromisoformat(
            published_at.replace("Z", "+00:00")
        )

        if published_datetime.tzinfo is None:
            published_datetime = published_datetime.replace(
                tzinfo=timezone.utc
            )

        cutoff_datetime = (
            datetime.now(timezone.utc)
            - timedelta(days=MAX_ARTICLE_AGE_DAYS)
        )

        return published_datetime >= cutoff_datetime

    except (ValueError, TypeError):
        return False


def normalize_article(article: Dict) -> Dict:
    """
    Normalize one article.

    Text fields are cleaned with BeautifulSoup.
    URL and articleId are kept as plain strings.
    """

    normalized_article = {
        "articleId": str(
            article.get("articleId") or ""
        ).strip(),

        "title": normalize_text(
            article.get("title")
        ),

        "summary": normalize_text(
            article.get("summary")
        ),

        "content": normalize_text(
            article.get("content")
        ),

        "url": str(
            article.get("url") or ""
        ).strip(),

        "source": normalize_text(
            article.get("source")
        ),

        "publishedAt": normalize_published_at(
            article.get("publishedAt")
        ),
    }

    return normalized_article


def normalize_articles(articles):
    """
    Normalize, validate and filter articles.
    """

    normalized_articles = []

    for article in articles:
        normalized_article = normalize_article(article)

        # Required fields
        if not normalized_article["title"]:
            continue

        if not normalized_article["url"]:
            continue

        if not normalized_article["source"]:
            continue

        # Ignore articles without a valid publication date
        if not normalized_article["publishedAt"]:
            continue

        # Ignore stale RSS articles
        if not is_recent_article(
            normalized_article["publishedAt"]
        ):
            print(
                f"[SKIPPED OLD ARTICLE] "
                f"{normalized_article['title']} | "
                f"{normalized_article['publishedAt']}"
            )
            continue

        normalized_articles.append(
            normalized_article
        )

    return normalized_articles