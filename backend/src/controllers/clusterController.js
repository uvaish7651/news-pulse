const {
    getAllClusters,
    getClusterById,
} = require("../services/clusterService");


/**
 * GET /clusters
 *
 * Return all news clusters.
 */
const getClusters = async (req, res) => {
    try {
        const clusters = await getAllClusters();

        res.status(200).json({
            success: true,
            count: clusters.length,
            clusters,
        });

    } catch (error) {
        console.error(
            "Error fetching clusters:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch clusters",
        });
    }
};


/**
 * GET /clusters/:id
 *
 * Return a specific news cluster.
 */
const getCluster = async (req, res) => {
    try {
        const { id } = req.params;

        const cluster = await getClusterById(id);

        if (!cluster) {
            return res.status(404).json({
                success: false,
                message: "Cluster not found",
            });
        }

        res.status(200).json({
            success: true,
            cluster,
        });

    } catch (error) {
        console.error(
            "Error fetching cluster:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch cluster",
        });
    }
};


module.exports = {
    getClusters,
    getCluster,
};