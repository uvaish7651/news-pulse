"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
    getTimeline,
    triggerIngestion,
    getIngestionStatus,
} from "../lib/api";

export default function Home() {
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedSource, setSelectedSource] =
        useState("All");

    const [refreshing, setRefreshing] = useState(false);
    const [refreshMessage, setRefreshMessage] =
        useState("");

    const loadTimeline = async () => {
        try {
            setError("");

            const data = await getTimeline();

            setTimeline(data.timeline || []);
        } catch (error) {
            console.error(error);
            setError("Failed to load timeline");
        }
    };

    useEffect(() => {
        const loadInitialTimeline = async () => {
            try {
                setLoading(true);
                await loadTimeline();
            } finally {
                setLoading(false);
            }
        };

        loadInitialTimeline();
    }, []);

    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            setRefreshMessage(
                "Fetching latest news..."
            );

            const data = await triggerIngestion();

            const jobId = data.jobId;

            if (!jobId) {
                throw new Error(
                    "No ingestion job ID received"
                );
            }

            setRefreshMessage(
                "Ingestion running..."
            );

            let status = "running";

            while (status === "running") {
                await new Promise((resolve) =>
                    setTimeout(resolve, 2000)
                );

                const statusData =
                    await getIngestionStatus(jobId);

                status = statusData.job?.status;

                if (status === "failed") {
                    throw new Error(
                        statusData.job?.error ||
                        "Ingestion failed"
                    );
                }
            }

            setRefreshMessage(
                "News updated successfully."
            );

            await loadTimeline();

        } catch (error) {
            console.error(error);

            setRefreshMessage(
                error.message ||
                "Failed to refresh news."
            );
        } finally {
            setRefreshing(false);
        }
    };

    const sources = useMemo(() => {
        const sourceSet = new Set();

        timeline.forEach((item) => {
            if (item.source) {
                sourceSet.add(item.source);
            }
        });

        return ["All", ...Array.from(sourceSet)];
    }, [timeline]);

    const filteredTimeline = timeline.filter(
        (item) => {
            if (selectedSource === "All") {
                return true;
            }

            return item.source === selectedSource;
        }
    );

    return (
        <main className="min-h-screen bg-slate-950 text-white">

            {/* Header */}
            <header className="border-b border-white/10 bg-slate-950/90">

                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            News Pulse
                        </h1>

                        <p className="mt-1 text-sm text-slate-400">
                            Topic-Clustered News Timeline
                        </p>
                    </div>

                    <div className="flex items-center gap-3">

                        <div className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300">
                            {timeline.length} clusters
                        </div>

                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="rounded-full bg-blue-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {refreshing
                                ? "Refreshing..."
                                : "Refresh Data"}
                        </button>

                    </div>

                </div>

            </header>

            {/* Main */}
            <section className="mx-auto max-w-7xl px-6 py-10">

                {/* Refresh Status */}
                {refreshMessage && (
                    <div className="mb-6 rounded-xl border border-blue-400/20 bg-blue-500/10 px-5 py-3 text-sm text-blue-300">
                        {refreshMessage}
                    </div>
                )}

                {/* Intro */}
                <div className="mb-10">

                    <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-blue-400">
                        Live News Intelligence
                    </p>

                    <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
                        What&apos;s happening in the news?
                    </h2>

                    <p className="mt-4 max-w-2xl text-slate-400">
                        News articles are automatically grouped
                        into related topics and displayed across
                        a visual timeline.
                    </p>

                </div>

                {/* Source Filter */}
                <div className="mb-8 flex flex-wrap gap-3">

                    {sources.map((source) => (
                        <button
                            key={source}
                            onClick={() =>
                                setSelectedSource(source)
                            }
                            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                                selectedSource === source
                                    ? "bg-blue-500 text-white"
                                    : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                            }`}
                        >
                            {source}
                        </button>
                    ))}

                </div>

                {/* Loading */}
                {loading && (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
                        <p className="text-slate-400">
                            Loading news timeline...
                        </p>
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-300">
                        {error}
                    </div>
                )}

                {/* Empty */}
                {!loading &&
                    !error &&
                    filteredTimeline.length === 0 && (
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
                            <p className="text-slate-400">
                                No timeline data available.
                            </p>
                        </div>
                    )}

                {/* Timeline */}
                {!loading &&
                    !error &&
                    filteredTimeline.length > 0 && (
                        <div className="relative">

                            {/* Timeline Line */}
                            <div className="absolute left-4 top-0 h-full w-px bg-white/10 sm:left-1/2" />

                            <div className="space-y-10">

                                {filteredTimeline.map(
                                    (item, index) => {

                                        const isLeft =
                                            index % 2 === 0;

                                        return (
                                            <div
                                                key={
                                                    item.clusterId
                                                }
                                                className="relative"
                                            >

                                                {/* Timeline Dot */}
                                                <div className="absolute left-4 top-6 z-10 h-3 w-3 -translate-x-1/2 rounded-full bg-blue-400 ring-4 ring-slate-950 sm:left-1/2" />

                                                <div
                                                    className={`w-full sm:flex ${
                                                        isLeft
                                                            ? "sm:justify-start"
                                                            : "sm:justify-end"
                                                    }`}
                                                >

                                                    <div className="ml-10 w-[calc(100%-2.5rem)] sm:ml-0 sm:w-[46%]">

                                                        <Link
                                                            href={`/clusters/${item.clusterId}`}
                                                            className="block"
                                                        >

                                                            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-xl transition hover:border-blue-400/30 hover:bg-white/[0.06]">

                                                                {/* Cluster label */}
                                                                <div className="mb-4 flex items-start justify-between gap-4">

                                                                    <div>
                                                                        <p className="text-xs font-medium uppercase tracking-wider text-blue-400">
                                                                            Topic
                                                                        </p>

                                                                        <h3 className="mt-1 text-xl font-semibold">
                                                                            {
                                                                                item.clusterLabel
                                                                            }
                                                                        </h3>
                                                                    </div>

                                                                    <div className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-300">
                                                                        {
                                                                            item.articleCount
                                                                        }{" "}
                                                                        articles
                                                                    </div>

                                                                </div>

                                                                {/* Timeline info */}
                                                                <div className="grid grid-cols-2 gap-4 text-sm">

                                                                    <div>
                                                                        <p className="text-slate-500">
                                                                            Start
                                                                        </p>

                                                                        <p className="mt-1 text-slate-300">
                                                                            {new Date(
                                                                                item.start
                                                                            ).toLocaleString()}
                                                                        </p>
                                                                    </div>

                                                                    <div>
                                                                        <p className="text-slate-500">
                                                                            End
                                                                        </p>

                                                                        <p className="mt-1 text-slate-300">
                                                                            {new Date(
                                                                                item.end
                                                                            ).toLocaleString()}
                                                                        </p>
                                                                    </div>

                                                                </div>

                                                                {/* Intensity */}
                                                                <div className="mt-5">

                                                                    <div className="mb-2 flex justify-between text-xs">

                                                                        <span className="text-slate-500">
                                                                            News intensity
                                                                        </span>

                                                                        <span className="text-slate-300">
                                                                            {
                                                                                item.intensity
                                                                            }
                                                                        </span>

                                                                    </div>

                                                                    <div className="h-2 overflow-hidden rounded-full bg-white/10">

                                                                        <div
                                                                            className="h-full rounded-full bg-blue-500"
                                                                            style={{
                                                                                width: `${Math.min(
                                                                                    item.intensity *
                                                                                        10,
                                                                                    100
                                                                                )}%`,
                                                                            }}
                                                                        />

                                                                    </div>

                                                                </div>

                                                                <p className="mt-5 text-sm text-blue-400">
                                                                    View topic articles →
                                                                </p>

                                                            </div>

                                                        </Link>

                                                    </div>

                                                </div>

                                            </div>
                                        );
                                    }
                                )}

                            </div>

                        </div>
                    )}

            </section>

        </main>
    );
}