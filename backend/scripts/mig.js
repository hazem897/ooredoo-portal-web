const pool = require('./config/db');

const query = `
CREATE TABLE IF NOT EXISTS access_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action ENUM('login', 'logout') NOT NULL,
    cree_le DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
`;

pool.query(query, (err) => {
    if (err) console.error("Error creating table:", err);
    else console.log("Table access_logs created successfully");
    process.exit(err ? 1 : 0);
});
