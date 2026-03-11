/* =========================
   État de l'édition
========================= */
let isEditing = false;
let editingId = null;
let allPeriodes = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchPeriodes();
    const addForm = document.getElementById('addPeriodeForm');
    if (addForm) {
        addForm.addEventListener('submit', (e) => {
            e.preventDefault();
            savePeriode();
        });
    }
});

async function fetchPeriodes() {
    try {
        const result = await API.get("/periodes/all");
        allPeriodes = result.data || [];
        renderPeriodes(allPeriodes);
    } catch (err) {
        console.error("Erreur chargement périodes:", err);
    }
}

function renderPeriodes(periodes) {
    const tbody = document.getElementById('periodesList');
    if (!tbody) return;

    tbody.innerHTML = "";

    if (periodes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 20px;">Aucune période définie</td></tr>';
        return;
    }

    periodes.forEach(p => {
        const tr = document.createElement("tr");
        const start = p.heure_debut ? p.heure_debut.substring(0, 5) : "";
        const end = p.heure_fin ? p.heure_fin.substring(0, 5) : "";
        tr.innerHTML = `
            <td><strong style="color: var(--primary);">${p.nom}</strong></td>
            <td>${start}</td>
            <td>${end}</td>
            <td style="display: flex; gap: 8px; justify-content: flex-end;">
                <button class="btn-primary" style="padding: 6px 12px; font-size: 0.7rem; min-width: unset; background: #3b82f6;" onclick="editPeriode(${p.id_periode})">Modifier</button>
                <button class="btn-danger" style="padding: 6px 12px; font-size: 0.7rem; min-width: unset;" onclick="deletePeriode(${p.id_periode})">Supprimer</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function savePeriode() {
    const nom = document.getElementById('nom').value.trim();
    const heure_debut = document.getElementById('heure_debut').value;
    const heure_fin = document.getElementById('heure_fin').value;

    if (!nom || !heure_debut || !heure_fin) return;

    try {
        let response;
        if (isEditing) {
            response = await API.put(`/periodes/update/${editingId}`, { nom, heure_debut, heure_fin });
        } else {
            response = await API.post("/periodes/add", { nom, heure_debut, heure_fin });
        }

        alert(response.message);
        cancelPeriodeEdit();
        fetchPeriodes();
    } catch (err) { }
}

function editPeriode(id) {
    const p = allPeriodes.find(item => item.id_periode === id);
    if (!p) return;

    isEditing = true;
    editingId = id;

    document.getElementById('nom').value = p.nom;
    document.getElementById('heure_debut').value = p.heure_debut;
    document.getElementById('heure_fin').value = p.heure_fin;

    document.getElementById("submitBtn").textContent = "Mettre à jour";
    document.getElementById("cancelEdit").style.display = "inline-block";
    document.getElementById("addPeriodeForm").scrollIntoView({ behavior: 'smooth' });
}

function cancelPeriodeEdit() {
    isEditing = false;
    editingId = null;
    document.getElementById('addPeriodeForm').reset();
    document.getElementById("submitBtn").textContent = "Enregistrer la période";
    document.getElementById("cancelEdit").style.display = "none";
}

async function deletePeriode(id) {
    if (!confirm("Voulez-vous vraiment supprimer cette période ?")) return;
    try {
        const response = await API.delete(`/periodes/delete/${id}`);
        alert(response.message);
        fetchPeriodes();
    } catch (err) { }
}
