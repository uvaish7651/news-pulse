import trafilatura


def extract_article(url):
    """
    Fetch an article webpage and extract its main article text.

    Args:
        url (str): Original article URL.

    Returns:
        str | None: Extracted article text, or None if extraction fails.
    """

    if not url:
        return None

    try:
        # Download the webpage
        downloaded = trafilatura.fetch_url(url)

        if not downloaded:
            print(f"[WARNING] Could not download article: {url}")
            return None

        # Extract the main article content
        article_text = trafilatura.extract(
            downloaded,
            include_comments=False,
            include_tables=False,
            include_links=False,
            favor_precision=True,
        )

        if not article_text:
            print(f"[WARNING] Could not extract article text: {url}")
            return None

        return article_text.strip()

    except Exception as error:
        # One failed article should never crash the complete pipeline
        print(f"[ERROR] Article extraction failed for {url}")
        print(f"       Reason: {error}")
        return None