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

// Insert booking
app.post('/booking', authenticateToken, (req, res) => {
  const { booking_uid, user_uid, room_uid, check_in, check_out, status, created_at } = req.body;
  db.query(
    'INSERT INTO booking (booking_uid, user_uid, room_uid, check_in, check_out, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [booking_uid, user_uid, room_uid, check_in, check_out, status, created_at],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'DB error', error: err });
      res.json({ message: 'Booking inserted', booking_id: result.insertId });
    }
  );
});

// Update booking
app.put('/booking/:id', authenticateToken, (req, res) => {
  const { booking_uid, user_uid, room_uid, check_in, check_out, status, created_at } = req.body;
  db.query(
    'UPDATE booking SET booking_uid=?, user_uid=?, room_uid=?, check_in=?, check_out=?, status=?, created_at=? WHERE booking_id=?',
    [booking_uid, user_uid, room_uid, check_in, check_out, status, created_at, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'DB error', error: err });
      res.json({ message: 'Booking updated' });
    }
  );
});

app.listen(3002, () => {
  console.log('Booking API running on port 3002');
});
