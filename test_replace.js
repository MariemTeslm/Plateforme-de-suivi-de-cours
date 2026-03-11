const db = require("./backend/database/db");
const EmploiSeance = require("./backend/models/tableauxModels");

async function testReplace() {
    try {
        console.log("Starting Delete & Replace Test...");

        // 1. Get required data
        const [weeks] = await db.query("SELECT id FROM semaines WHERE is_active = 1 LIMIT 1");
        if (!weeks.length) {
            console.error("No active week found!");
            process.exit(1);
        }
        const weekId = weeks[0].id;

        const testData1 = {
            nom_groupe: 'dsi1',
            nom_professeur: 'debag',
            nom_matiere: 'Mathématiques',
            nom_salle: 'Salle A1',
            id_periode: 5, // Use a valid period ID
            jour: 'Samedi',
            id_semaine: weekId,
            type_seance: 'CM'
        };

        const testData2 = {
            ...testData1,
            nom_professeur: 'Mariem',
            nom_matiere: 'Physique'
        };

        // 2. Add Session A
        console.log("Step 1: Adding Session A...");
        const resA = await EmploiSeance.createByNames(testData1);
        const idA = resA.insertId;
        console.log(`Session A added with ID: ${idA}`);

        // 3. Delete Session A
        console.log(`Step 2: Deleting Session A (ID: ${idA})...`);
        await EmploiSeance.delete(idA);
        console.log("Session A deleted.");

        // 4. Immediately Add Session B in same slot
        console.log("Step 3: Adding Session B in the same slot immediately...");
        const resB = await EmploiSeance.createByNames(testData2);
        console.log(`SUCCESS: Session B added with ID: ${resB.insertId}`);

        // Cleanup
        await EmploiSeance.delete(resB.insertId);
        console.log("Cleanup complete.");
        process.exit(0);

    } catch (err) {
        console.error("TEST FAILED:", err.message);
        process.exit(1);
    }
}

testReplace();
