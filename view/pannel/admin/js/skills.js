(function (window, document) {
    "use strict";

    const A = window.TheWayAdmin;
    const api = window.TheWayAPI;
    const state = { page: 1, limit: 10, search: "", category: "", skills: [], selected: null };

    function row(item) {
        return `
            <tr data-id="${A.escape(item.id)}">
                <td><input type="radio" name="skill" class="radio-btn"></td>
                <td><div class="company-cell"><div class="logo">${A.escape(A.initials(item.name))}</div><div><div class="company-name">${A.escape(item.name)}</div><div class="company-email">${item.derived ? "Detectee depuis les offres" : "Base competence"}</div></div></div></td>
                <td>${A.escape(A.value(item.category || item.categorie))}</td>
                <td>${A.number(item.users_count)}</td>
                <td>${A.number(item.demand_count)}</td>
                <td><span class="status-badge ${item.derived ? "pending" : "active"}">${item.derived ? "Derivee" : "Active"}</span></td>
                <td>${A.escape(A.date(item.created_at))}</td>
                <td>
                    <button class="table-action" data-action="view" title="Voir"><i class="bx bx-show"></i></button>
                    <button class="table-action" data-action="edit" title="Modifier" ${item.derived ? "disabled" : ""}><i class="bx bx-edit"></i></button>
                    <button class="table-action" data-action="delete" title="Supprimer" ${item.derived ? "disabled" : ""}><i class="bx bx-trash"></i></button>
                </td>
            </tr>
        `;
    }

    async function loadCounters() {
        try {
            const dashboard = A.data(await api.apiGet("/api/admin/dashboard"));
            A.setKpiByLabels(["competences", "skills"], A.number(dashboard.totals && dashboard.totals.skills));
        } catch (error) {}
    }

    async function load() {
        const tbody = document.getElementById("tableBody");
        A.loading(tbody);
        try {
            const result = A.data(await api.apiGet("/api/admin/skills" + A.query({
                page: state.page,
                limit: state.limit,
                search: state.search,
                category: state.category
            })));
            state.skills = result.skills || [];
            if (!state.skills.length) A.empty(tbody);
            else tbody.innerHTML = state.skills.map(row).join("");
            A.updateFooter(result.pagination, "competences");
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
        const total = state.skills.length;
        const center = document.querySelector(".donut-center-text .val");
        if (center) center.textContent = A.number(total);
        const legend = document.querySelector(".donut-legend");
        if (!legend) return;
        const byCategory = state.skills.reduce((acc, item) => {
            const key = A.value(item.category || item.categorie, "Non renseigne");
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
        legend.innerHTML = Object.keys(byCategory).length ? Object.entries(byCategory).map(([label, count]) => `
            <div class="donut-legend-item"><div class="donut-legend-dot" style="background:#a855f7"></div><span class="dl-label">${A.escape(label)} (${A.number(count)})</span><span class="dl-value">${total ? Math.round(count * 100 / total) : 0}%</span></div>
        `).join("") : '<div style="color:var(--text-light);font-size:13px">Aucune donnee trouvee.</div>';
    }

    function show(item) {
        state.selected = item;
        document.querySelectorAll("#tableBody tr").forEach(rowNode => rowNode.classList.toggle("selected", rowNode.dataset.id === item.id));
        const details = document.getElementById("panelDetails") || document.getElementById("tab-infos");
        if (details) {
            details.innerHTML = `
                <div class="panel-section"><h4>Competence</h4>
                    <div class="info-row"><span class="label">Nom</span><span class="value">${A.escape(item.name)}</span></div>
                    <div class="info-row"><span class="label">Categorie</span><span class="value">${A.escape(A.value(item.category || item.categorie))}</span></div>
                    <div class="info-row"><span class="label">Utilisateurs</span><span class="value">${A.number(item.users_count)}</span></div>
                    <div class="info-row"><span class="label">Demande offres</span><span class="value">${A.number(item.demand_count)}</span></div>
                    <div class="info-row"><span class="label">Origine</span><span class="value">${item.derived ? "Offres/opportunites" : "Table competence"}</span></div>
                </div>
            `;
        }
        A.openPanel("#detailPanel");
    }

    function fields() {
        return [
            { name: "nom", label: "Nom", required: true },
            { name: "categorie", label: "Categorie" }
        ];
    }

    async function save(item) {
        if (item && item.derived) {
            A.toast("Cette competence est derivee des offres et ne peut pas etre modifiee directement.", "error");
            return;
        }
        const payload = await A.formDialog(item ? "Modifier la competence" : "Ajouter une competence", fields(), item || {});
        if (!payload) return;
        try {
            if (item) await api.apiPut("/api/admin/skills/" + encodeURIComponent(item.id), payload);
            else await api.apiPost("/api/admin/skills", payload);
            A.toast(item ? "Competence mise a jour." : "Competence ajoutee.");
            load();
        } catch (error) {
            A.toast(error.message, "error");
        }
    }

    async function remove(item) {
        if (item.derived) {
            A.toast("Cette competence est derivee des offres et ne peut pas etre supprimee ici.", "error");
            return;
        }
        if (!confirm("Supprimer cette competence ?")) return;
        try {
            await api.apiDelete("/api/admin/skills/" + encodeURIComponent(item.id));
            A.toast("Competence supprimee.");
            A.closePanels();
            load();
        } catch (error) {
            A.toast(error.message, "error");
        }
    }

    function bind() {
        A.setStaticSelect(document.getElementById("statusFilter"), [
            { value: "Frontend", label: "Frontend" },
            { value: "Backend", label: "Backend" },
            { value: "Data", label: "Data" },
            { value: "Cloud", label: "Cloud" },
            { value: "Design", label: "Design" },
            { value: "General", label: "General" }
        ], "Categorie: Toutes");
        document.getElementById("searchInput")?.addEventListener("input", A.debounce(event => {
            state.search = event.target.value;
            state.page = 1;
            load();
        }, 250));
        document.getElementById("statusFilter")?.addEventListener("change", event => {
            state.category = event.target.value;
            state.page = 1;
            load();
        });
        document.querySelector(".btn-add")?.addEventListener("click", () => save(null));
        document.querySelector("#tableBody")?.addEventListener("click", event => {
            const tr = event.target.closest("tr[data-id]");
            if (!tr) return;
            const item = state.skills.find(entry => entry.id === tr.dataset.id);
            if (!item) return;
            const action = event.target.closest("[data-action]")?.dataset.action || "view";
            if (action === "edit") save(item);
            else if (action === "delete") remove(item);
            else show(item);
        });
        document.querySelector(".btn-deactivate")?.addEventListener("click", () => state.selected && remove(state.selected));
        document.querySelector(".btn-analyses")?.addEventListener("click", () => location.assign("/view/pannel/admin/analyse.html"));
    }

    A.ready(() => {
        bind();
        load();
    });
})(window, document);
