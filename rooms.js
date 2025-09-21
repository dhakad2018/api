const express = require('express');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'db_booking'
});

// JWT middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, 'your_jwt_secret', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Insert room
app.post('/rooms', authenticateToken, (req, res) => {
  const { uid, number, type, price, status } = req.body;
  db.query(
    'INSERT INTO rooms (uid, number, type, price, status) VALUES (?, ?, ?, ?, ?)',
    [uid, number, type, price, status],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'DB error', error: err });
      res.json({ message: 'Room inserted', room_id: result.insertId });
    }
  );
});

// Update room
app.put('/rooms/:id', authenticateToken, (req, res) => {
  const { uid, number, type, price, status } = req.body;
  db.query(
    'UPDATE rooms SET uid=?, number=?, type=?, price=?, status=? WHERE id=?',
    [uid, number, type, price, status, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'DB error', error: err });
      res.json({ message: 'Room updated' });
    }
  );
});

app.listen(3001, () => {
  console.log('Rooms API running on port 3001');
});
