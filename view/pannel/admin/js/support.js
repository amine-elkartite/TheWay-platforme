(function (window, document) {
    "use strict";

    const A = window.TheWayAdmin;
    const api = window.TheWayAPI;
    const state = { page: 1, limit: 10, search: "", status: "", priority: "", tickets: [], selected: null };

    function row(item) {
        return `
            <tr data-id="${A.escape(item.id)}">
                <td><input type="radio" name="ticket" class="radio-btn"></td>
                <td><div class="company-cell"><div class="logo">${A.escape(A.initials(item.user || item.subject))}</div><div><div class="company-name">${A.escape(item.subject)}</div><div class="company-email">${A.escape(A.value(item.email || item.user))}</div></div></div></td>
                <td>${A.escape(A.value(item.status))}</td>
                <td><span class="status-badge ${A.badgeClass(item.priority)}">${A.escape(A.value(item.priority))}</span></td>
                <td>${A.escape(A.dateTime(item.created_at))}</td>
                <td>${A.escape(A.dateTime(item.updated_at))}</td>
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
            const result = A.data(await api.apiGet("/api/admin/support" + A.query({
                page: state.page,
                limit: state.limit,
                search: state.search,
                status: state.status,
                priority: state.priority
            })));
            state.tickets = result.tickets || [];
            if (!state.tickets.length) A.empty(tbody);
            else tbody.innerHTML = state.tickets.map(row).join("");
            A.updateFooter(result.pagination, "tickets");
            A.renderPagination(document.querySelector(".pagination"), result.pagination, page => {
                state.page = page;
                load();
            });
            renderChart();
            A.setKpiByLabels(["tickets"], A.number(result.pagination && result.pagination.total));
        } catch (error) {
            A.error(tbody);
        }
    }

    function renderChart() {
        const total = state.tickets.length;
        const center = document.querySelector(".donut-center-text .val");
        if (center) center.textContent = A.number(total);
        const legend = document.querySelector(".donut-legend");
        if (!legend) return;
        const byStatus = state.tickets.reduce((acc, item) => {
            const key = A.value(item.status, "Non renseigne");
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
        legend.innerHTML = Object.keys(byStatus).length ? Object.entries(byStatus).map(([label, count]) => `
            <div class="donut-legend-item"><div class="donut-legend-dot" style="background:#f59e0b"></div><span class="dl-label">${A.escape(label)} (${A.number(count)})</span><span class="dl-value">${total ? Math.round(count * 100 / total) : 0}%</span></div>
        `).join("") : '<div style="color:var(--text-light);font-size:13px">Aucune donnee trouvee.</div>';
    }

    function show(item) {
        state.selected = item;
        document.querySelectorAll("#tableBody tr").forEach(rowNode => rowNode.classList.toggle("selected", rowNode.dataset.id === item.id));
        const details = document.getElementById("panelDetails") || document.getElementById("tab-infos");
        if (details) {
            details.innerHTML = `
                <div class="info-row"><span class="label">Sujet</span><span class="value">${A.escape(item.subject)}</span></div>
                <div class="info-row"><span class="label">Utilisateur</span><span class="value">${A.escape(A.value(item.user || item.email))}</span></div>
                <div class="info-row"><span class="label">Statut</span><span class="value">${A.escape(A.value(item.status))}</span></div>
                <div class="info-row"><span class="label">Priorite</span><span class="value">${A.escape(A.value(item.priority))}</span></div>
                <div class="info-row"><span class="label">Cree le</span><span class="value">${A.escape(A.dateTime(item.created_at))}</span></div>
                <div class="info-row"><span class="label">Mis a jour</span><span class="value">${A.escape(A.dateTime(item.updated_at))}</span></div>
            `;
        }
        const conversation = document.getElementById("tab-conversation");
        if (conversation) conversation.innerHTML = `<div class="panel-section"><h4>Message</h4><p style="color:var(--text-secondary);font-size:13px;line-height:1.6">${A.escape(A.value(item.message))}</p><div style="margin-top:12px;color:var(--text-light);font-size:12px">Reponse non envoyee: aucun endpoint de messagerie support n'est disponible.</div></div>`;
        A.openPanel("#detailPanel");
    }

    function fields() {
        return [
            { name: "id_user", label: "ID utilisateur" },
            { name: "subject", label: "Sujet", required: true },
            { name: "message", label: "Message", type: "textarea" },
            { name: "status", label: "Statut", type: "select", options: [
                { value: "open", label: "Ouvert" },
                { value: "pending", label: "En attente" },
                { value: "closed", label: "Ferme" }
            ] },
            { name: "priority", label: "Priorite", type: "select", options: [
                { value: "low", label: "Faible" },
                { value: "normal", label: "Normale" },
                { value: "high", label: "Haute" }
            ] }
        ];
    }

    async function save(item) {
        const payload = await A.formDialog(item ? "Modifier le ticket" : "Nouveau ticket", fields(), item || { status: "open", priority: "normal" });
        if (!payload) return;
        try {
            if (item) await api.apiPut("/api/admin/support/" + encodeURIComponent(item.id), payload);
            else await api.apiPost("/api/admin/support", payload);
            A.toast(item ? "Ticket mis a jour." : "Ticket ajoute.");
            load();
        } catch (error) {
            A.toast(error.message, "error");
        }
    }

    async function remove(item) {
        if (!confirm("Supprimer ce ticket ?")) return;
        try {
            await api.apiDelete("/api/admin/support/" + encodeURIComponent(item.id));
            A.toast("Ticket supprime.");
            A.closePanels();
            load();
        } catch (error) {
            A.toast(error.message, "error");
        }
    }

    function bind() {
        A.setStaticSelect(document.getElementById("statusFilter"), [
            { value: "open", label: "Ouvert" },
            { value: "pending", label: "En attente" },
            { value: "closed", label: "Ferme" }
        ], "Statut: Tous");
        document.getElementById("searchInput")?.addEventListener("input", A.debounce(event => {
            state.search = event.target.value;
            state.page = 1;
            load();
        }, 250));
        document.getElementById("statusFilter")?.addEventListener("change", event => {
            state.status = event.target.value;
            state.page = 1;
            load();
        });
        document.querySelector(".btn-new")?.addEventListener("click", () => save(null));
        document.querySelector("#tableBody")?.addEventListener("click", event => {
            const tr = event.target.closest("tr[data-id]");
            if (!tr) return;
            const item = state.tickets.find(entry => entry.id === tr.dataset.id);
            if (!item) return;
            const action = event.target.closest("[data-action]")?.dataset.action || "view";
            if (action === "edit") save(item);
            else if (action === "delete") remove(item);
            else show(item);
        });
        document.querySelector(".btn-pending")?.addEventListener("click", async () => {
            if (!state.selected) return;
            try {
                await api.apiPut("/api/admin/support/" + encodeURIComponent(state.selected.id), { status: "pending" });
                A.toast("Ticket marque en attente.");
                load();
            } catch (error) {
                A.toast(error.message, "error");
            }
        });
        document.querySelector(".btn-view")?.addEventListener("click", () => state.selected && show(state.selected));
    }

    A.ready(() => {
        bind();
        load();
    });
})(window, document);
