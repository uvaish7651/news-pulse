import re
from collections import defaultdict

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

SIMILARITY_THRESHOLD = 0.25


def clean_text(text):
    """
    Clean article text before TF-IDF processing.
    """

    if not text:
        return ""

    text = text.lower()

    # Remove URLs
    text = re.sub(r"https?://\S+", " ", text)

    # Keep only letters and numbers
    text = re.sub(r"[^a-z0-9\s]", " ", text)

    # Remove extra spaces
    text = " ".join(text.split())

    return text


def build_article_text(article):
    """
    Build the text used for clustering.

    Title gets more importance because it is usually
    more topic-specific than the full article body.
    """

    title = article.get("title", "")
    summary = article.get("summary", "")
    content = article.get("content", "")

    return clean_text(
        f"{title} {title} {title} {summary} {content}"
    )


def generate_cluster_label(articles):
    """
    Generate a simple human-readable label for a cluster.

    The label is based on the most common important
    words appearing in article titles.
    """

    if not articles:
        return "General News"

    text = " ".join(
        article.get("title", "")
        for article in articles
    )

    words = re.findall(r"[a-zA-Z]{4,}", text.lower())

    stop_words = {
        "about",
        "after",
        "before",
        "being",
        "could",
        "their",
        "there",
        "these",
        "those",
        "which",
        "while",
        "would",
        "from",
        "with",
        "that",
        "this",
        "have",
        "will",
        "into",
        "over",
        "says",
        "said",
        "news",
        "more",
        "than",
    }

    word_counts = defaultdict(int)

    for word in words:

        if word in stop_words:
            continue

        word_counts[word] += 1

    if not word_counts:
        return "General News"

    top_words = sorted(
        word_counts.items(),
        key=lambda item: item[1],
        reverse=True
    )[:3]

    label = " / ".join(
        word.title()
        for word, count in top_words
    )

    return label


def cluster_articles(articles):
    """
    Group similar articles using TF-IDF and cosine similarity.

    Returns:
        List of articles with clusterId and clusterLabel.
    """

    if not articles:
        return []

    if len(articles) == 1:

        articles[0]["clusterId"] = "cluster-1"
        articles[0]["clusterLabel"] = (
            generate_cluster_label(articles)
        )

        return articles

    documents = [
        build_article_text(article)
        for article in articles
    ]

    # TF-IDF converts article text into numerical vectors.
    vectorizer = TfidfVectorizer(
        stop_words="english",
        max_df=0.95,
        min_df=1,
        ngram_range=(1, 2),
    )

    try:

        tfidf_matrix = vectorizer.fit_transform(
            documents
        )

    except ValueError:

        # If there is not enough valid text,
        # put all articles into one cluster.
        cluster_label = generate_cluster_label(
            articles
        )

        for article in articles:
            article["clusterId"] = "cluster-1"
            article["clusterLabel"] = cluster_label

        return articles

    # Calculate similarity between every pair of articles.
    similarity_matrix = cosine_similarity(
        tfidf_matrix
    )

    visited = set()
    clusters = []

    for index in range(len(articles)):

        if index in visited:
            continue

        current_cluster = [index]

        visited.add(index)

        for other_index in range(len(articles)):

            if other_index in visited:
                continue

            similarity = similarity_matrix[
                index,
                other_index
            ]

            if similarity >= SIMILARITY_THRESHOLD:

                current_cluster.append(
                    other_index
                )

                visited.add(other_index)

        clusters.append(current_cluster)

    # Assign cluster IDs and labels.
    for cluster_number, cluster_indexes in enumerate(
        clusters,
        start=1
    ):

        cluster_articles_list = [
            articles[index]
            for index in cluster_indexes
        ]

        cluster_id = f"cluster-{cluster_number}"

        cluster_label = generate_cluster_label(
            cluster_articles_list
        )

        for article in cluster_articles_list:

            article["clusterId"] = cluster_id

            article["clusterLabel"] = cluster_label

    print(
        f"\nCreated {len(clusters)} news clusters."
    )

    return articles


if __name__ == "__main__":

    print(
        "Clusterer module loaded successfully."
    )

    print(
        f"Similarity threshold: "
        f"{SIMILARITY_THRESHOLD}"
    )