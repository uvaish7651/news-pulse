const API_BASE_URL = "http://localhost:5000";

export const getTimeline = async () => {
    const response = await fetch(
        `${API_BASE_URL}/timeline`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch timeline");
    }

    return response.json();
};

export const getClusters = async () => {
    const response = await fetch(
        `${API_BASE_URL}/clusters`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch clusters");
    }

    return response.json();
};

export const getClusterById = async (clusterId) => {
    const response = await fetch(
        `${API_BASE_URL}/clusters/${clusterId}`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch cluster");
    }

    return response.json();
};

export const triggerIngestion = async () => {
    const response = await fetch(
        `${API_BASE_URL}/ingest/trigger`,
        {
            method: "POST",
        }
    );

    if (!response.ok) {
        throw new Error("Failed to trigger ingestion");
    }

    return response.json();
};

export const getIngestionStatus = async (jobId) => {
    const response = await fetch(
        `${API_BASE_URL}/ingest/status/${jobId}`
    );

    if (!response.ok) {
        throw new Error(
            "Failed to fetch ingestion status"
        );
    }

    return response.json();
};