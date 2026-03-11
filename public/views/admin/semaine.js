document.addEventListener('DOMContentLoaded', () => {
    fetchWeeks();

    document.getElementById('weekForm').addEventListener('submit', (e) => {
        e.preventDefault();
        addWeek();
    });
});

async function fetchWeeks() {
    try {
        const res = await API.get("/semaines/all");
        const tbody = document.querySelector("#weeksTable tbody");
        tbody.innerHTML = "";

        // Sort by numSemaine descending
        const sorted = res.data.sort((a, b) => b.numSemaine - a.numSemaine);

        sorted.forEach(w => {
            const tr = document.createElement("tr");
            const dateDebut = new Date(w.date_debut).toLocaleDateString();
            const dateFin = new Date(w.date_fin).toLocaleDateString();

            tr.innerHTML = `
                <td>Semaine ${w.numSemaine}</td>
                <td>${dateDebut}</td>
                <td>${dateFin}</td>
                <td>
                    ${w.is_active ? '<span class="active-badge">Active</span>' : '<span style="color: #64748b">Inactive</span>'}
                </td>
                <td>
                    ${!w.is_active ? `<button class="btn-success" onclick="activateWeek(${w.id})" style="padding: 6px 12px; font-size: 0.8rem; margin-right: 8px;">Activer</button>` : ''}
                    <button class="btn-danger" onclick="deleteWeek(${w.id})" style="padding: 6px 12px; font-size: 0.8rem;">Supprimer</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error("Erreur chargement semaines:", err);
    }
}

async function addWeek() {
    const data = {
        numSemaine: document.getElementById('numSemaine').value,
        date_debut: document.getElementById('date_debut').value,
        date_fin: document.getElementById('date_fin').value,
        is_active: 0
    };

    try {
        const response = await API.post("/semaines/add", data);
        alert(response.message);
        document.getElementById('weekForm').reset();
        fetchWeeks();
    } catch (err) {
        // Handled by API
    }
}

async function activateWeek(id) {
    try {
        const response = await API.put(`/semaines/activate/${id}`);
        alert(response.message);
        fetchWeeks();
    } catch (err) {
        // Handled by API
    }
}

async function deleteWeek(id) {
    if (!confirm("Voulez-vous vraiment supprimer cette semaine ?")) return;
    try {
        const response = await API.delete(`/semaines/delete/${id}`);
        alert(response.message);
        fetchWeeks();
    } catch (err) {
        // Handled by API
    }
}
