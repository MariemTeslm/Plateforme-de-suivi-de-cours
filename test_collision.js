const db = require("./backend/database/db");
const EmploiSeance = require("./backend/models/tableauxModels");

async function testCollision() {
    try {
        console.log("Testing Group Collision...");

        // Find existing data for the test
        const [groups] = await db.query("SELECT nom FROM groupe LIMIT 1");
        const [profs] = await db.query("SELECT nom FROM professeur LIMIT 1");
        const [matieres] = await db.query("SELECT nom FROM matiere LIMIT 1");
        const [salles] = await db.query("SELECT nom_salle FROM salle LIMIT 1");
        const [periodes] = await db.query("SELECT id_periode FROM periode LIMIT 1");
        const [semaines] = await db.query("SELECT id FROM semaines WHERE is_active = 1 LIMIT 1");

        if (!groups.length || !profs.length || !matieres.length || !salles.length || !periodes.length || !semaines.length) {
            console.log("Not enough data to run test. Please ensure DB has groups, profs, matieres, salles, etc.");
            process.exit(0);
        }

        const testData = {
            nom_groupe: groups[0].nom,
            nom_professeur: profs[0].nom,
            nom_matiere: matieres[0].nom,
            nom_salle: salles[0].nom_salle,
            id_periode: periodes[0].id_periode,
            jour: "Lundi",
            id_semaine: semaines[0].id,
            type_seance: "CM"
        };

        console.log("Attempting to create first session...");
        await EmploiSeance.createByNames(testData);
        console.log("First session created (or skipped if it existed but didn't error).");

        console.log("Attempting to create second session at SAME TIME for SAME GROUP (Different Room to isolate Group collision)...");
        // Find another room
        const [otherSalles] = await db.query("SELECT nom_salle FROM salle WHERE nom_salle != ? LIMIT 1", [testData.nom_salle]);
        if (!otherSalles.length) {
            console.log("Need at least 2 rooms to isolate group collision.");
            process.exit(0);
        }

        try {
            await EmploiSeance.createByNames({
                ...testData,
                nom_salle: otherSalles[0].nom_salle
            });
            console.error("FAIL: Second session created despite group collision!");
            process.exit(1);
        } catch (err) {
            console.log("SUCCESS: Collision detected as expected:", err.message);
        }

        process.exit(0);
    } catch (err) {
        console.error("Test setup error:", err);
        process.exit(1);
    }
}

testCollision();
