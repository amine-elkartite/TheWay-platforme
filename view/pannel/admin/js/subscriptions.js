(function (window, document) {
    "use strict";

    const A = window.TheWayAdmin;
    const api = window.TheWayAPI;
    const state = { page: 1, limit: 10, search: "", plan: "", status: "", subscriptions: [], selected: null };

    function row(item) {
        return `
            <tr data-id="${A.escape(item.id)}">
                <td><input type="radio" name="subscription" class="radio-btn"></td>
                <td><div class="company-cell"><div class="logo">${A.escape(A.initials(item.entreprise || item.plan))}</div><div><div class="company-name">${A.escape(A.value(item.entreprise, "Entreprise non rattachee"))}</div><div class="company-email">${A.escape(item.id)}</div></div></div></td>
                <td><span class="plan-badge enterprise">${A.escape(A.value(item.plan))}</span></td>
                <td><span class="status-badge ${A.badgeClass(item.status)}">${A.escape(A.value(item.status))}</span></td>
                <td>${A.escape(A.date(item.start_date))}</td>
                <td>${A.escape(A.date(item.end_date))}</td>
                <td>${A.money(item.price)}</td>
                <td>
                    <button class="table-action" data-action="view" title="Voir"><i class="bx bx-show"></i></button>
                    <button class="table-action" data-action="edit" title="Modifier"><i class="bx bx-edit"></i></button>
                    <button class="table-action" data-action="delete" title="Supprimer"><i class="bx bx-trash"></i></button>
                </td>
            </tr>
        `;
    }

    async function load() {
        const tbody = document.getElementById("tableBody");
        A.loading(tbody);
        try {
            const result = A.data(await api.apiGet("/api/admin/subscriptions" + A.query({ page: state.page, limit: state.limit })));
            let list = result.subscriptions || [];
            if (state.search) {
                const term = A.normalize(state.search);
                list = list.filter(item => A.normalize([item.entreprise, item.plan, item.status].join(" ")).includes(term));
            }
            if (state.plan) list = list.filter(item => A.normalize(item.plan) === A.normalize(state.plan));
            if (state.status) list = list.filter(item => A.normalize(item.status) === A.normalize(state.status));
            state.subscriptions = list;
            if (!list.length) A.empty(tbody);
            else tbody.innerHTML = list.map(row).join("");
            A.updateFooter(result.pagination || { page: 1, limit: list.length, total: list.length }, "abonnements");
            A.renderPagination(document.querySelector(".pagination"), result.pagination || { page: 1, limit: list.length, total: list.length }, page => {
                state.page = page;
                load();
            });
            renderChart(list);
            A.setKpiByLabels(["abonnements"], A.number((result.pagination && result.pagination.total) || list.length));
        } catch (error) {
            A.error(tbody);
        }
    }

    function renderChart(list) {
        const total = list.length;
        const center = document.querySelector(".donut-center-text .val");
        if (center) center.textContent = A.number(total);
        const legend = document.querySelector(".donut-legend");
        if (!legend) return;
        const byPlan = list.reduce((acc, item) => {
            const key = A.value(item.plan, "Non renseigne");
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
        legend.innerHTML = Object.keys(byPlan).length ? Object.entries(byPlan).map(([label, count]) => `
            <div class="donut-legend-item"><div class="donut-legend-dot" style="background:#7c3aed"></div><span class="dl-label">${A.escape(label)} (${A.number(count)})</span><span class="dl-value">${total ? Math.round(count * 100 / total) : 0}%</span></div>
        `).join("") : '<div style="color:var(--text-light);font-size:13px">Aucune donnee trouvee.</div>';
    }

    function show(item) {
        state.selected = item;
        document.querySelectorAll("#tableBody tr").forEach(rowNode => rowNode.classList.toggle("selected", rowNode.dataset.id === item.id));
        const company = document.getElementById("panelCompany");
        if (company) company.innerHTML = `<div class="logo">${A.escape(A.initials(item.entreprise || item.plan))}</div><div class="info"><div class="name">${A.escape(A.value(item.entreprise, "Entreprise non rattachee"))}</div><div class="sub">${A.escape(A.value(item.plan))}</div></div>`;
        const details = document.getElementById("panelDetails") || document.getElementById("tab-infos");
        if (details) {
            details.innerHTML = `
                <div class="info-row"><span class="label">Plan</span><span class="value">${A.escape(A.value(item.plan))}</span></div>
                <div class="info-row"><span class="label">Statut</span><span class="value">${A.escape(A.value(item.status))}</span></div>
                <div class="info-row"><span class="label">Date debut</span><span class="value">${A.escape(A.date(item.start_date))}</span></div>
                <div class="info-row"><span class="label">Date fin</span><span class="value">${A.escape(A.date(item.end_date))}</span></div>
                <div class="info-row"><span class="label">Prix</span><span class="value">${A.money(item.price)}</span></div>
            `;
        }
        A.openPanel("#detailPanel");
    }

    function fields() {
        return [
            { name: "id_entreprise", label: "ID entreprise" },
            { name: "plan", label: "Plan", required: true },
            { name: "status", label: "Statut", type: "select", options: [
                { value: "active", label: "Actif" },
                { value: "pending", label: "En attente" },
                { value: "suspended", label: "Suspendu" },
                { value: "expired", label: "Expire" }
            ] },
            { name: "start_date", label: "Date debut", type: "date" },
            { name: "end_date", label: "Date fin", type: "date" },
            { name: "price", label: "Prix", type: "number" }
        ];
    }

    async function save(item) {
        const payload = await A.formDialog(item ? "Modifier l'abonnement" : "Ajouter un abonnement", fields(), item || { status: "active" });
        if (!payload) return;
        try {
            if (item) await api.apiPut("/api/admin/subscriptions/" + encodeURIComponent(item.id), payload);
            else await api.apiPost("/api/admin/subscriptions", payload);
            A.toast(item ? "Abonnement mis a jour." : "Abonnement ajoute.");
            load();
        } catch (error) {
            A.toast(error.message, "error");
        }
    }

    async function remove(item) {
        if (!confirm("Supprimer cet abonnement ?")) return;
        try {
            await api.apiDelete("/api/admin/subscriptions/" + encodeURIComponent(item.id));
            A.toast("Abonnement supprime.");
            A.closePanels();
            load();
        } catch (error) {
            A.toast(error.message, "error");
        }
    }

    function bind() {
        document.getElementById("searchInput")?.addEventListener("input", A.debounce(event => {
            state.search = event.target.value;
            state.page = 1;
            load();
        }, 250));
        document.getElementById("planFilter")?.addEventListener("change", event => {
            state.plan = event.target.value;
            state.page = 1;
            load();
        });
        document.getElementById("statusFilter")?.addEventListener("change", event => {
            state.status = event.target.value;
            state.page = 1;
            load();
        });
        document.querySelector(".btn-add")?.addEventListener("click", () => save(null));
        document.querySelector("#tableBody")?.addEventListener("click", event => {
            const tr = event.target.closest("tr[data-id]");
            if (!tr) return;
            const item = state.subscriptions.find(entry => entry.id === tr.dataset.id);
            if (!item) return;
            const action = event.target.closest("[data-action]")?.dataset.action || "view";
            if (action === "edit") save(item);
            else if (action === "delete") remove(item);
            else show(item);
        });
        document.querySelector(".btn-suspend")?.addEventListener("click", () => {
            if (state.selected) save(Object.assign({}, state.selected, { status: "suspended" }));
        });
        document.querySelector(".btn-invoice")?.addEventListener("click", () => A.toast("Aucun endpoint facture disponible.", "error"));
    }

    A.ready(() => {
        bind();
        load();
    });
})(window, document);
