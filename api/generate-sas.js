// Express route to generate a SAS token for Azure Blob Storage
// Place this file in your backend (e.g., /api/generate-sas.js)
// Requires: npm install express @azure/storage-blob

const express = require('express');
const { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions, SASProtocol, StorageSharedKeyCredential } = require('@azure/storage-blob');

const router = express.Router();

// Set these via environment variables for security
const accountName = process.env.AZURE_STORAGE_ACCOUNT || 'doozerpricing';
const accountKey = process.env.AZURE_STORAGE_KEY; // Set this in your Azure Web App config
const containerName = 'scenariopricing';

router.get('/', async (req, res) => {
  try {
    const blobName = req.query.blobName || ''; // Optionally restrict to a specific blob
    const permissions = req.query.permissions || 'cw'; // Create, Write
    const expiresInMinutes = parseInt(req.query.expiresInMinutes, 10) || 15;

    if (!accountKey) {
      return res.status(500).json({ error: 'Storage account key not configured.' });
    }

    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

    const now = new Date();
    const expiry = new Date(now.getTime() + expiresInMinutes * 60 * 1000);

    const sasOptions = {
      containerName,
      blobName: blobName || undefined,
      permissions: BlobSASPermissions.parse(permissions),
      startsOn: now,
      expiresOn: expiry,
      protocol: SASProtocol.Https,
    };

    const sasToken = generateBlobSASQueryParameters(sasOptions, sharedKeyCredential).toString();

    res.json({
      sasToken,
      url: `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`,
      expiresOn: expiry,
      permissions,
      containerName,
      accountName,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to generate SAS token.' });
  }
});

module.exports = router;

// To use in your main server file (e.g., server.js):
// const generateSasRoute = require('./api/generate-sas');
// app.use('/api/generate-sas', generateSasRoute);
