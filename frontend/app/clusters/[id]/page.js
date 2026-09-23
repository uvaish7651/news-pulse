"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getClusterById } from "../../../lib/api";

export default function ClusterDetailPage({ params }) {
    const [cluster, setCluster] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [clusterId, setClusterId] = useState("");

    useEffect(() => {
        const loadCluster = async () => {
            try {
                const resolvedParams = await params;
                const id = resolvedParams.id;

                setClusterId(id);

                const data = await getClusterById(id);

                setCluster(data.cluster);
            } catch (error) {
                console.error(error);
                setError("Failed to load cluster");
            } finally {
                setLoading(false);
            }
        };

        loadCluster();
    }, [params]);

    return (
        <main className="min-h-screen bg-slate-950 text-white">

            {/* Header */}
            <header className="border-b border-white/10">
                <div className="mx-auto max-w-6xl px-6 py-5">

                    <Link
                        href="/"
                        className="text-sm text-blue-400 hover:text-blue-300"
                    >
                        ← Back to Timeline
                    </Link>

                </div>
            </header>

            <section className="mx-auto max-w-6xl px-6 py-10">

                {/* Loading */}
                {loading && (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
                        <p className="text-slate-400">
                            Loading cluster...
                        </p>
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-300">
                        {error}
                    </div>
                )}

                {/* Cluster */}
                {!loading && !error && cluster && (
                    <>
                        {/* Cluster Header */}
                        <div className="mb-10">

                            <p className="text-sm uppercase tracking-[0.2em] text-blue-400">
                                Topic Cluster
                            </p>

                            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
                                {cluster.clusterLabel}
                            </h1>

                            <p className="mt-4 text-slate-400">
                                {cluster.articleCount} articles
                                grouped under this topic.
                            </p>

                            <p className="mt-2 text-xs text-slate-600">
                                Cluster ID: {clusterId}
                            </p>

                        </div>

                        {/* Articles */}
                        <div className="space-y-5">

                            {cluster.articles.map((article) => (
                                <article
                                    key={article.articleId}
                                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-blue-400/30 hover:bg-white/[0.06]"
                                >

                                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">

                                        <span className="rounded-full bg-blue-500/10 px-3 py-1 text-blue-300">
                                            {article.source}
                                        </span>

                                        {article.publishedAt && (
                                            <span>
                                                {new Date(
                                                    article.publishedAt
                                                ).toLocaleString()}
                                            </span>
                                        )}

                                    </div>

                                    <h2 className="mt-4 text-xl font-semibold leading-snug">
                                        {article.title}
                                    </h2>

                                    {article.summary && (
                                        <p className="mt-3 leading-7 text-slate-400">
                                            {article.summary}
                                        </p>
                                    )}

                                    <div className="mt-5">

                                        <a
                                            href={article.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-400"
                                        >
                                            Read Original Article →
                                        </a>

                                    </div>

                                </article>
                            ))}

                        </div>
                    </>
                )}

            </section>

        </main>
    );
}