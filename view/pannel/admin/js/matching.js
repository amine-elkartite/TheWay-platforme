(function (window, document) {
    "use strict";

    const A = window.TheWayAdmin;
    const api = window.TheWayAPI;
    const state = { page: 1, limit: 10, search: "", score: "", matches: [], selected: null };

    function row(item) {
        return `
            <tr data-id="${A.escape(item.id)}">
                <td><input type="radio" name="match" class="radio-btn"></td>
                <td><div class="company-cell"><div class="logo">${A.escape(A.initials(item.user && item.user.name))}</div><div><div class="company-name">${A.escape(item.user && item.user.name)}</div><div class="company-email">${A.escape(item.user && item.user.email)}</div></div></div></td>
                <td>${A.escape(item.offer && item.offer.title)}</td>
                <td>${A.escape(A.value(item.offer && item.offer.company))}</td>
                <td><span class="score-badge">${A.number(item.score)}%</span></td>
                <td>${item.cv ? `<a href="${A.escape(item.cv.fichier)}" target="_blank" rel="noreferrer">CV</a>` : "Aucun CV"}</td>
                <td>${A.escape(A.date(item.date_matching))}</td>
                <td><button class="table-action" data-action="view" title="Voir"><i class="bx bx-show"></i></button></td>
            </tr>
        `;
    }

    async function loadCounters() {
        try {
            const dashboard = A.data(await api.apiGet("/api/admin/dashboard"));
            A.setKpiByLabels(["matching"], A.number((dashboard.totals && dashboard.totals.matching) || 0));
            A.setKpiByLabels(["score"], A.number((dashboard.totals && dashboard.totals.averageMatchingScore) || 0) + "%");
        } catch (error) {}
    }

    async function load() {
        const tbody = document.getElementById("tableBody");
        A.loading(tbody);
        try {
            const result = A.data(await api.apiGet("/api/admin/matching" + A.query({
                page: state.page,
                limit: state.limit,
                user: state.search,
                offer: state.search,
                score: state.score
            })));
            state.matches = result.matches || [];
            if (!state.matches.length) A.empty(tbody, result.emptyMessage || "Aucun matching disponible pour le moment.");
            else tbody.innerHTML = state.matches.map(row).join("");
            A.updateFooter(result.pagination, "matchings");
            A.renderPagination(document.querySelector(".pagination"), result.pagination, page => {
                state.page = page;
                load();
            });
            renderChart();
            loadCounters();
        } catch (error) {
            A.error(tbody);
        }
    }

    function renderChart() {
        const total = state.matches.length;
        const center = document.querySelector(".donut-center-text .val");
        if (center) center.textContent = A.number(total);
        const legend = document.querySelector(".donut-legend");
        if (!legend) return;
        const buckets = { "80-100": 0, "60-79": 0, "0-59": 0 };
        state.matches.forEach(item => {
            if (item.score >= 80) buckets["80-100"] += 1;
            else if (item.score >= 60) buckets["60-79"] += 1;
            else buckets["0-59"] += 1;
        });
        legend.innerHTML = total ? Object.entries(buckets).map(([label, count]) => `
            <div class="donut-legend-item"><div class="donut-legend-dot" style="background:#3b82f6"></div><span class="dl-label">${label} (${A.number(count)})</span><span class="dl-value">${Math.round(count * 100 / total)}%</span></div>
        `).join("") : '<div style="color:var(--text-light);font-size:13px">Aucun matching disponible pour le moment.</div>';
    }

    function show(item) {
        state.selected = item;
        document.querySelectorAll("#tableBody tr").forEach(rowNode => rowNode.classList.toggle("selected", rowNode.dataset.id === item.id));
        const panel = document.getElementById("detailPanel");
        if (!panel) return;
        const body = document.getElementById("tab-infos");
        if (body) {
            body.innerHTML = `
                <div class="panel-section"><h4>Matching</h4>
                    <div class="info-row"><span class="label">Candidat</span><span class="value">${A.escape(item.user && item.user.name)}</span></div>
                    <div class="info-row"><span class="label">Email</span><span class="value">${A.escape(item.user && item.user.email)}</span></div>
                    <div class="info-row"><span class="label">Offre</span><span class="value">${A.escape(item.offer && item.offer.title)}</span></div>
                    <div class="info-row"><span class="label">Entreprise</span><span class="value">${A.escape(A.value(item.offer && item.offer.company))}</span></div>
                    <div class="info-row"><span class="label">Score</span><span class="value">${A.number(item.score)}%</span></div>
                    <div class="info-row"><span class="label">CV</span><span class="value">${item.cv ? `<a href="${A.escape(item.cv.fichier)}" target="_blank" rel="noreferrer">Ouvrir</a>` : "Aucun CV"}</span></div>
                </div>
            `;
        }
        const skills = document.getElementById("tab-skills");
        if (skills) {
            skills.innerHTML = `<div class="panel-section"><h4>Competences de l'offre</h4><div>${((item.offer && item.offer.skills) || []).map(skill => `<span class="skill-tag">${A.escape(skill)}</span>`).join(" ") || "Aucune donnee trouvee."}</div><h4 style="margin-top:16px">Competences manquantes</h4><div>${(item.missingSkills || []).map(skill => `<span class="skill-tag">${A.escape(skill)}</span>`).join(" ") || "Non disponible"}</div></div>`;
        }
        A.openPanel("#detailPanel");
    }

    function bind() {
        A.setStaticSelect(document.getElementById("sectorFilter"), [
            { value: "50", label: "Score >= 50%" },
            { value: "60", label: "Score >= 60%" },
            { value: "80", label: "Score >= 80%" }
        ], "Score: Tous");
        A.disableUnsupported("#statusFilter,.btn-launch", "La generation de matching n'est pas exposee par l'API actuelle.");
        document.getElementById("searchInput")?.addEventListener("input", A.debounce(event => {
            state.search = event.target.value;
            state.page = 1;
            load();
        }, 250));
        document.getElementById("sectorFilter")?.addEventListener("change", event => {
            state.score = event.target.value;
            state.page = 1;
            load();
        });
        document.querySelector("#tableBody")?.addEventListener("click", event => {
            const tr = event.target.closest("tr[data-id]");
            if (!tr) return;
            const item = state.matches.find(entry => entry.id === tr.dataset.id);
            if (item) show(item);
        });
        document.querySelector(".btn-view")?.addEventListener("click", () => state.selected && show(state.selected));
        document.querySelector(".btn-review")?.addEventListener("click", () => A.toast("Action de revue non disponible dans le schema actuel.", "error"));
    }

    A.ready(() => {
        bind();
        load();
    });
})(window, document);
