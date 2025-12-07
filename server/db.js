import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'flashcard_db.sqlite');

let db = null;
let SQL = null;

// Initialize database
export async function initializeDb() {
  SQL = await initSqlJs();
  
  try {
    // Try to load existing database
    if (fs.existsSync(dbPath)) {
      const fileBuffer = fs.readFileSync(dbPath);
      db = new SQL.Database(fileBuffer);
    } else {
      db = new SQL.Database();
    }
  } catch (e) {
    // Create new database if file doesn't exist
    db = new SQL.Database();
  }
  
  return db;
}

// Save database to file
export function saveDb() {
  if (db) {
    try {
      const data = db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(dbPath, buffer);
    } catch (error) {
      console.error('Error saving database:', error);
    }
  }
}

// Convert PostgreSQL-style params ($1, $2) to ? for sql.js
function convertSqlParams(sql, params) {
  let paramIndex = 1;
  let convertedSql = sql;
  const paramMap = [];
  
  // Replace $1, $2, etc. with ? and track which param each ? corresponds to
  while (convertedSql.includes('$' + paramIndex)) {
    convertedSql = convertedSql.replace('$' + paramIndex, '?');
    paramMap.push(paramIndex - 1);
    paramIndex++;
  }
  
  return { sql: convertedSql, params: params };
}

// Wrapper to match pg interface
const pool = {
  query: (sql, params = []) => {
    try {
      if (!db) {
        throw new Error('Database not initialized. Call initializeDb() first.');
      }
      
      // Convert PostgreSQL-style params to sql.js style
      const { sql: convertedSql } = convertSqlParams(sql, params);
      
      const rows = [];
      const isSelect = sql.trim().toUpperCase().startsWith('SELECT');
      const isInsert = sql.trim().toUpperCase().startsWith('INSERT');
      
      if (isSelect) {
        try {
          const stmt = db.prepare(convertedSql);
          stmt.bind(params);
          
          while (stmt.step()) {
            const rowArray = stmt.get();
            const columns = stmt.getColumnNames();
            const row = {};
            
            columns.forEach((col, idx) => {
              row[col] = rowArray[idx];
            });
            
            rows.push(row);
          }
          stmt.free();
        } catch (e) {
          console.error('SELECT error:', e.message, 'SQL:', convertedSql);
          throw e;
        }
      } else {
        // INSERT, UPDATE, DELETE
        try {
          db.run(convertedSql, params);
          saveDb();
          
          // For INSERT, get the last insert rowid
          if (isInsert) {
            const lastIdStmt = db.prepare('SELECT last_insert_rowid() as id');
            lastIdStmt.step();
            const result = lastIdStmt.get();
            rows.push({ id: result[0] });
            lastIdStmt.free();
          }
        } catch (e) {
          console.error('INSERT/UPDATE/DELETE error:', e.message, 'SQL:', convertedSql);
          throw e;
        }
      }
      
      return { rows };
    } catch (error) {
      console.error('Database error:', error.message);
      throw error;
    }
  }
};

export default pool;
