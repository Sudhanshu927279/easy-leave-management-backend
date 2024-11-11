const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

// Create and open the SQLite database
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Function to create tables (Departments and Users)
function createTables() {
    return new Promise((resolve, reject) => {
        // Create Departments table
        db.run(`
            CREATE TABLE IF NOT EXISTS departments (
                id INTEGER PRIMARY KEY,
                department_name TEXT UNIQUE,
                manager TEXT
            )
        `, (err) => {
            if (err) {
                reject('Error creating departments table: ' + err.message);
            } else {
                console.log('Departments table created or already exists.');
            }
        });

        // Create Users table
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY,
                username TEXT UNIQUE,
                password TEXT,
                department_id INTEGER,
                role TEXT,
                leave_balance INTEGER DEFAULT 20,
                FOREIGN KEY (department_id) REFERENCES departments(id)
            )
        `, (err) => {
            if (err) {
                reject('Error creating users table: ' + err.message);
            } else {
                console.log('Users table created or already exists.');
                resolve();
            }
        });
    });
}

// Insert departments into the database
function insertDepartments() {
    const departments = [
        { department_name: 'Software Development', manager: 'John Anderson' },
        { department_name: 'Quality Assurance', manager: 'Emily Clarke' },
        { department_name: 'Product Management', manager: 'Ajay Patel' },
        { department_name: 'System Administration', manager: 'David Miller' },
        { department_name: 'Human Resources', manager: 'Rita Sharma' },
        { department_name: 'IT Support', manager: 'Michael Taylor' },
        { department_name: 'Research & Development', manager: 'Nina Gupta' }
    ];

    return new Promise((resolve, reject) => {
        departments.forEach((department, index) => {
            db.run('INSERT OR IGNORE INTO departments (department_name, manager) VALUES (?, ?)', 
                [department.department_name, department.manager], (err) => {
                    if (err) {
                        reject('Error inserting department: ' + err.message);
                    } else {
                        console.log('Department inserted:', department.department_name);
                        if (index === departments.length - 1) {
                            resolve();
                        }
                    }
                });
        });
    });
}

// Insert users (employees) into the database
function insertUsers() {
    const users = [
        { username: 'Sudhanshu', password: 'password123', department_name: 'Software Development', role: 'user' },
        { username: 'Manohar', password: 'password123', department_name: 'Software Development', role: 'user' },
        { username: 'Yashwant', password: 'password123', department_name: 'Software Development', role: 'user' },
        { username: 'Amit', password: 'password123', department_name: 'Human Resources', role: 'user' },
        { username: 'Raj', password: 'password123', department_name: 'Human Resources', role: 'user' },
        { username: 'Arun', password: 'password123', department_name: 'Quality Assurance', role: 'user' },
        { username: 'Suresh', password: 'password123', department_name: 'Quality Assurance', role: 'user' },
        { username: 'Priya', password: 'password123', department_name: 'Product Management', role: 'user' },
        { username: 'Neha', password: 'password123', department_name: 'Product Management', role: 'user' },
        { username: 'Vijay', password: 'password123', department_name: 'System Administration', role: 'user' },
        { username: 'Karan', password: 'password123', department_name: 'System Administration', role: 'user' },
        { username: 'Deepak', password: 'password123', department_name: 'IT Support', role: 'user' },
        { username: 'Anil', password: 'password123', department_name: 'IT Support', role: 'user' },
        { username: 'Ravi', password: 'password123', department_name: 'Research & Development', role: 'user' },
        { username: 'Suman', password: 'password123', department_name: 'Research & Development', role: 'user' },
        { username: 'Komal', password: 'password123', department_name: 'Software Development', role: 'user' },
        { username: 'Vandana', password: 'password123', department_name: 'Human Resources', role: 'user' },
        { username: 'Ritika', password: 'password123', department_name: 'Quality Assurance', role: 'user' },
        { username: 'Sandeep', password: 'password123', department_name: 'IT Support', role: 'user' },
        { username: 'Abhishek', password: 'password123', department_name: 'System Administration', role: 'user' }
    ];

    return new Promise((resolve, reject) => {
        users.forEach((user, index) => {
            const hashedPassword = bcrypt.hashSync(user.password, 10);  // Hash password
            
            // Get department id based on department name
            db.get('SELECT id FROM departments WHERE department_name = ?', [user.department_name], (err, row) => {
                if (err) {
                    reject('Error fetching department id: ' + err.message);
                } else if (row) {
                    // Insert user into the 'users' table with hashed password and department id
                    db.run('INSERT INTO users (username, password, department_id, role) VALUES (?, ?, ?, ?)', 
                        [user.username, hashedPassword, row.id, user.role], (err) => {
                            if (err) {
                                reject('Error inserting user: ' + err.message);
                            } else {
                                console.log('User inserted:', user.username);
                                if (index === users.length - 1) {
                                    resolve();
                                }
                            }
                        });
                } else {
                    console.log(`Department not found for user ${user.username}: ${user.department_name}`);
                }
            });
        });
    });
}

// Run all the database creation and insertion steps in order
async function setupDatabase() {
    try {
        await createTables();   // Ensure both tables are created first
        await insertDepartments();  // Insert departments
        await insertUsers();  // Insert users
        console.log('Database setup completed successfully!');
    } catch (error) {
        console.error('Error during database setup:', error);
    } finally {
        db.close((err) => {
            if (err) {
                console.error('Error closing the database:', err.message);
            } else {
                console.log('Database connection closed.');
            }
        });
    }
}

// Run the setup function
setupDatabase();
