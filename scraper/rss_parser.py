import feedparser
import requests
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime

from article_extractor import extract_article


RSS_FEEDS = {
    "BBC": "https://feeds.bbci.co.uk/news/rss.xml",
    "NPR": "https://feeds.npr.org/1001/rss.xml",
    "The Guardian": "https://www.theguardian.com/world/rss",
}


def parse_date(entry):
    """
    Convert different RSS date formats into a consistent ISO timestamp.
    """

    if getattr(entry, "published_parsed", None):
        try:
            dt = datetime(
                *entry.published_parsed[:6],
                tzinfo=timezone.utc
            )

            return dt.isoformat()

        except Exception:
            pass

    raw_date = (
        entry.get("published")
        or entry.get("pubDate")
        or entry.get("updated")
    )

    if raw_date:
        try:
            dt = parsedate_to_datetime(raw_date)

            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)

            return dt.astimezone(timezone.utc).isoformat()

        except Exception:
            pass

    return None


def get_summary(entry):
    """
    RSS feeds may use different fields for article summaries.
    """

    summary = (
        entry.get("summary")
        or entry.get("description")
        or ""
    )

    # Some RSS feeds store content inside a content list
    if not summary:
        content = entry.get("content", [])

        if content:
            summary = content[0].get("value", "")

    return summary.strip()


def fetch_feed(source_name, feed_url):
    """
    Fetch and process articles from one RSS feed.
    """

    print(f"\nFetching {source_name}...")

    try:
        response = requests.get(
            feed_url,
            timeout=15,
            headers={
                "User-Agent": "NewsPulse/1.0"
            }
        )

        response.raise_for_status()

        feed = feedparser.parse(response.content)

        articles = []

        for entry in feed.entries:

            title = entry.get("title", "").strip()
            url = entry.get("link", "").strip()

            if not title or not url:
                continue

            summary = get_summary(entry)

            print(f"\nExtracting: {title}")

            article_text = extract_article(url)

            article = {
                "title": title,
                "summary": summary,
                "content": article_text,
                "url": url,
                "source": source_name,
                "publishedAt": parse_date(entry),
            }

            articles.append(article)

        print(
            f"\nFound {len(articles)} articles from {source_name}"
        )

        return articles

    except requests.RequestException as error:
        print(
            f"[ERROR] Request failed for {source_name}: {error}"
        )

        return []

    except Exception as error:
        print(
            f"[ERROR] Failed to process {source_name}: {error}"
        )

        return []


def fetch_all_feeds():
    """
    Fetch articles from all configured RSS feeds.
    """

    all_articles = []

    for source_name, feed_url in RSS_FEEDS.items():

        articles = fetch_feed(
            source_name,
            feed_url
        )

        all_articles.extend(articles)

    return all_articles


if __name__ == "__main__":

    articles = fetch_all_feeds()

    print("\n" + "=" * 60)
    print(f"TOTAL ARTICLES: {len(articles)}")
    print("=" * 60)

    successful = 0
    failed = 0

    for index, article in enumerate(articles[:10], start=1):

        print(f"\n{index}. {article['title']}")
        print(f"   Source: {article['source']}")
        print(f"   Published: {article['publishedAt']}")
        print(f"   URL: {article['url']}")

        if article["content"]:
            successful += 1

            print(
                f"   Content: "
                f"{len(article['content'])} characters"
            )

        else:
            failed += 1

            print("   Content: Extraction failed")

    print("\n" + "=" * 60)
    print(f"CONTENT EXTRACTION SUCCESS: {successful}")
    print(f"CONTENT EXTRACTION FAILED: {failed}")
    print("=" * 60)