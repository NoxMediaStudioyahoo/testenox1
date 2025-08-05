const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = new sqlite3.Database('./tickets.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticketNumber TEXT,
    userName TEXT,
    description TEXT,
    status TEXT,
    createdAt TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticketNumber TEXT,
    sender TEXT,
    text TEXT,
    timestamp TEXT
  )`);
});

app.post('/api/tickets', (req, res) => {
  const { ticketNumber, userName, description } = req.body;
  const createdAt = new Date().toISOString();
  db.run(
    `INSERT INTO tickets (ticketNumber, userName, description, status, createdAt) VALUES (?, ?, ?, 'pendente', ?)`,
    [ticketNumber, userName, description, createdAt],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, ticketNumber, userName, description, status: 'pendente', createdAt });
    }
  );
});

app.get('/api/tickets', (req, res) => {
  db.all(`SELECT * FROM tickets ORDER BY createdAt DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.put('/api/tickets/:ticketNumber', (req, res) => {
  const { status } = req.body;
  db.run(
    `UPDATE tickets SET status = ? WHERE ticketNumber = ?`,
    [status, req.params.ticketNumber],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

app.post('/api/messages', (req, res) => {
  const { ticketNumber, sender, text } = req.body;
  const timestamp = new Date().toISOString();
  db.run(
    `INSERT INTO messages (ticketNumber, sender, text, timestamp) VALUES (?, ?, ?, ?)`,
    [ticketNumber, sender, text, timestamp],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, ticketNumber, sender, text, timestamp });
    }
  );
});

app.get('/api/messages/:ticketNumber', (req, res) => {
  db.all(
    `SELECT * FROM messages WHERE ticketNumber = ? ORDER BY timestamp ASC`,
    [req.params.ticketNumber],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

app.listen(8000, () => {
  console.log('Backend rodando na porta 8000');
});
