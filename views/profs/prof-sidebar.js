(function () {
    const nav = document.querySelector('.sidebar-nav');
    if (!nav) return;

    const current = (window.location.pathname.split('/').pop() || '').toLowerCase();
    const items = [
        { href: 'prof_dashboard.html', icon: '🏠', label: 'Accueil' },
        { href: 'emploi.html', icon: '📅', label: 'Mon emploi' },
        { href: 'progression.html', icon: '📊', label: 'Progression' }
    ];

    nav.innerHTML = items.map((it) => {
        const isActive = current === it.href.toLowerCase();
        return `<a href="${it.href}" class="nav-item${isActive ? ' active' : ''}"><span class="icon">${it.icon}</span>${it.label}</a>`;
    }).join('');
})();
