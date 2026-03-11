let isEditing = false;
let editingId = null;
let allAdmins = [];

async function fetchAdmins() {
    try {
        const result = await API.get('/admins/all');
        allAdmins = result.data || [];
        renderAdmins(allAdmins);
    } catch (err) {
        console.error('Erreur récupération admins:', err);
    }
}

function renderAdmins(admins) {
    const tbody = document.querySelector('#adminsTable tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!admins.length) {
        tbody.innerHTML = '<tr><td colspan="4">Aucun administrateur trouvé</td></tr>';
        return;
    }

    admins.forEach((a) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${a.id_admin}</td>
            <td>${a.nom}</td>
            <td>${a.email}</td>
            <td style="display:flex; gap:8px;">
                <button class="btn-primary" onclick="editAdmin(${a.id_admin})">Modifier</button>
                <button class="btn-danger" onclick="deleteAdmin(${a.id_admin})">Supprimer</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function saveAdmin() {
    const data = {
        nom: document.getElementById('nom').value.trim(),
        email: document.getElementById('email').value.trim(),
        mot_de_passe: document.getElementById('mot_de_passe').value.trim()
    };

    try {
        if (isEditing) {
            if (!data.mot_de_passe) delete data.mot_de_passe;
            await API.put(`/admins/update/${editingId}`, data);
            alert('Administrateur mis à jour avec succès');
        } else {
            await API.post('/admins/add', data);
            alert('Administrateur ajouté avec succès');
        }

        cancelAdminEdit();
        fetchAdmins();
    } catch (err) {
        console.error('Erreur sauvegarde admin:', err);
    }
}

function editAdmin(id) {
    const admin = allAdmins.find((a) => a.id_admin === id);
    if (!admin) return;

    isEditing = true;
    editingId = id;

    document.getElementById('nom').value = admin.nom;
    document.getElementById('email').value = admin.email;
    document.getElementById('mot_de_passe').value = '';
    document.getElementById('mot_de_passe').required = false;

    document.getElementById('submitBtn').textContent = 'Mettre à jour';
    document.getElementById('cancelEdit').style.display = 'inline-block';
    document.getElementById('adminForm').scrollIntoView({ behavior: 'smooth' });
}

function cancelAdminEdit() {
    isEditing = false;
    editingId = null;

    document.getElementById('adminForm').reset();
    document.getElementById('mot_de_passe').required = true;
    document.getElementById('submitBtn').textContent = 'Enregistrer';
    document.getElementById('cancelEdit').style.display = 'none';
}

async function deleteAdmin(id) {
    if (!confirm('Voulez-vous supprimer cet administrateur ?')) return;

    try {
        await API.delete(`/admins/delete/${id}`);
        alert('Administrateur supprimé avec succès');
        fetchAdmins();
    } catch (err) {
        console.error('Erreur suppression admin:', err);
    }
}

function filterAdmins(term) {
    const v = term.toLowerCase();
    const filtered = allAdmins.filter((a) =>
        a.nom.toLowerCase().includes(v) ||
        a.email.toLowerCase().includes(v)
    );
    renderAdmins(filtered);
}

document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id || user.role !== 'administrateur') {
        window.location.href = '../Login/index.html';
        return;
    }

    fetchAdmins();

    document.getElementById('adminForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveAdmin();
    });

    document.getElementById('adminSearch').addEventListener('input', (e) => {
        filterAdmins(e.target.value || '');
    });
});
