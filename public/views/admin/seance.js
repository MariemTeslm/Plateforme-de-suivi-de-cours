/* =========================
   État de l'édition
========================= */
let isEditing = false;
let editingId = null;
let allSeances = [];

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('seanceForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveSeance();
        });
    }
    loadDropdowns();
});

let G_PERIODES = [];
async function loadDropdowns() {
    try {
        const [groups, profs, matieres, salles, periodes, semaines] = await Promise.all([
            API.get("/groupes/all"),
            API.get("/profs/all"),
            API.get("/matieres/list"),
            API.get("/salles/all"),
            API.get("/periodes/all"),
            API.get("/semaines/all")  // <-- toutes les semaines
        ]);

        const fillSelect = (id, data, textKey, valueKey = textKey) => {
            const select = document.getElementById(id);
            if (!select) return;
            select.innerHTML = '<option value="">-- Sélectionner --</option>';
            data.forEach(item => {
                const opt = document.createElement('option');
                opt.value = item[valueKey]; // valeur = id de la semaine ou autre
                if(id === "id_semaine"){
                    // afficher Semaine X + dates
                    const start = new Date(item.date_debut).toLocaleDateString('fr-FR');
                    const end = new Date(item.date_fin).toLocaleDateString('fr-FR');
                    opt.textContent = `Semaine ${item.numSemaine} (${start} - ${end})`;
                } else {
                    opt.textContent = item[textKey];
                }
                select.appendChild(opt);
            });
        };

        fillSelect('nom_groupe', groups.data, 'nom');
        fillSelect('nom_professeur', profs.data, 'nom');
        fillSelect('nom_matiere', matieres.data, 'nom', 'nom');
        fillSelect('nom_salle', salles.data, 'nom_salle', 'nom_salle');
        fillSelect('id_periode', periodes.data, 'nom', 'id_periode');
        fillSelect('id_semaine', semaines.data, 'numSemaine', 'id'); // <-- toutes les semaines

        // pré-sélectionner la semaine active si elle existe
        const activeWeek = semaines.data.find(s => s.active);
        if(activeWeek) document.getElementById('id_semaine').value = activeWeek.id;

        G_PERIODES = periodes.data;

        await loadSeances();

        // Setup filter listeners
        const fProf = document.getElementById('filterProf');
        const fGroup = document.getElementById('filterGroup');
        const fDay = document.getElementById('filterDay');
        if (fProf) fProf.addEventListener('input', applySeanceFilters);
        if (fGroup) fGroup.addEventListener('input', applySeanceFilters);
        if (fDay) fDay.addEventListener('change', applySeanceFilters);

    } catch (err) {
        console.error("Erreur chargement dropdowns:", err);
    }
}

async function loadSeances() {
    try {
        const weekId = window.activeWeekId || document.getElementById('id_semaine')?.value || "";
        const res = await API.get(`/tableaux/all?id_semaine=${weekId}`);
        allSeances = res.data || [];
        applySeanceFilters();
    } catch (err) {
        console.error("Erreur chargement séances:", err);
    }
}

function applySeanceFilters() {
    const profTerm = document.getElementById('filterProf')?.value.toLowerCase() || "";
    const groupTerm = document.getElementById('filterGroup')?.value.toLowerCase() || "";
    const dayTerm = document.getElementById('filterDay')?.value || "";

    const filtered = allSeances.filter(s => {
        const matchProf = (s.nom_professeur || "").toLowerCase().includes(profTerm);
        const matchGroup = (s.nom_groupe || "").toLowerCase().includes(groupTerm);
        const matchDay = dayTerm === "" || s.jour === dayTerm;
        return matchProf && matchGroup && matchDay;
    });

    renderSeances(filtered);
}

