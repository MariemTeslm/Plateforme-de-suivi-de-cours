const bcrypt = require('bcryptjs');
const db = require('./config/db');

const TABLES = [
    { name: 'administrateur', idField: 'id_admin' },
    { name: 'professeur', idField: 'id_professeur' },
    { name: 'etudiant', idField: 'id_etudiant' }
];

function isBcryptHash(value) {
    if (typeof value !== 'string') return false;
    return /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(value);
}

async function migrateTable(tableName, idField) {
    const [rows] = await db.query(
        `SELECT ${idField} AS id, mot_de_passe FROM ${tableName}`
    );

    let migrated = 0;
    let skipped = 0;

    for (const row of rows) {
        const current = row.mot_de_passe;

        // Skip null/empty and already-hashed values
        if (!current || isBcryptHash(current)) {
            skipped += 1;
            continue;
        }

        const hashed = await bcrypt.hash(current, 10);
        await db.query(
            `UPDATE ${tableName} SET mot_de_passe = ? WHERE ${idField} = ?`,
            [hashed, row.id]
        );
        migrated += 1;
    }

    return { tableName, total: rows.length, migrated, skipped };
}

async function run() {
    console.log('Starting bcrypt password migration...\n');

    const results = [];
    let totalMigrated = 0;

    try {
        for (const t of TABLES) {
            const result = await migrateTable(t.name, t.idField);
            results.push(result);
            totalMigrated += result.migrated;
        }

        for (const r of results) {
            console.log(`[${r.tableName}] total=${r.total}, migrated=${r.migrated}, skipped=${r.skipped}`);
        }

        console.log(`\nDone. Total migrated: ${totalMigrated}`);
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err.message);
        process.exit(1);
    }
}

run();
