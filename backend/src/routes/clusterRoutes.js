const express = require("express");

const {
    getClusters,
    getCluster,
} = require("../controllers/clusterController");


const router = express.Router();


// GET /clusters
router.get("/", getClusters);


// GET /clusters/:id
router.get("/:id", getCluster);


module.exports = router;