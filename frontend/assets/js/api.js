// ── Toast Notification System ─────────────────────────────────────────────
function showToast(message, type = 'error') {
    // Create container if it doesn't exist
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 99999;
            display: flex; flex-direction: column; gap: 10px;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }

    const colors = {
        error: { bg: '#fef2f2', border: '#fecaca', text: '#dc2626', icon: '✕' },
        success: { bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a', icon: '✓' },
        info: { bg: '#eff6ff', border: '#bfdbfe', text: '#2563eb', icon: 'ℹ' },
        warning: { bg: '#fffbeb', border: '#fde68a', text: '#d97706', icon: '⚠' },
    };
    const c = colors[type] || colors.error;

    const toast = document.createElement('div');
    toast.style.cssText = `
        display: flex; align-items: flex-start; gap: 10px;
        padding: 14px 18px; border-radius: 12px;
        background: ${c.bg}; border: 1px solid ${c.border}; color: ${c.text};
        font-family: 'Outfit', sans-serif; font-size: 0.9rem; font-weight: 500;
        box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        min-width: 280px; max-width: 380px;
        pointer-events: all;
        animation: toastIn 0.35s cubic-bezier(0.16,1,0.3,1);
        cursor: pointer;
    `;

    if (!document.getElementById('toast-style')) {
        const style = document.createElement('style');
        style.id = 'toast-style';
        style.textContent = `
            @keyframes toastIn  { from { opacity:0; transform: translateX(60px); } to { opacity:1; transform: translateX(0); } }
            @keyframes toastOut { from { opacity:1; transform: translateX(0); }    to { opacity:0; transform: translateX(60px); } }
        `;
        document.head.appendChild(style);
    }

    toast.innerHTML = `
        <span style="font-size:1rem;flex-shrink:0;margin-top:1px;">${c.icon}</span>
        <span style="flex:1;line-height:1.4;">${message}</span>
        <span style="font-size:1.1rem;flex-shrink:0;opacity:0.5;margin-left:4px;">×</span>
    `;

    toast.addEventListener('click', () => dismissToast(toast));
    container.appendChild(toast);

    setTimeout(() => dismissToast(toast), 5000);
}

function dismissToast(toast) {
    if (!toast.parentNode) return;
    toast.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
}

// ── API Client ─────────────────────────────────────────────────────────────
const API = {
    base: 'http://localhost:4000',

    request: async (endpoint, options = {}) => {
        const url = `${API.base}${endpoint}`;
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
            ...options.headers
        };

        try {
            const response = await fetch(url, { ...options, headers });
            const contentType = response.headers.get("content-type");
            const text = await response.text();

            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Impossible de joindre le serveur. Vérifiez votre connexion.");
            }

            let result;
            try {
                result = JSON.parse(text);
            } catch (e) {
                throw new Error("Erreur lors de la réception des données.");
            }

            if (!response.ok) {
                throw new Error(result.message || "Une erreur s'est produite. Réessayez.");
            }

            return result;
        } catch (error) {
            let msg = error.message || "";
            if (!msg || msg.includes("localhost") || msg.includes("fetch") || msg.includes("NetworkError") || msg.includes("port 4000")) {
                msg = "Impossible de joindre le serveur. Vérifiez votre connexion.";
            }
            showToast(msg, "error");
            throw error;
        }
    },

    get: (endpoint) => API.request(endpoint, { method: 'GET' }),
    post: (endpoint, body) => API.request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    put: (endpoint, body) => API.request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (endpoint) => API.request(endpoint, { method: 'DELETE' })
};
