/* =========================
   État de l'édition
========================= */
let isEditing = false;
let editingId = null;

/* =========================
   Charger les groupes pour le sélecteur
========================= */
async function fetchGroupsForStudents() {
    try {
        const result = await API.get("/groupes/all");
        const select = document.getElementById("groupesSelect");
        const filterSelect = document.getElementById("filterGroup");
        if (select) select.innerHTML = '';
        if (filterSelect) filterSelect.innerHTML = '<option value="">Tous les groupes</option>';

        result.data.forEach(g => {
            if (select) {
                const option = document.createElement("option");
                option.value = g.id_groupe;
                option.textContent = g.nom;
                select.appendChild(option);
            }

            if (filterSelect) {
                const optFilter = document.createElement("option");
                optFilter.value = g.nom;
                optFilter.textContent = g.nom;
                filterSelect.appendChild(optFilter);
            }
        });
    } catch (err) { }
}

/* =========================
   Sauvegarder un étudiant (Ajout ou Modif)
 ========================= */
async function saveStudent() {
    const groupSelect = document.getElementById("groupesSelect");
    const selectedGroups = groupSelect
        ? Array.from(groupSelect.selectedOptions).map(o => Number(o.value)).filter(Boolean)
        : [];

     
    const data = {
        matricule: document.getElementById("matricule").value.trim(),
        nom: document.getElementById("nom").value.trim(),
        email: document.getElementById("email").value.trim(),
        mot_de_passe: document.getElementById("mot_de_passe").value.trim(),
        niveau: document.getElementById("niveau").value,
        departement: document.getElementById("departement").value,
        groupes: selectedGroups,
         
    };

    try {
        let response;
        if (isEditing) {
            response = await API.put(`/students/update/${editingId}`, data);
        } else {
            response = await API.post("/students/add", data);
        }

        alert(response.message);
        cancelStudentEdit(); // Reset form and state
        fetchStudents();
    } catch (err) { }
}

/* =========================
   Afficher les étudiants
 ========================= */
let allStudents = [];

async function fetchStudents() {
    try {
        const result = await API.get("/students/all");
        allStudents = result.data || [];
        renderStudents(allStudents);
    } catch (err) { }
}

function renderStudents(students) {
    console.log("Rendu des étudiants:", students.length);
    const tableBody = document.querySelector("#studentsTable tbody");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    students.forEach(s => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td style="font-weight: 600; color: #1e293b; width: 120px;">${s.matricule}</td>
            <td>${s.nom}</td>
            <td><div style="display:flex; flex-wrap:wrap; gap:4px;">${formatGroups(s.groupe)}</div></td>
            <td style="width: 80px;"><span style="background: #f1f5f9; color: #475569; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 500;">${s.niveau}</span></td>
            <td style="width: 140px; display: flex; gap: 8px;">
                <button class="btn-primary" style="padding: 6px 12px; font-size: 0.7rem; min-width: unset; background: #3b82f6;" onclick="editStudent(${s.id_etudiant})">
                    Modifier
                </button>
                <button class="btn-danger" style="padding: 6px 12px; font-size: 0.7rem; min-width: unset;" onclick="deleteStudent(${s.id_etudiant})">
                    Supprimer
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function formatGroups(groupeStr) {
    if (!groupeStr) return "-";
    return groupeStr.split(', ').map(g => `<span style="background: #e0e7ff; color: #4338ca; padding: 2px 8px; border-radius: 12px; font-size: 0.7rem; white-space: nowrap; font-weight: 500;">${g}</span>`).join('');
}

function editStudent(id) {
    const student = allStudents.find(s => s.id_etudiant === id);
    if (!student) return;

    isEditing = true;
    editingId = id;

    // Populate form
    document.getElementById("matricule").value = student.matricule;
    document.getElementById("nom").value = student.nom;
    document.getElementById("email").value = student.email || "";
    document.getElementById("niveau").value = student.niveau;
    document.getElementById("departement").value = student.departement || "";
    document.getElementById("mot_de_passe").value = ""; // Don't show password, but it might be required for update in backend
    document.getElementById("mot_de_passe").required = false;

    // Set group (find ID by name)
    const select = document.getElementById("groupesSelect");
    if (select) {
        const groupNames = (student.groupe || '').split(',').map(g => g.trim()).filter(Boolean);
        Array.from(select.options).forEach(opt => {
            opt.selected = groupNames.includes(opt.textContent);
        });
    }

    // UI Feedback
    document.getElementById("submitBtn").textContent = "Mettre à jour";
    document.getElementById("cancelEdit").style.display = "inline-block";
    document.getElementById("studentForm").scrollIntoView({ behavior: 'smooth' });
}

function cancelStudentEdit() {
    isEditing = false;
    editingId = null;
    document.getElementById("studentForm").reset();
    const groupSelect = document.getElementById("groupesSelect");
    if (groupSelect) Array.from(groupSelect.options).forEach(o => { o.selected = false; });
    document.getElementById("mot_de_passe").required = true;
    document.getElementById("submitBtn").textContent = "Enregistrer l'étudiant";
    document.getElementById("cancelEdit").style.display = "none";
}

function applyFilters() {
    const searchTerm = document.getElementById("studentSearch").value.toLowerCase();
    const groupFilter = document.getElementById("filterGroup").value;
    const niveauFilter = document.getElementById("filterNiveau").value;

    const filtered = allStudents.filter(s => {
        const nomadMatch = s.nom.toLowerCase().includes(searchTerm);
        const matriculeMatch = s.matricule.toLowerCase().includes(searchTerm);
        const matchesSearch = searchTerm === "" || nomadMatch || matriculeMatch;

        const matchesGroup = groupFilter === "" || (s.groupe && s.groupe.includes(groupFilter));
        const matchesNiveau = niveauFilter === "" || s.niveau === niveauFilter;

        return matchesSearch && matchesGroup && matchesNiveau;
    });

    renderStudents(filtered);
}

/* =========================
   Supprimer étudiant
 ========================= */
async function deleteStudent(id) {
    if (!confirm("Voulez-vous vraiment supprimer cet étudiant ?")) return;

    try {
        const response = await API.delete(`/students/delete/${id}`);
        alert(response.message);
        fetchStudents();
    } catch (err) { }
}

/* =========================
   Initialisation
 ========================= */
document.addEventListener("DOMContentLoaded", () => {
    fetchGroupsForStudents();
    fetchStudents();

    const form = document.getElementById("studentForm");
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            saveStudent();
        });
    }

    const searchInput = document.getElementById("studentSearch");
    const groupFilter = document.getElementById("filterGroup");
    const niveauFilter = document.getElementById("filterNiveau");

    if (searchInput) searchInput.addEventListener("input", applyFilters);
    if (groupFilter) groupFilter.addEventListener("change", applyFilters);
    if (niveauFilter) niveauFilter.addEventListener("change", applyFilters);
});
