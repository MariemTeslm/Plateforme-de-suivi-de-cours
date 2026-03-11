/* =========================
   État de l'édition
========================= */
let isEditing = false;
let editingId = null;

/* =========================
   Afficher les salles
========================= */
let allSalles = [];

async function fetchSalles() {
    try {
        const result = await API.get("/salles/all");
        allSalles = result.data || [];
        renderSalles(allSalles);
    } catch (err) { }
}

function renderSalles(salles) {
    const tableBody = document.querySelector("#sallesTable tbody");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    salles.forEach(s => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${s.nom_salle}</td>
            <td>${s.capacite}</td>
            <td style="display: flex; gap: 8px; justify-content: flex-end;">
                <button class="btn-primary" style="padding: 6px 12px; font-size: 0.7rem; min-width: unset; background: #3b82f6;" onclick="editSalle(${s.id_salle})">Modifier</button>
                <button class="btn-danger" onclick="deleteSalle(${s.id_salle})" style="padding: 6px 12px; font-size: 0.7rem; min-width: unset;">Supprimer</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

/* =========================
   Sauvegarder une salle
========================= */
async function saveSalle() {
    const nom = document.getElementById("nom").value.trim();
    const capacite = document.getElementById("capacite").value.trim();

    if (!nom || !capacite) return;

    try {
        let response;
        if (isEditing) {
            response = await API.put(`/salles/update/${editingId}`, { nom, capacite });
        } else {
            response = await API.post("/salles/add", { nom, capacite });
        }

        alert(response.message);
        cancelSalleEdit();
        fetchSalles();
    } catch (err) { }
}

function editSalle(id) {
    const salle = allSalles.find(s => s.id_salle === id);
    if (!salle) return;

    isEditing = true;
    editingId = id;

    document.getElementById("nom").value = salle.nom;
    document.getElementById("capacite").value = salle.capacite;

    document.getElementById("submitBtn").textContent = "Mettre à jour";
    document.getElementById("cancelEdit").style.display = "inline-block";
    document.getElementById("salleForm").scrollIntoView({ behavior: 'smooth' });
}

function cancelSalleEdit() {
    isEditing = false;
    editingId = null;
    document.getElementById("salleForm").reset();
    document.getElementById("submitBtn").textContent = "Enregistrer la salle";
    document.getElementById("cancelEdit").style.display = "none";
}

/* =========================
   Supprimer salle
========================= */
async function deleteSalle(id) {
    if (!confirm("Voulez-vous vraiment supprimer cette salle ?")) return;
    try {
        const response = await API.delete(`/salles/delete/${id}`);
        alert(response.message);
        fetchSalles();
    } catch (err) { }
}

/* =========================
   Initialisation
========================= */
document.addEventListener("DOMContentLoaded", () => {
    fetchSalles();
    const form = document.getElementById("salleForm");
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            saveSalle();
        });
    }
});
