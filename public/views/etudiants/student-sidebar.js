(function () {
    const nav = document.querySelector('.sidebar-nav');
    if (!nav) return;

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const current = (window.location.pathname.split('/').pop() || '').toLowerCase();

    const baseItems = [
        { href: 'student_dashboard.html', icon: '🏠', label: 'Accueil' },
        { href: 'emploi.html', icon: '📅', label: 'Mes emploi' },
        { href: 'evaluation.html', icon: '📈', label: 'Progression' }
    ];

    function render(items) {
        nav.innerHTML = items.map((it) => {
            const isActive = current === it.href.toLowerCase().split('/').pop();
            return `<a href="${it.href}" class="nav-item${isActive ? ' active' : ''}"><span class="icon">${it.icon}</span>${it.label}</a>`;
        }).join('');
    }

    async function init() {
        const items = [...baseItems];

        try {
            const idEtudiant = user.id_etudiant || user.id;
            if (idEtudiant) {
                const res = await fetch('http://localhost:4000/groupes/all');
                const data = await res.json();
                if (data.success && Array.isArray(data.data)) {
                    const isChef = data.data.some(g => Number(g.id_chef) === Number(idEtudiant));
                    if (isChef) {
                        items.push({ href: 'evaluerMatiere.html', icon: '✅', label: 'Evalier matier' });
                    }
                }
            }
        } catch (_) {
            // non bloquant
        }

        render(items);
    }

    init();
})();
