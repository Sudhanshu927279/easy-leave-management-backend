// Replace sqlite3 with better-sqlite3
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

// Create and open the SQLite database
const db = new Database('./database.db', { verbose: console.log }); // Open database file

// Function to create tables (Departments and Users)
function createTables() {
    try {
        // Create Departments table
        db.prepare(`
            CREATE TABLE IF NOT EXISTS departments (
                id INTEGER PRIMARY KEY,
                department_name TEXT UNIQUE,
                manager TEXT
            )
        `).run();  // Use synchronous .run() method in better-sqlite3

        console.log('Departments table created or already exists.');

        // Create Users table
        db.prepare(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY,
                username TEXT UNIQUE,
                password TEXT,
                department_id INTEGER,
                role TEXT,
                leave_balance INTEGER DEFAULT 20,
                FOREIGN KEY (department_id) REFERENCES departments(id)
            )
        `).run();  // Same as above

        console.log('Users table created or already exists.');

    } catch (err) {
        console.error('Error creating tables:', err);
    }
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

    try {
        const insertStmt = db.prepare('INSERT OR IGNORE INTO departments (department_name, manager) VALUES (?, ?)');

        // Insert each department into the database
        departments.forEach((department) => {
            insertStmt.run(department.department_name, department.manager);
            console.log('Department inserted:', department.department_name);
        });
    } catch (err) {
        console.error('Error inserting departments:', err);
    }
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

    try {
        const selectDeptStmt = db.prepare('SELECT id FROM departments WHERE department_name = ?');
        const insertUserStmt = db.prepare('INSERT INTO users (username, password, department_id, role) VALUES (?, ?, ?, ?)');

        // Insert each user into the database
        users.forEach((user) => {
            const hashedPassword = bcrypt.hashSync(user.password, 10);  // Hash the password

            // Get department ID based on department name
            const department = selectDeptStmt.get(user.department_name);
            if (department) {
                insertUserStmt.run(user.username, hashedPassword, department.id, user.role);
                console.log('User inserted:', user.username);
            } else {
                console.log(`Department not found for user ${user.username}: ${user.department_name}`);
            }
        });
    } catch (err) {
        console.error('Error inserting users:', err);
    }
}

// Run all the database creation and insertion steps in order
async function setupDatabase() {
    try {
        createTables();  // Ensure both tables are created first
        insertDepartments();  // Insert departments
        insertUsers();  // Insert users
        console.log('Database setup completed successfully!');
    } catch (error) {
        console.error('Error during database setup:', error);
    } finally {
        db.close();  // Close the database
        console.log('Database connection closed.');
    }
}

// Run the setup function
setupDatabase();
