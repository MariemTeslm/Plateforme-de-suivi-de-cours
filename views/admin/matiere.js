let isEditing = false;
let editingId = null;
let allMatieres = [];
let allGroupes = [];

async function fetchGroupes() {
    try {
        const res = await API.get('/groupes/all');
        allGroupes = res.data || [];
        const select = document.getElementById('groupe');
        if (!select) return;
        select.innerHTML = '<option value="">-- Sélectionner un groupe --</option>';
        allGroupes.forEach(g => {
            const opt = document.createElement('option');
            opt.value = g.id_groupe;
            opt.textContent = g.nom;
            select.appendChild(opt);
        });
    } catch (err) {
        console.error(err);
    }
}

async function fetchMatieres() {
    try {
        const res = await API.get("/matieres/all");
        allMatieres = res.data || [];
        renderMatieres(allMatieres);
    } catch(err) { console.error(err); }
}

function renderMatieres(matieres) {
    const tbody = document.querySelector("#matiereTable tbody");
    tbody.innerHTML = "";
    matieres.forEach(m => {
        const nombre_horaire = Number(m.credit * 25); // Calcul horaire
        const totalRealise = (m.total_CM || 0) + (m.total_TD || 0) + (m.total_TP || 0);

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${m.nom_matiere}</td>
            <td>${m.code_matiere}</td>
            <td>${m.nom_groupe || '-'}</td>
            <td>${m.credit}</td>
            <td>${nombre_horaire}</td>
            <td>CM:${m.total_CM || 0} | TD:${m.total_TD || 0}  | TP:${m.total_TP || 0}</td>
            <td>CM:${m.realise_CM || 0} |  TD:${m.realise_TD || 0} | TP:${m.realise_TP || 0}</td>
            <td>CM:${m.progression_CM || 0} | TD:${m.progression_TD || 0} | TP:${m.progression_TP || 0}</td>
            <td>
                <button onclick="editMatiere(${m.id})">Modifier</button>
                <button onclick="deleteMatiere(${m.id})">Supprimer</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function editMatiere(id) {
    const m = allMatieres.find(x => x.id === id);
    if (!m) return;

    isEditing = true;
    editingId = id;

    document.getElementById("nom_matiere").value = m.nom_matiere;
    document.getElementById("code_matiere").value = m.code_matiere;
    document.getElementById("groupe").value = m.groupe || '';
    document.getElementById("credit").value = m.credit;
    document.getElementById("total_CM").value = m.total_CM || 0;
    document.getElementById("total_TD").value = m.total_TD || 0;
    document.getElementById("total_TP").value = m.total_TP || 0;

    document.getElementById("submitBtn").textContent = "Mettre à jour";
    document.getElementById("cancelEdit").style.display = "inline-block";
}

function cancelMatiereEdit() {
    isEditing = false;
    editingId = null;
    document.getElementById("matiereForm").reset();
    const groupeSelect = document.getElementById('groupe');
    if (groupeSelect) groupeSelect.value = '';
    document.getElementById("submitBtn").textContent = "Enregistrer";
    document.getElementById("cancelEdit").style.display = "none";
    document.getElementById("errorMsg").textContent = "";
}

async function saveMatiere() {
    const nom = document.getElementById("nom_matiere").value.trim();
    const code = document.getElementById("code_matiere").value.trim();
    const groupe = parseInt(document.getElementById("groupe").value, 10);
    const credit = parseFloat(document.getElementById("credit").value);
    const total_CM = parseInt(document.getElementById("total_CM").value) || 0;
    const total_TD = parseInt(document.getElementById("total_TD").value) || 0;
    const total_TP = parseInt(document.getElementById("total_TP").value) || 0;

    const nombre_horaire = credit * 25;
    const total = total_CM + total_TD + total_TP;

    if (total > nombre_horaire || total < nombre_horaire) {
        document.getElementById("errorMsg").textContent =
            `Erreur : CM+TD+TP = ${total}  , doit etre = (${nombre_horaire}).`;
        return;
    } else {
        document.getElementById("errorMsg").textContent = "";
    }

    if (!groupe) {
        document.getElementById("errorMsg").textContent = "Veuillez sélectionner un groupe.";
        return;
    }

    const body = { nom_matiere: nom, code_matiere: code, groupe, credit, total_CM, total_TD, total_TP };

    if (isEditing) {
        API.put(`/matieres/update/${editingId}`, body)
            .then(() => { cancelMatiereEdit(); fetchMatieres(); })
            .catch(console.error);
    } else {
        API.post("/matieres/add", body)
            .then(() => { cancelMatiereEdit(); fetchMatieres(); })
            .catch(console.error);
    }
}
async function deleteMatiere(id){
    if(!confirm("Voulez-vous supprimer cette matière ?")) return;
    try{
        await API.delete(`/matieres/delete/${id}`);
        fetchMatieres();
    } catch(err){ console.error(err); }
}

document.addEventListener("DOMContentLoaded", ()=>{
    fetchGroupes();
    fetchMatieres();
    document.getElementById("matiereForm").addEventListener("submit", e=>{
        e.preventDefault();
        saveMatiere();
    });
});