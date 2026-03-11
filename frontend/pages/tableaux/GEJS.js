const seancesContainer = document.getElementById("seancesContainer");
const api = API.base + "/seances"; // Use API.base from api.js

const periodeSelect = document.getElementById("periode");
const salleSelect = document.getElementById("salle");

// Charger les périodes et salles pour le formulaire
function fetchPeriodes() {
    API.get("/periodes/all")
        .then(result => {
            const data = result.data || [];
            if (periodeSelect) {
                periodeSelect.innerHTML = '<option value="">--Choisir période--</option>';
                data.forEach(p => {
                    const option = document.createElement("option");
                    option.value = p.id_periode;
                    option.textContent = p.nom;
                    periodeSelect.appendChild(option);
                });
            }
        });
}

function fetchSalles() {
    API.get("/salles/all")
        .then(result => {
            const data = result.data || [];
            if (salleSelect) {
                salleSelect.innerHTML = '<option value="">--Choisir salle--</option>';
                data.forEach(s => {
                    const option = document.createElement("option");
                    option.value = s.id_salle;
                    option.textContent = s.nom_salle;
                    salleSelect.appendChild(option);
                });
            }
        });
}

function fetchSeances() {
    API.get("/tableaux/all")
        .then(result => {
            const data = result.data || [];
            if (seancesContainer) seancesContainer.innerHTML = "";
            if (data.length === 0 && seancesContainer) {
                seancesContainer.innerHTML = "<p>Aucune séance disponible.</p>";
                return;
            }
            data.forEach(s => {
                const div = document.createElement("div");
                div.innerHTML = `
                    Jour : ${s.jour} | Période : ${s.id_periode} | Salle : ${s.nom_salle} 
                    <button onclick="deleteSeance(${s.id_seance})">Supprimer</button>
                `;
                if (seancesContainer) seancesContainer.appendChild(div);
            });
        });
}

function addSeance() {
    const data = {
        jour: document.getElementById("jour").value,
        id_periode: periodeSelect.value,
        nom_salle: salleSelect.options[salleSelect.selectedIndex].text,
        nom_groupe: document.getElementById("nom_groupe").value,
        nom_professeur: document.getElementById("nom_professeur").value,
        nom_matiere: document.getElementById("nom_matiere").value
    };

    API.post("/tableaux/add", data)
        .then(result => {
            alert(result.message);
            fetchSeances();
        });
}

function deleteSeance(id) {
    if (!confirm("Supprimer ?")) return;
    API.delete(`/tableaux/delete/${id}`)
        .then(result => {
            alert(result.message);
            fetchSeances();
        });
}

// Initialisation
if (periodeSelect) fetchPeriodes();
if (salleSelect) fetchSalles();
fetchSeances();
