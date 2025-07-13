require('dotenv').config();
// Express routes for saving and loading ROI reports in Azure Cosmos DB
// Requires: npm install express @azure/cosmos

const express = require('express');
const { CosmosClient } = require('@azure/cosmos');

const router = express.Router();

// Set these via environment variables for security
const cosmosEndpoint = process.env.COSMOSDB_ENDPOINT;
const cosmosKey = process.env.COSMOSDB_KEY;
const cosmosDbName = process.env.COSMOSDB_DATABASE || 'doozerpricing';
const cosmosContainer = process.env.COSMOSDB_CONTAINER || 'scenarioconfigs';

// Cosmos DB client
const client = new CosmosClient({ endpoint: cosmosEndpoint, key: cosmosKey });
const db = client.database(cosmosDbName);
const container = db.container(cosmosContainer);

// Save ROI report (POST /api/roi-report)
router.post('/', async (req, res) => {
  try {
    const doc = req.body;
    if (!doc || typeof doc !== 'object') {
      return res.status(400).json({ error: 'Invalid document.' });
    }
    // Ensure type is set for partition key
    doc.type = 'roi-calc';
    // Generate a unique id if not present
    if (!doc.id) {
      doc.id = require('crypto').randomUUID();
    }
    const { resource } = await container.items.upsert(doc);
    res.json({ id: resource.id });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to save ROI report.' });
  }
});

// Load ROI report (GET /api/roi-report/:id)
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { resource } = await container.item(id, "roi-calc").read();
    if (!resource) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(resource);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

// To use in your main server file (e.g., server.js):
// const roiReportRoute = require('./api/roi-report');
// app.use('/api/roi-report', roiReportRoute);
