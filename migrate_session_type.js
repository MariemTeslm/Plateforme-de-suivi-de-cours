const db = require("./backend/database/db");

async function migrate() {
    try {
        console.log("Adding type_seance column to emploi_seance table...");
        const [result] = await db.query("ALTER TABLE emploi_seance ADD COLUMN type_seance VARCHAR(10) DEFAULT 'CM'");
        console.log("Migration successful:", result);
        process.exit(0);
    } catch (err) {
        if (err.code === 'ER_DUP_COLUMN_NAME') {
            console.log("Column type_seance already exists.");
            process.exit(0);
        }
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
