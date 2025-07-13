// Main Express server to serve API and frontend
// Usage: node server.js
// Requires: npm install express

const express = require('express');
const path = require('path');
const scenarioConfigRoute = require('./api/scenario-config.cjs');
const roiReportRoute = require('./api/roi-report.cjs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

 // API routes
app.use('/api/scenario-config', scenarioConfigRoute);
app.use('/api/roi-report', roiReportRoute);

// Serve frontend (assumes build output in "dist" for Vite or "build" for CRA)
const staticDir = path.join(__dirname, 'dist');
app.use(express.static(staticDir));
app.get('*', (req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
