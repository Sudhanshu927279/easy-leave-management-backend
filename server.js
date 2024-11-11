const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

// Replace sqlite3 with better-sqlite3
const Database = require('better-sqlite3');

// Create an Express app
const app = express();

// Enable CORS (Cross-Origin Resource Sharing)
app.use(cors());

// Parse JSON bodies (for POST requests)
app.use(express.json());

// Open the SQLite database using better-sqlite3
const db = new Database('./database.db', { verbose: console.log }); // Open database file

// Login Route: Authenticate users and return a JWT
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    try {
        // Query the database for the user
        const row = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

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
    } catch (err) {
        return res.status(500).json({ message: 'Database error' });
    }
});

// Get All Departments Route
app.get('/departments', (req, res) => {
    try {
        const rows = db.prepare('SELECT * FROM departments').all();
        res.json(rows);
    } catch (err) {
        return res.status(500).json({ message: 'Database error' });
    }
});

// Get Users by Department Route
app.get('/users/:departmentId', (req, res) => {
    const departmentId = req.params.departmentId;

    try {
        const rows = db.prepare('SELECT * FROM users WHERE department_id = ?').all(departmentId);
        res.json(rows);
    } catch (err) {
        return res.status(500).json({ message: 'Database error' });
    }
});

// Leave Request Route (For Employee Leave)
app.post('/leave-request', (req, res) => {
    const { userId, leaveDays } = req.body;

    try {
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const newLeaveBalance = user.leave_balance - leaveDays;

        if (newLeaveBalance < 0) {
            return res.status(400).json({ message: 'Not enough leave balance' });
        }

        db.prepare('UPDATE users SET leave_balance = ? WHERE id = ?').run(newLeaveBalance, userId);

        res.json({ message: 'Leave request approved', leave_balance: newLeaveBalance });
    } catch (err) {
        return res.status(500).json({ message: 'Error processing leave request' });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
