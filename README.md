# News Pulse — Topic-Clustered News Timeline

News Pulse is a full-stack news aggregation application that collects news articles from multiple RSS feeds, extracts article content, normalizes and deduplicates the data, groups related articles into topic clusters, stores the results in MongoDB, and displays them through an interactive visual timeline.

---

## Features

- Multiple RSS news sources
- RSS field normalization
- Publication date normalization
- Article body extraction
- HTML cleanup
- Duplicate article detection
- Stale article filtering
- TF-IDF based topic clustering
- Cosine similarity based grouping
- Automatic topic labels
- MongoDB persistence
- Node.js + Express REST API
- Asynchronous Python ingestion
- Ingestion job status polling
- Next.js visual timeline
- Source filtering
- Cluster detail pages
- Original article links
- Refresh Data functionality
- Error handling
- Environment variable configuration

---

# Tech Stack

## Scraper

- Python
- Feedparser
- Requests
- Trafilatura
- BeautifulSoup
- Scikit-learn
- PyMongo
- Python-dotenv

## Backend

- Node.js
- Express.js
- Mongoose
- MongoDB

## Frontend

- Next.js
- React
- Tailwind CSS

## Database

- MongoDB Atlas

---

# Project Structure

```text
news-pulse/
│
├── scraper/
│   ├── article_extractor.py
│   ├── clusterer.py
│   ├── database.py
│   ├── deduplicator.py
│   ├── normalizer.py
│   ├── pipeline.py
│   ├── rss_parser.py
│   ├── requirements.txt
│   ├── .env
│   └── venv/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── controllers/
│   │   │   ├── clusterController.js
│   │   │   ├── timelineController.js
│   │   │   └── ingestController.js
│   │   ├── models/
│   │   │   └── Article.js
│   │   ├── routes/
│   │   │   ├── clusterRoutes.js
│   │   │   ├── timelineRoutes.js
│   │   │   └── ingestRoutes.js
│   │   └── services/
│   │       ├── clusterService.js
│   │       ├── timelineService.js
│   │       └── ingestService.js
│   │
│   ├── .env
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
│
├── frontend/
│   ├── app/
│   │   ├── clusters/
│   │   │   └── [id]/
│   │   │       └── page.js
│   │   ├── page.js
│   │   └── ...
│   │
│   ├── lib/
│   │   └── api.js
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md