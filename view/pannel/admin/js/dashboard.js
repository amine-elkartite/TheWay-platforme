(function (window, document) {
    "use strict";

    const A = window.TheWayAdmin;
    const api = window.TheWayAPI;
    let dashboard = null;
    const charts = {};

    function setDateRange() {
        const node = document.querySelector(".date-picker span");
        if (node) {
            const today = new Date();
            node.textContent = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(today);
        }
    }

    function renderKpis() {
        const totals = dashboard.totals || {};
        const cards = Array.from(document.querySelectorAll(".kpi-card"));
        const labels = [
            "Utilisateurs inscrits",
            "Offres et opportunites",
            "Entreprises partenaires",
            "Opportunites importees",
            "Score matching moyen"
        ];
        const values = [
            A.number(totals.users),
            A.number(totals.offers),
            A.number(totals.enterprises),
            A.number(totals.opportunities),
            A.number(totals.averageMatchingScore) + "%"
        ];
        cards.forEach((card, index) => {
            const label = card.querySelector(".kpi-label");
            const target = card.querySelector(".kpi-value");
            const footer = card.querySelector(".kpi-footer");
            const change = card.querySelector(".kpi-change");
            if (label && labels[index]) label.textContent = labels[index];
            if (target && values[index] !== undefined) target.textContent = values[index];
            if (change) change.textContent = "Database";
            if (footer) footer.textContent = index === 4 ? "score moyen matching" : "donnees temps reel";
        });
    }

    function renderUsers() {
        const table = document.querySelector(".users-table tbody");
        if (!table) return;
        const users = dashboard.recentUsers || [];
        if (!users.length) {
            A.empty(table);
            return;
        }
        table.innerHTML = users.map(user => `
            <tr>
                <td><div class="user-cell"><div class="user-avatar">${A.escape(A.initials(user.name))}</div><div><div class="name">${A.escape(user.name)}</div><div class="email">${A.escape(user.email)}</div></div></div></td>
                <td style="font-size:12px;color:var(--text-secondary)">${A.escape(A.value(user.role))}</td>
                <td><span class="status-badge pending">Non renseigne</span></td>
                <td style="font-size:12px;color:var(--text-light)">${A.escape(A.date(user.date_inscription))}</td>
                <td style="font-size:12px;color:var(--text-light)">Non renseigne</td>
                <td><button class="table-action" data-route="/view/pannel/admin/users.html"><i class="bx bx-show"></i></button></td>
            </tr>
        `).join("");
    }

    function renderValidations() {
        const container = document.getElementById("validationContent");
        if (!container) return;
        const offers = (dashboard.recentOffers || []).slice(0, 5);
        if (!offers.length) {
            container.innerHTML = '<div style="padding:20px;color:var(--text-light);font-size:13px">Aucune donnee trouvee.</div>';
            return;
        }
        container.innerHTML = offers.map(item => `
            <div class="validation-item">
                <div class="validation-logo">${A.escape(A.initials(item.title || item.titre))}</div>
                <div class="validation-info">
                    <div class="title">${A.escape(item.title || item.titre)}</div>
                    <div class="company">${A.escape(A.value(item.company || item.entreprise))}</div>
                </div>
                <div style="font-size:11px;color:var(--text-light);margin-right:8px">${A.escape(A.value(item.location || item.localisation))}</div>
                <div class="validation-meta">
                    <div class="time">${A.escape(A.date(item.created_at || item.date_publication))}</div>
                    <button class="btn-validate" data-route="/view/pannel/admin/offres.html">Voir</button>
                </div>
            </div>
        `).join("");
        document.querySelectorAll(".validation-tab .count").forEach(count => {
            count.textContent = "(" + A.number(offers.length) + ")";
        });
    }

    function renderActivity() {
        const cards = Array.from(document.querySelectorAll(".card"));
        const activityCard = cards.find(card => A.normalize(card.querySelector(".card-header h3")?.textContent).includes("activite"));
        const body = activityCard && activityCard.querySelector(".card-body");
        if (!body) return;
        const items = [];
        (dashboard.latestNotifications || []).forEach(item => {
            items.push({ icon: "bx-bell", title: A.value(item.type, "Notification"), desc: item.message, date: item.date_notification || item.created_at });
        });
        (dashboard.recentUsers || []).slice(0, 2).forEach(item => {
            items.push({ icon: "bx-user-plus", title: "Nouvel utilisateur", desc: item.name, date: item.date_inscription });
        });
        (dashboard.recentOffers || []).slice(0, 2).forEach(item => {
            items.push({ icon: "bx-briefcase", title: "Offre creee", desc: item.title, date: item.created_at });
        });
        if (!items.length) {
            body.innerHTML = '<div style="padding:20px;color:var(--text-light);font-size:13px">Aucune donnee trouvee.</div>';
            return;
        }
        body.innerHTML = items.slice(0, 6).map(item => `
            <div class="activity-item">
                <div class="activity-icon blue"><i class="bx ${A.escape(item.icon)}"></i></div>
                <div class="activity-info"><div class="title">${A.escape(item.title)}</div><div class="desc">${A.escape(A.value(item.desc))}</div></div>
                <div class="activity-time">${A.escape(A.dateTime(item.date))}</div>
            </div>
        `).join("");
    }

    function roleLabel(role) {
        return { admin: "Admin", recruiter: "Recruteur", user: "Utilisateur" }[role] || A.value(role);
    }

    function renderRoleChart() {
        const canvas = document.getElementById("donutChart");
        if (!canvas || !window.Chart) return;
        const users = dashboard.recentUsers || [];
        const roles = users.reduce((acc, user) => {
            const key = roleLabel(user.role);
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
        const labels = Object.keys(roles);
        const values = Object.values(roles);
        const total = values.reduce((sum, item) => sum + item, 0);
        const center = document.querySelector(".donut-center .value");
        if (center) center.textContent = A.number((dashboard.totals && dashboard.totals.users) || total);
        const legend = document.querySelector(".donut-legend");
        if (legend) {
            legend.innerHTML = total ? labels.map((label, index) => `
                <div class="legend-item"><div class="legend-dot" style="background:${["#3b82f6", "#22c55e", "#a855f7", "#f59e0b"][index % 4]}"></div><span class="label">${A.escape(label)}</span><span class="value">${Math.round(values[index] * 100 / total)}%</span></div>
            `).join("") : '<div style="color:var(--text-light);font-size:13px">Aucune donnee trouvee.</div>';
        }
        if (!total) return;
        if (charts.roles) charts.roles.destroy();
        charts.roles = new Chart(canvas.getContext("2d"), {
            type: "doughnut",
            data: { labels, datasets: [{ data: values, backgroundColor: ["#3b82f6", "#22c55e", "#a855f7", "#f59e0b"], borderWidth: 0 }] },
            options: { responsive: true, maintainAspectRatio: true, cutout: "72%", plugins: { legend: { display: false } } }
        });
    }

    function renderProgressChart() {
        const canvas = document.getElementById("lineChart");
        if (!canvas || !window.Chart) return;
        const progress = dashboard.progression || {};
        const labels = Object.keys(progress);
        const values = Object.values(progress).map(Number);
        if (!values.some(value => value > 0)) {
            const parent = canvas.parentElement;
            if (parent) parent.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-light);font-size:13px">Aucune donnee trouvee.</div>';
            return;
        }
        if (charts.progress) charts.progress.destroy();
        charts.progress = new Chart(canvas.getContext("2d"), {
            type: "line",
            data: { labels, datasets: [{ label: "Progression", data: values, borderColor: "#3b82f6", backgroundColor: "rgba(59,130,246,.08)", fill: true, tension: 0.35 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
        });
    }

    async function load() {
        document.querySelectorAll(".kpi-value").forEach(node => { node.textContent = "Chargement..."; });
        try {
            dashboard = A.data(await api.apiGet("/api/admin/dashboard"));
            renderKpis();
            renderUsers();
            renderValidations();
            renderActivity();
            renderRoleChart();
            renderProgressChart();
            setDateRange();
        } catch (error) {
            document.querySelectorAll(".card-body,.kpi-value").forEach(node => {
                node.textContent = "Impossible de charger les donnees. Verifiez le serveur API.";
            });
        }
    }

    function bind() {
        document.querySelectorAll(".card-header a").forEach(link => {
            const text = A.normalize(link.textContent);
            if (text.includes("utilisateurs")) link.href = "/view/pannel/admin/users.html";
            if (text.includes("toutes")) link.href = "/view/pannel/admin/offres.html";
            if (text.includes("activite")) link.href = "/view/pannel/admin/support.html";
        });
        document.addEventListener("click", event => {
            const routeNode = event.target.closest("[data-route]");
            if (routeNode) location.assign(routeNode.dataset.route);
        });
        document.querySelector(".btn-export")?.addEventListener("click", () => {
            if (!dashboard) return;
            const totals = dashboard.totals || {};
            A.downloadCsv("theway-dashboard.csv", [
                ["Metric", "Value"],
                ["Users", totals.users],
                ["Enterprises", totals.enterprises],
                ["Offers", totals.offers],
                ["Opportunities", totals.opportunities],
                ["Skills", totals.skills],
                ["CVs", totals.cvs],
                ["Average matching score", totals.averageMatchingScore]
            ]);
        });
    }

    A.ready(() => {
        bind();
        load();
    });
})(window, document);
