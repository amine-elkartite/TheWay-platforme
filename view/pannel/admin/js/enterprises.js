(function (window, document) {
    "use strict";

    const A = window.TheWayAdmin;
    const api = window.TheWayAPI;
    const state = { page: 1, limit: 10, search: "", sector: "", size: "", enterprises: [], selected: null };

    function row(item) {
        return `
            <tr data-id="${A.escape(item.id)}">
                <td><input type="radio" name="enterprise" class="radio-btn"></td>
                <td><div class="company-cell"><div class="logo">${A.escape(A.initials(item.name))}</div><div><div class="company-name">${A.escape(item.name)}</div><div class="company-email">${A.escape(A.value(item.site_web))}</div></div></div></td>
                <td>${A.escape(A.value(item.secteur))}</td>
                <td>${A.escape(A.value(item.taille))}</td>
                <td><span class="plan-badge basic">Non renseigne</span></td>
                <td><span class="status-badge pending">Non renseigne</span></td>
                <td><span class="location-badge"><i class="bx bx-map-pin"></i> ${A.escape(A.value(item.localisation))}</span></td>
                <td>${A.escape(A.date(item.created_at))}</td>
                <td>
                    <button class="table-action" data-action="view" title="Voir"><i class="bx bx-show"></i></button>
                    <button class="table-action" data-action="edit" title="Modifier"><i class="bx bx-edit"></i></button>
                    <button class="table-action" data-action="delete" title="Supprimer"><i class="bx bx-trash"></i></button>
                </td>
            </tr>
        `;
    }

    async function loadCounters() {
        try {
            const dashboard = A.data(await api.apiGet("/api/admin/dashboard"));
            A.setKpiByLabels(["entreprises"], A.number(dashboard.totals && dashboard.totals.enterprises));
            A.setKpiByLabels(["offres actives"], A.number((dashboard.totals && dashboard.totals.offers) || 0));
            A.setKpiByLabels(["premium", "abonnements"], "Non renseigne");
        } catch (error) {}
    }

    async function load() {
        const tbody = document.getElementById("tableBody");
        A.loading(tbody);
        try {
            const result = A.data(await api.apiGet("/api/admin/enterprises" + A.query({
                page: state.page,
                limit: state.limit,
                search: state.search,
                sector: state.sector,
                size: state.size
            })));
            state.enterprises = result.enterprises || [];
            if (!state.enterprises.length) A.empty(tbody);
            else tbody.innerHTML = state.enterprises.map(row).join("");
            A.updateFooter(result.pagination, "entreprises");
            A.renderPagination(document.querySelector(".pagination"), result.pagination, page => {
                state.page = page;
                load();
            });
            loadCounters();
            renderChart();
        } catch (error) {
            A.error(tbody);
        }
    }

    function renderChart() {
        const total = state.enterprises.length;
        const center = document.querySelector(".donut-center-text .val");
        if (center) center.textContent = A.number(total);
        const legend = document.querySelector(".donut-legend");
        if (legend) {
            const bySize = state.enterprises.reduce((acc, item) => {
                const key = A.value(item.taille, "Non renseigne");
                acc[key] = (acc[key] || 0) + 1;
                return acc;
            }, {});
            legend.innerHTML = Object.keys(bySize).length ? Object.entries(bySize).map(([label, count]) => `
                <div class="donut-legend-item"><div class="donut-legend-dot" style="background:#3b82f6"></div><span class="dl-label">${A.escape(label)} (${A.number(count)})</span><span class="dl-value">${total ? Math.round(count * 100 / total) : 0}%</span></div>
            `).join("") : '<div style="color:var(--text-light);font-size:13px">Aucune donnee trouvee.</div>';
        }
    }

    function show(item) {
        state.selected = item;
        document.querySelectorAll("#tableBody tr").forEach(rowNode => rowNode.classList.toggle("selected", rowNode.dataset.id === item.id));
        document.getElementById("panelCompany").innerHTML = `<div class="logo">${A.escape(A.initials(item.name))}</div><div class="info"><div class="name">${A.escape(item.name)}</div><div class="sub">Creee le ${A.escape(A.date(item.created_at))}</div></div>`;
        document.getElementById("panelDetails").innerHTML = `
            <div class="info-row"><span class="label"><i class="bx bx-laptop"></i> Secteur</span><span class="value">${A.escape(A.value(item.secteur))}</span></div>
            <div class="info-row"><span class="label"><i class="bx bx-group"></i> Taille</span><span class="value">${A.escape(A.value(item.taille))}</span></div>
            <div class="info-row"><span class="label"><i class="bx bx-map-pin"></i> Localisation</span><span class="value">${A.escape(A.value(item.localisation))}</span></div>
            <div class="info-row"><span class="label"><i class="bx bx-globe"></i> Site web</span><span class="value">${item.site_web ? `<a href="${A.escape(item.site_web)}" target="_blank" rel="noreferrer">${A.escape(item.site_web)}</a>` : "Non renseigne"}</span></div>
        `;
        document.getElementById("panelSubscription").innerHTML = '<div class="info-row"><span class="label">Abonnement</span><span class="value">Non renseigne</span></div>';
        document.getElementById("panelAccountStatus").innerHTML = `<div class="account-status-item"><span class="asl">Offres liees</span><span class="asv">${A.number(item.offers_count)}</span></div>`;
        A.openPanel("#detailPanel");
    }

    function fields() {
        return [
            { name: "nom", label: "Nom", required: true },
            { name: "secteur", label: "Secteur" },
            { name: "taille", label: "Taille" },
            { name: "localisation", label: "Localisation" },
            { name: "site_web", label: "Site web" }
        ];
    }

    async function save(item) {
        const payload = await A.formDialog(item ? "Modifier l'entreprise" : "Ajouter une entreprise", fields(), item || {});
        if (!payload) return;
        try {
            if (item) await api.apiPut("/api/admin/enterprises/" + encodeURIComponent(item.id), payload);
            else await api.apiPost("/api/admin/enterprises", payload);
            A.toast(item ? "Entreprise mise a jour." : "Entreprise ajoutee.");
            load();
        } catch (error) {
            A.toast(error.message, "error");
        }
    }

    async function remove(item) {
        if (!confirm("Supprimer cette entreprise ?")) return;
        try {
            await api.apiDelete("/api/admin/enterprises/" + encodeURIComponent(item.id));
            A.toast("Entreprise supprimee.");
            A.closePanels();
            load();
        } catch (error) {
            A.toast(error.message, "error");
        }
    }

    function bind() {
        A.setStaticSelect(document.getElementById("planFilter"), [
            { value: "1-10", label: "1-10" },
            { value: "11-50", label: "11-50" },
            { value: "51-200", label: "51-200" },
            { value: "201-500", label: "201-500" },
            { value: "500+", label: "500+" }
        ], "Taille: Toutes");
        A.disableUnsupported("#statusFilter", "Le schema entreprise ne contient pas de statut.");
        document.getElementById("searchInput")?.addEventListener("input", A.debounce(event => {
            state.search = event.target.value;
            state.page = 1;
            load();
        }, 250));
        document.getElementById("sectorFilter")?.addEventListener("change", event => {
            state.sector = event.target.value;
            state.page = 1;
            load();
        });
        document.getElementById("planFilter")?.addEventListener("change", event => {
            state.size = event.target.value;
            state.page = 1;
            load();
        });
        document.querySelector(".btn-add")?.addEventListener("click", () => save(null));
        document.querySelector("#tableBody")?.addEventListener("click", event => {
            const tr = event.target.closest("tr[data-id]");
            if (!tr) return;
            const item = state.enterprises.find(entry => entry.id === tr.dataset.id);
            if (!item) return;
            const action = event.target.closest("[data-action]")?.dataset.action || "view";
            if (action === "edit") save(item);
            else if (action === "delete") remove(item);
            else show(item);
        });
        document.querySelector(".btn-suspend")?.addEventListener("click", () => A.toast("Statut entreprise indisponible dans le schema actuel.", "error"));
        document.querySelector(".btn-profile")?.addEventListener("click", () => state.selected && show(state.selected));
    }

    A.ready(() => {
        bind();
        load();
    });
})(window, document);
