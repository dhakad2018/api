// server.js or index.js

const express = require('express');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();

// ✅ Enable CORS for your frontend
app.use(cors({
  origin: 'http://localhost:5173', // Replace with your frontend URL
  credentials: true
}));

app.use(express.json());

// ✅ MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'db_booking'
});

// ✅ JWT middleware
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

// ✅ Login route
app.post('/login', (req, res) => {
  const { user_email, user_pwd } = req.body;
  if (!user_email || !user_pwd) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  db.query(
    'SELECT * FROM tbl_users WHERE user_email = ? AND user_status = 1',
    [user_email],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      if (results.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

      const user = results[0];

      // Compare passwords directly (no bcrypt used here — but you can upgrade later)
      if (user.user_pwd !== user_pwd) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        {
          user_id: user.user_id,
          user_email: user.user_email,
          user_type: user.user_type
        },
        'your_jwt_secret',
        { expiresIn: '1h' }
      );

      res.json({
        token,
        user: {
          user_id: user.user_id,
          user_fname: user.user_fname,
          user_lname: user.user_lname,
          user_email: user.user_email,
          user_type: user.user_type
        }
      });
    }
  );
});

// ✅ Insert room
app.post('/rooms', authenticateToken, (req, res) => {
  const { uid, number, type, price, status } = req.body;

  db.query(
    'INSERT INTO rooms (uid, number, type, price, status) VALUES (?, ?, ?, ?, ?)',
    [uid, number, type, price, status],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err });
      res.json({ message: 'Room inserted', room_id: result.insertId });
    }
  );
});

// ✅ Update room
app.put('/rooms/:id', authenticateToken, (req, res) => {
  const { uid, number, type, price, status } = req.body;

  db.query(
    'UPDATE rooms SET uid=?, number=?, type=?, price=?, status=? WHERE id=?',
    [uid, number, type, price, status, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err });
      res.json({ message: 'Room updated' });
    }
  );
});

// ✅ Insert booking
app.post('/booking', authenticateToken, (req, res) => {
  const { booking_uid, user_uid, room_uid, check_in, check_out, status, created_at } = req.body;

  db.query(
    'INSERT INTO booking (booking_uid, user_uid, room_uid, check_in, check_out, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [booking_uid, user_uid, room_uid, check_in, check_out, status, created_at],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err });
      res.json({ message: 'Booking inserted', booking_id: result.insertId });
    }
  );
});

// ✅ Update booking
app.put('/booking/:id', authenticateToken, (req, res) => {
  const { booking_uid, user_uid, room_uid, check_in, check_out, status, created_at } = req.body;

  db.query(
    'UPDATE booking SET booking_uid=?, user_uid=?, room_uid=?, check_in=?, check_out=?, status=?, created_at=? WHERE booking_id=?',
    [booking_uid, user_uid, room_uid, check_in, check_out, status, created_at, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err });
      res.json({ message: 'Booking updated' });
    }
  );
});

// ✅ Start server
app.listen(3000, () => {
  console.log('✅ API running on http://localhost:3000');
});

