let isEditing = false;
let editingId = null;
let allGroups = [];
let allStudents = [];
let showAllStudents = false;

// Fetch groupes
async function fetchGroups() {
    try {
        const result = await API.get("/groupes/all");
        allGroups = result.data || [];
        renderGroups(allGroups);
    } catch (err) { console.error(err); alert("Erreur lors du chargement des groupes"); }
}

// Render groupe
function renderGroups(groups) {
    const tbody = document.querySelector("#groupsTable tbody");
    tbody.innerHTML = "";
    groups.forEach(g => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${g.id_groupe}</td>
            <td>${g.nom}</td>
            <td>${g.id_chef || "-"}</td>
            <td>
                <button onclick="editGroup(${g.id_groupe})">Modifier</button>
                <button onclick="deleteGroup(${g.id_groupe})">Supprimer</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Fetch étudiants
async function fetchStudents() {
    try {
        const url = showAllStudents ? "/groupes/students/with-group" : "/groupes/students/without-group";
        const result = await API.get(url);
        allStudents = result.data || [];
        renderStudentSelect(allStudents);
        renderChefSelect(allStudents);
    } catch (err) { console.error(err); alert("Erreur lors du chargement des étudiants"); }
}

// Render étudiants select
function renderStudentSelect(students) {
    const select = document.getElementById("studentsSelect");
    select.innerHTML = "";
    students.forEach(s => {
        const opt = document.createElement("option");
        opt.value = s.id_etudiant;
        opt.textContent = `${s.nom} (${s.matricule})`;
        select.appendChild(opt);
    });
}

// Render chef select
function renderChefSelect(students) {
    const select = document.getElementById("id_chef");
    select.innerHTML = `<option value="">-- Sélectionner un chef --</option>`;
    students.forEach(s => {
        const opt = document.createElement("option");
        opt.value = s.id_etudiant;
        opt.textContent = `${s.nom} (${s.matricule})`;
        select.appendChild(opt);
    });
}

// Toggle étudiants
document.getElementById("toggleAllStudents").addEventListener("click", () => {
    showAllStudents = !showAllStudents;
    fetchStudents();
});

// Save groupe
async function saveGroup() {
    const nom = document.getElementById("nom").value.trim();
    const id_chef = document.getElementById("id_chef").value;
    const etudiants = Array.from(document.getElementById("studentsSelect").selectedOptions).map(opt => parseInt(opt.value));

    if (!nom) return alert("Le nom du groupe est obligatoire");
    if (id_chef && !etudiants.includes(parseInt(id_chef))) return alert("Le chef doit faire partie du groupe");

    try {  
        const payload = { nom, id_chef: id_chef || null, etudiants };
        let response;
        if (isEditing) response = await API.put(`/groupes/update/${editingId}`, payload);
        else response = await API.post("/groupes/add", payload);

        alert(response.message);
        cancelGroupEdit();
        fetchGroups();
        fetchStudents();
    } catch (err) { console.error(err); alert("Erreur lors de l'enregistrement du groupe"); }
}

// Edit groupe
function editGroup(id) {
    const group = allGroups.find(g => g.id_groupe === id);
    if (!group) return;
    isEditing = true;
    editingId = id;
    document.getElementById("nom").value = group.nom;

    fetchStudents().then(() => {
        const select = document.getElementById("studentsSelect");
        allStudents.forEach(s => {
            if (s.id_groupe === id) {
                const opt = Array.from(select.options).find(o => parseInt(o.value) === s.id_etudiant);
                if(opt) opt.selected = true;
            }
        });
        document.getElementById("id_chef").value = group.id_chef || "";
    });

    document.getElementById("submitBtn").textContent = "Mettre à jour";
    document.getElementById("cancelEdit").style.display = "inline-block";
}

// Cancel édition
function cancelGroupEdit() {
    isEditing = false;
    editingId = null;
    document.getElementById("groupForm").reset();
    document.getElementById("submitBtn").textContent = "Enregistrer";
    document.getElementById("cancelEdit").style.display = "none";
    fetchStudents();
}

// Supprimer
async function deleteGroup(id) {
    if (!confirm("Voulez-vous vraiment supprimer ce groupe ?")) return;
    try {
        const response = await API.delete(`/groupes/delete/${id}`);
        alert(response.message);
        fetchGroups();
        fetchStudents();
    } catch (err) { console.error(err); alert("Erreur lors de la suppression du groupe"); }
}

// Init
document.addEventListener("DOMContentLoaded", () => {
    fetchGroups();
    fetchStudents();
    document.getElementById("groupForm").addEventListener("submit", e => {
        e.preventDefault();
        saveGroup();
    });
});