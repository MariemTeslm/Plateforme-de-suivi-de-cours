/* =========================
   Variables globales
========================= */
let isEditing = false;
let editingId = null;
let allTeachers = [];
let allMatieres = [];

/* =========================
   Charger toutes les matières
========================= */
async function loadMatieres() {
    try {
        const res = await API.get("/matieres/all");
        allMatieres = res.data || [];
        const container = document.getElementById("matieres-list");
        container.innerHTML = "";

        allMatieres.forEach(m => {
            const label = document.createElement("label");
            label.className = "matiere-item";
            label.dataset.name = `${m.nom_matiere} ${m.code_matiere}`.toLowerCase();
            label.innerHTML = `
                <input type="checkbox" name="matieres" value="${m.id}">
                <span>${m.nom_matiere} (${m.code_matiere})</span>
            `;
            container.appendChild(label);
        });
    } catch (err) {
        console.error("Erreur lors du chargement des matières :", err);
    }
}

/* =========================
   Récupérer matières sélectionnées
========================= */
function getSelectedMatieres() {
    // ⚡ Retourne les IDs (entiers) pour le backend
    return Array.from(document.querySelectorAll('input[name="matieres"]:checked'))
        .map(cb => parseInt(cb.value))
        .filter(id => !isNaN(id));
}

/* =========================
   Charger tous les professeurs
========================= */
async function fetchTeachers() {
    try {
        const res = await API.get("/profs/all");
        allTeachers = res.data || [];
        renderTeachers(allTeachers);
    } catch (err) {
        console.error("Erreur lors de la récupération des professeurs :", err);
    }
}

/* =========================
   Afficher la liste des professeurs
========================= */
function renderTeachers(teachers) {
    const tableBody = document.querySelector("#teachersTable tbody");
    tableBody.innerHTML = "";

    teachers.forEach(p => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${p.id_professeur}</td>
            <td>${p.nom}</td>
            <td>${p.email}</td>
            <td>${p.matieres || "-"}</td>
            <td style="display: flex; gap: 8px;">
                <button class="btn-primary" onclick="editTeacher(${p.id_professeur})">Modifier</button>
                <button class="btn-danger" onclick="deleteTeacher(${p.id_professeur})">Supprimer</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

/* =========================
   Ajouter ou modifier professeur
========================= */
async function saveTeacher() {
    const data = {
        nom: document.getElementById("nom").value.trim(),
        email: document.getElementById("email").value.trim(),
        mot_de_passe: document.getElementById("mot_de_passe").value.trim(),
        matieres: getSelectedMatieres() // ⚡ IDs et non codes
    };

    try {
        if (isEditing) {
            await API.put(`/profs/update/${editingId}`, data);
            alert("Professeur mis à jour avec succès !");
        } else {
            await API.post("/profs/add", data);
            alert("Professeur ajouté avec succès !");
        }
        cancelTeacherEdit();
        fetchTeachers();
    } catch (err) {
        console.error("Erreur lors de l'enregistrement :", err);
        alert("Erreur lors de l'enregistrement !");
    }
}

/* =========================
   Éditer un professeur
========================= */
function editTeacher(id) {
    const teacher = allTeachers.find(t => t.id_professeur === id);
    if (!teacher) return;

    isEditing = true;
    editingId = id;

    // Remplir le formulaire
    document.getElementById("nom").value = teacher.nom;
    document.getElementById("email").value = teacher.email;
    document.getElementById("mot_de_passe").value = "";
    document.getElementById("mot_de_passe").required = false;

    // Décocher toutes les matières
    document.querySelectorAll('input[name="matieres"]').forEach(cb => cb.checked = false);

    // Cocher les matières du professeur (selon ID)
    if (teacher.matieres_ids) { // ⚡ Assurez-vous que le backend renvoie un tableau d'IDs pour chaque prof
        teacher.matieres_ids.forEach(mid => {
            const cb = document.querySelector(`input[name="matieres"][value="${mid}"]`);
            if (cb) cb.checked = true;
        });
    }

    // Mise à jour UI
    document.getElementById("submitBtn").textContent = "Mettre à jour";
    document.getElementById("cancelEdit").style.display = "inline-block";
    document.getElementById("profForm").scrollIntoView({ behavior: "smooth" });
}

/* =========================
   Annuler l'édition
========================= */
function cancelTeacherEdit() {
    isEditing = false;
    editingId = null;
    document.getElementById("profForm").reset();
    document.getElementById("mot_de_passe").required = true;
    document.getElementById("submitBtn").textContent = "Enregistrer";

    document.querySelectorAll('input[name="matieres"]').forEach(cb => cb.checked = false);
}

/* =========================
   Supprimer professeur
========================= */
async function deleteTeacher(id) {
    if (!confirm("Supprimer ce professeur ?")) return;
    try {
        await API.delete(`/profs/delete/${id}`);
        alert("Professeur supprimé !");
        fetchTeachers();
    } catch (err) {
        console.error("Erreur lors de la suppression :", err);
        alert("Erreur lors de la suppression !");
    }
}

/* =========================
   Recherche professeurs
========================= */
function filterTeachers(term) {
    term = term.toLowerCase();
    const filtered = allTeachers.filter(p =>
        p.nom.toLowerCase().includes(term) ||
        p.email.toLowerCase().includes(term) ||
        (p.matieres && p.matieres.toLowerCase().includes(term))
    );
    renderTeachers(filtered);
}

/* =========================
   Recherche matières
========================= */
function filterMatieres(term) {
    term = term.toLowerCase();
    document.querySelectorAll(".matiere-item").forEach(lbl => {
        lbl.style.display = lbl.dataset.name.includes(term) ? "" : "none";
    });
}

/* =========================
   Initialisation
========================= */
document.addEventListener("DOMContentLoaded", () => {
    loadMatieres();
    fetchTeachers();

    document.getElementById("profForm").addEventListener("submit", e => {
        e.preventDefault();
        saveTeacher();
    });

    document.getElementById("profSearch").addEventListener("input", e => {
        filterTeachers(e.target.value);
    });

    document.getElementById("searchMatiere").addEventListener("input", e => {
        filterMatieres(e.target.value);
    });
});