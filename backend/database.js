const Database = require('better-sqlite3');
const db = new Database('./tokenwise.db');
const wallet_db = new Database('./wallet.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    wallet TEXT NOT NULL,
    amount REAL NOT NULL,
    action TEXT CHECK(action IN ('Buy', 'Sell')),
    protocol TEXT
  );
`);

wallet_db.exec(`
  CREATE TABLE IF NOT EXISTS holders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wallet TEXT NOT NULL UNIQUE,
    tokens REAL NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

module.exports = {
  db,
  wallet_db
};
