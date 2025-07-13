// Test script to verify Cosmos DB connection and list containers
// Usage: node test-cosmosdb-connection.cjs

require('dotenv').config();
const { CosmosClient } = require('@azure/cosmos');

const endpoint = process.env.COSMOSDB_ENDPOINT;
const key = process.env.COSMOSDB_KEY;
const dbName = process.env.COSMOSDB_DATABASE || 'doozerpricing';

if (!endpoint || !key) {
  console.error('Missing COSMOSDB_ENDPOINT or COSMOSDB_KEY environment variables.');
  process.exit(1);
}

async function main() {
  try {
    const client = new CosmosClient({ endpoint, key });
    const { resources: containers } = await client.database(dbName).containers.readAll().fetchAll();
    console.log(`Successfully connected to Cosmos DB. Containers in database "${dbName}":`);
    containers.forEach(c => console.log(`- ${c.id}`));
    process.exit(0);
  } catch (err) {
    console.error('Failed to connect to Cosmos DB:', err.message);
    process.exit(1);
  }
}

main();
