const mysql = require("mysql2/promise");
require("dotenv").config({ quiet: true });

const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "school_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection
(async () => {
    try {
        const connection = await db.getConnection();
        console.log("Connecté à la DB MySQL (Pool) !");
        connection.release();
    } catch (err) {
        console.error("Erreur DB:", err.message);
    }
})();

module.exports = db;
