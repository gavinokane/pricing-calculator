// Express routes for saving and loading scenario configs in Azure Cosmos DB
// Requires: npm install express @azure/cosmos

const express = require('express');
const { CosmosClient } = require('@azure/cosmos');

const router = express.Router();

// Set these via environment variables for security
const cosmosEndpoint = process.env.COSMOSDB_ENDPOINT;
const cosmosKey = process.env.COSMOSDB_KEY;
const cosmosDbName = process.env.COSMOSDB_DATABASE || 'doozerAI-Dev01';
const cosmosContainer = process.env.COSMOSDB_CONTAINER || 'pricing';

// Cosmos DB client
const client = new CosmosClient({ endpoint: cosmosEndpoint, key: cosmosKey });
const db = client.database(cosmosDbName);
const container = db.container(cosmosContainer);

// Save scenario config (POST /api/scenario-config)
router.post('/', async (req, res) => {
  try {
    const doc = req.body;
    if (!doc || typeof doc !== 'object') {
      return res.status(400).json({ error: 'Invalid document.' });
    }
    // Generate a unique id if not present
    if (!doc.id) {
      doc.id = require('crypto').randomUUID();
    }
    const { resource } = await container.items.upsert(doc);
    res.json({ id: resource.id });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to save scenario config.' });
  }
});

// Load scenario config (GET /api/scenario-config/:id)
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { resource } = await container.item(id, id).read();
    if (!resource) {
      return res.status(404).json({ error: 'Config not found.' });
    }
    res.json(resource);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to load scenario config.' });
  }
});

module.exports = router;

// To use in your main server file (e.g., server.js):
// const scenarioConfigRoute = require('./api/scenario-config');
// app.use('/api/scenario-config', scenarioConfigRoute);
