// backend/config/db.js
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

function formatQuery(sql, params = []) {
  if (!params || params.length === 0) {
    return { text: sql, values: [] };
  }

  if (/VALUES\s*\?/i.test(sql) && Array.isArray(params[0])) {
    const rows = params[0];
    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error('VALUES ? requires a non-empty array of rows');
    }

    const columns = Array.isArray(rows[0]) ? rows[0].length : 1;
    let paramIndex = 1;
    const placeholderRows = rows.map((row) => {
      if (!Array.isArray(row) || row.length !== columns) {
        throw new Error('Chaque ligne de VALUES ? doit avoir le même nombre de colonnes');
      }
      return `(${row.map(() => `$${paramIndex++}`).join(', ')})`;
    });

    return {
      text: sql.replace(/VALUES\s*\?/i, `VALUES ${placeholderRows.join(', ')}`),
      values: rows.flat(),
    };
  }

  let paramIndex = 1;
  const text = sql.replace(/\?/g, () => `$${paramIndex++}`);
  return { text, values: params.flat() };
}

function query(sql, params, callback) {
  if (typeof params === 'function') {
    callback = params;
    params = [];
  }

  const { text, values } = formatQuery(sql, params || []);
  const queryPromise = pool.query(text, values);

  if (callback) {
    queryPromise
      .then((res) => callback(null, res.rows, res))
      .catch(callback);
    return;
  }

  return queryPromise;
}

pool.on('error', (err) => {
  console.error('❌ Erreur non-client de la pool PostgreSQL:', err);
});

pool.on('connect', () => {
  console.log('✅ Connecté à PostgreSQL (pool)');
});

async function queryAsync(sql, params = []) {
  try {
    const formattedQuery = formatQuery(sql, params);
    const result = await pool.query(formattedQuery.text, formattedQuery.values);
    return result.rows || result;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  query,
  queryAsync,
  pool,
  formatQuery,
};