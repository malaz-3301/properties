// test-db.js
const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: 'ep-young-tree-a9v1dwqn-pooler.gwc.azure.neon.tech',
  port: 5432,
  user: 'lime_owner',
  password: 'npg_pKNvdH73CUwI',
  database: 'lime',
  ssl: { rejectUnauthorized: false },
});

client
  .connect()
  .then(() => console.log('✅ Raw PG connection succeeded'))
  .catch((err) => console.error('❌ Raw PG connection failed:', err))
  .finally(() => client.end());
