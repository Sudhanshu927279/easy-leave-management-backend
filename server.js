const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

// Create an Express app
const app = express();

// Enable CORS (Cross-Origin Resource Sharing)
app.use(cors());

// Parse JSON bodies (for POST requests)
app.use(express.json());

// Open the SQLite database
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Login Route: Authenticate users and return a JWT
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Query the database for the user
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }

        if (!row) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare hashed password
        bcrypt.compare(password, row.password, (err, isMatch) => {
            if (err) {
                return res.status(500).json({ message: 'Password comparison error' });
            }

            if (isMatch) {
                // User authenticated, generate JWT
                const token = jwt.sign({ id: row.id, username: row.username }, 'your-secret-key', {
                    expiresIn: '1h'
                });

                return res.json({ message: 'Login successful', token });
            } else {
                return res.status(401).json({ message: 'Incorrect password' });
            }
        });
    });
});

// Get All Departments Route
app.get('/departments', (req, res) => {
    db.all('SELECT * FROM departments', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        res.json(rows);
    });
});

// Get Users by Department Route
app.get('/users/:departmentId', (req, res) => {
    const departmentId = req.params.departmentId;

    db.all('SELECT * FROM users WHERE department_id = ?', [departmentId], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        res.json(rows);
    });
});

// Leave Request Route (For Employee Leave)
app.post('/leave-request', (req, res) => {
    const { userId, leaveDays } = req.body;

    // Update leave balance for the user
    db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }

        if (!row) {
            return res.status(404).json({ message: 'User not found' });
        }

        const newLeaveBalance = row.leave_balance - leaveDays;

        if (newLeaveBalance < 0) {
            return res.status(400).json({ message: 'Not enough leave balance' });
        }

        db.run('UPDATE users SET leave_balance = ? WHERE id = ?', [newLeaveBalance, userId], (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error updating leave balance' });
            }
            res.json({ message: 'Leave request approved', leave_balance: newLeaveBalance });
        });
    });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