function renderSeances(sessions) {
    const tbody = document.getElementById('seancesTable');
    if (!tbody) return;

    tbody.innerHTML = '';
    if (sessions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#94a3b8;padding:20px;">Aucune séance trouvée.</td></tr>';
        return;
    }

    sessions.forEach(s => {
        const periodName = G_PERIODES.find(p => p.id_periode == s.id_periode)?.nom || `P${s.id_periode}`;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${s.jour}</strong></td>
            <td><span class="badge" style="background:rgba(37,99,235,0.08);color:var(--primary);padding:4px 8px;border-radius:6px;font-size:0.75rem;">${periodName}</span></td>
            <td>${s.nom_groupe || '?'}</td>
            <td style="color: var(--primary); font-weight: 500;">
                ${s.nom_matiere || '?'}
                <span style="display:inline-block;font-size:0.65rem;padding:2px 6px;border-radius:4px;background:#e0e7ff;color:#4338ca;margin-left:5px;">${s.type_seance || 'CM'}</span>
            </td>
            <td>${s.nom_professeur || '?'}</td>
            <td><span class="badge" style="background:rgba(37,99,235,0.08);color:var(--primary);padding:4px 8px;border-radius:6px;font-size:0.75rem;">📍 ${s.nom_salle || '?'}</span></td>
            <td style="display: flex; gap: 8px; justify-content: flex-end;">
                <button onclick="editSeance(${s.id_seance})" class="btn-primary" style="padding:6px 12px;font-size:0.7rem;min-width:unset;background:#3b82f6;">Modifier</button>
                <button onclick="deleteSeance(${s.id_seance})" class="btn-danger" style="padding:6px 12px;font-size:0.7rem;min-width:unset;">Supprimer</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function saveSeance() {
    const btn = document.getElementById('submitBtn');
    if (btn) btn.disabled = true;

    const data = {
        nom_groupe: document.getElementById('nom_groupe').value,
        nom_professeur: document.getElementById('nom_professeur').value,
        nom_matiere: document.getElementById('nom_matiere').value,
        nom_salle: document.getElementById('nom_salle').value,
        id_periode: document.getElementById('id_periode').value,
        jour: document.getElementById('jour').value,
        id_semaine: document.getElementById('id_semaine').value || window.activeWeekId,
        type_seance: document.getElementById('type_seance').value
    };

    if (!data.nom_groupe || !data.nom_professeur || !data.nom_matiere || !data.nom_salle || !data.id_periode || !data.jour || !data.id_semaine || !data.type_seance) {
        if (typeof showToast === 'function') showToast("Veuillez remplir tous les champs.", "warning");
        else alert("Veuillez remplir tous les champs.");
        if (btn) btn.disabled = false;
        return;
    }

    try {
        let res;
        if (isEditing) {
            res = await API.put(`/tableaux/update/${editingId}`, data);
        } else {
            res = await API.post("/tableaux/add", data);
        }

        if (typeof showToast === 'function') showToast(res.message, "success");
        else alert(res.message);

        cancelSeanceEdit();
        await loadSeances();
    } catch (err) {
        if (typeof showToast === 'function') showToast(err.message, "error");
        else alert(err.message);
    } finally {
        if (btn) btn.disabled = false;
    }
}

function editSeance(id) {
    const seance = allSeances.find(s => s.id_seance === id);
    if (!seance) return;

    isEditing = true;
    editingId = id;

    // Populate dropdowns
    document.getElementById('nom_groupe').value = seance.nom_groupe;
    document.getElementById('nom_professeur').value = seance.nom_professeur;
    document.getElementById('nom_matiere').value = seance.nom_matiere;
    document.getElementById('nom_salle').value = seance.nom_salle;
    document.getElementById('id_periode').value = seance.id_periode;
    document.getElementById('jour').value = seance.jour;
    document.getElementById('type_seance').value = seance.type_seance || "CM";
    document.getElementById('id_semaine').value = seance.id_semaine;

    document.getElementById('submitBtn').textContent = "Mettre à jour";
    document.getElementById('cancelEdit').style.display = "inline-block";
    document.getElementById('seanceForm').scrollIntoView({ behavior: 'smooth' });
}

function cancelSeanceEdit() {
    isEditing = false;
    editingId = null;
    document.getElementById('seanceForm').reset();
    document.getElementById('submitBtn').textContent = "Enregistrer la séance";
    document.getElementById('cancelEdit').style.display = "none";
    if (window.activeWeekId) document.getElementById('id_semaine').value = window.activeWeekId;
}

async function deleteSeance(id) {
    if (!confirm("Supprimer cette séance ?")) return;
    try {
        const res = await API.delete(`/tableaux/delete/${id}`);
        if (typeof showToast === 'function') showToast(res.message, "success");
        else alert(res.message);
        await loadSeances();
    } catch (err) { }
}
