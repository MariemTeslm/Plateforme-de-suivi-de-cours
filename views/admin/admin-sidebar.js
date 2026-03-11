(function () {
    const nav = document.querySelector('.sidebar-nav');
    if (!nav) return;

    const current = (window.location.pathname.split('/').pop() || '').toLowerCase();

    const items = [
        { href: 'admin.html', icon: '🏠', label: 'Accueil' },
        { href: 'gestionUtilisateur.html', icon: '👥', label: 'Utilisateur' },
        { href: 'gestionsEtablissement.html', icon: '🏢', label: 'Etablissement' },
        { href: 'gestionEmploi.html', icon: '📚', label: 'Emploi du temps' },
        { href: 'progresions.html', icon: '📈', label: 'Progression' },
         
    ];

    const activeAliases = {
        'admin.html': ['admin.html'],
        'gestionutilisateur.html': ['gestionutilisateur.html', 'student.html', 'prof.html', 'administrateur.html'],
        'gestionsetablissement.html': ['gestionsetablissement.html', 'group.html', 'matiere.html', 'periode.html', 'semaine.html', 'salle.html'],
        'gestionemploi.html': ['gestionemploi.html', 'seance.html', 'ajouter_seance.html', 'emploi_professeur.html', 'emploi.html'],
        'progresions.html': ['progresions.html'],
        'evaluation.html': ['evaluation.html', 'evaluermatiere.html']
    };

    function isActive(itemHref) {
        const key = itemHref.toLowerCase().split('/').pop();
        const aliases = activeAliases[key] || [key];
        return aliases.includes(current);
    }

    nav.innerHTML = items.map((it) => {
        const active = isActive(it.href) ? ' active' : '';
        return `<a href="${it.href}" class="nav-item${active}"><span class="icon">${it.icon}</span>${it.label}</a>`;
    }).join('');
})();
