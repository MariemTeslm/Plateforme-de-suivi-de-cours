const groupList = document.getElementById("groupList");

async function fetchGroups() {
    try {
        const result = await API.get("/groupes/all");
        if (!groupList) return;
        groupList.innerHTML = ""; // vide le conteneur

        // Sort groups alphabetically
        const sorted = result.data.sort((a, b) => a.nom.localeCompare(b.nom));

        sorted.forEach(s => {
            const link = document.createElement("a");
            link.href = `../tableaux/tableaux.html?group=${encodeURIComponent(s.nom)}`;
            link.textContent = s.nom;
            link.className = "group-link";
            link.style.display = "block";
            link.style.margin = "8px 0";
            link.style.padding = "10px";
            link.style.background = "#f8fafc";
            link.style.borderRadius = "8px";
            link.style.color = "#1e293b";
            link.style.textDecoration = "none";
            link.style.border = "1px solid #e2e8f0";
            link.style.transition = "all 0.3s ease";

            link.onmouseover = () => {
                link.style.borderColor = "#2563eb";
                link.style.background = "#f0f6ff";
                link.style.transform = "translateX(5px)";
            };
            link.onmouseout = () => {
                link.style.borderColor = "#e2e8f0";
                link.style.background = "#f8fafc";
                link.style.transform = "translateX(0)";
            };

            groupList.appendChild(link);
        });
    } catch (err) {
        console.error("Erreur chargement groupes:", err);
    }
}

// Appelle la fonction après chargement de la page
window.addEventListener("DOMContentLoaded", fetchGroups);
