(function (window, document) {
    "use strict";

    const A = window.TheWayAdmin;
    const api = window.TheWayAPI;
    const state = { page: 1, limit: 10, search: "", contract: "", source: "", offers: [], selected: null };

    function row(item) {
        return `
            <tr data-id="${A.escape(item.id)}">
                <td><input type="radio" name="offer" class="radio-btn"></td>
                <td><div class="company-cell"><div class="logo">${A.escape(A.initials(item.title))}</div><div><div class="company-name">${A.escape(item.title)}</div><div class="company-email">${A.escape((item.skills || []).join(", ") || "Competences non renseignees")}</div></div></div></td>
                <td>${A.escape(A.value(item.company))}</td>
                <td>${A.escape(A.value(item.location))}</td>
                <td>${A.escape(A.value(item.contract))}</td>
                <td><span class="status-badge pending">${A.escape(A.value(item.source, "Source inconnue"))}</span></td>
                <td>Non renseigne</td>
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
            A.setKpiByLabels(["offres"], A.number(dashboard.totals && dashboard.totals.offers));
            A.setKpiByLabels(["opportunites"], A.number(dashboard.totals && dashboard.totals.opportunities));
            A.setKpiByLabels(["en attente"], "Non renseigne");
            A.setKpiByLabels(["expirees"], "Non renseigne");
        } catch (error) {}
    }

    async function load() {
        const tbody = document.getElementById("tableBody");
        A.loading(tbody);
        try {
            const result = A.data(await api.apiGet("/api/admin/offers" + A.query({
                page: state.page,
                limit: state.limit,
                search: state.search,
                contract: state.contract,
                source: state.source
            })));
            state.offers = result.offers || [];
            if (!state.offers.length) A.empty(tbody);
            else tbody.innerHTML = state.offers.map(row).join("");
            A.updateFooter(result.pagination, "offres");
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
        const total = state.offers.length;
        const center = document.querySelector(".donut-center-text .val");
        if (center) center.textContent = A.number(total);
        const legend = document.querySelector(".donut-legend");
        if (!legend) return;
        const bySource = state.offers.reduce((acc, item) => {
            const key = A.value(item.source, "Non renseigne");
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
        legend.innerHTML = Object.keys(bySource).length ? Object.entries(bySource).map(([label, count]) => `
            <div class="donut-legend-item"><div class="donut-legend-dot" style="background:#22c55e"></div><span class="dl-label">${A.escape(label)} (${A.number(count)})</span><span class="dl-value">${total ? Math.round(count * 100 / total) : 0}%</span></div>
        `).join("") : '<div style="color:var(--text-light);font-size:13px">Aucune donnee trouvee.</div>';
    }

    function show(item) {
        state.selected = item;
        document.querySelectorAll("#tableBody tr").forEach(rowNode => rowNode.classList.toggle("selected", rowNode.dataset.id === item.id));
        const panel = document.getElementById("detailPanel");
        if (!panel) return;
        const header = panel.querySelector(".panel-header > div");
        if (header) {
            header.innerHTML = `<div class="logo" style="width:40px;height:40px;border-radius:8px;background:#1a1a2e;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700">${A.escape(A.initials(item.title))}</div><div><div style="font-size:15px;font-weight:700;display:flex;align-items:center;gap:8px">${A.escape(item.title)}</div><div style="font-size:11.5px;color:var(--text-light)">${A.escape(A.value(item.company))} · ${A.escape(A.date(item.created_at))}</div></div>`;
        }
        const info = document.getElementById("tab-infos");
        if (info) {
            info.innerHTML = `
                <div class="panel-section"><h4>Informations generales</h4>
                    <div class="info-row"><span class="label">Entreprise</span><span class="value">${A.escape(A.value(item.company))}</span></div>
                    <div class="info-row"><span class="label">Localisation</span><span class="value">${A.escape(A.value(item.location))}</span></div>
                    <div class="info-row"><span class="label">Contrat</span><span class="value">${A.escape(A.value(item.contract))}</span></div>
                    <div class="info-row"><span class="label">Source</span><span class="value">${A.escape(A.value(item.source))}</span></div>
                    <div class="info-row"><span class="label">Competences</span><span class="value">${A.escape((item.skills || []).join(", ") || "Non renseigne")}</span></div>
                </div>
                <div class="panel-section"><h4>Description</h4><p style="color:var(--text-secondary);font-size:13px;line-height:1.6">${A.escape(A.value(item.description))}</p></div>
            `;
        }
        A.openPanel("#detailPanel");
    }

    function fields(item) {
        return [
            { name: "title", label: "Titre", required: true },
            { name: "company", label: "Entreprise" },
            { name: "location", label: "Localisation" },
            { name: "contract", label: "Type de contrat" },
            { name: "source", label: "Source" },
            { name: "source_url", label: "URL source" },
            { name: "skills", label: "Competences separees par virgules" },
            { name: "description", label: "Description", type: "textarea" }
        ].map(field => {
            if (field.name === "skills" && item) field.value = (item.skills || []).join(", ");
            return field;
        });
    }

    async function save(item) {
        const initial = item ? Object.assign({}, item, { skills: (item.skills || []).join(", ") }) : { source: "admin" };
        const payload = await A.formDialog(item ? "Modifier l'offre" : "Ajouter une offre", fields(item), initial);
        if (!payload) return;
        payload.skills = String(payload.skills || "").split(",").map(part => part.trim()).filter(Boolean);
        try {
            if (item) await api.apiPut("/api/admin/offers/" + encodeURIComponent(item.id), payload);
            else await api.apiPost("/api/admin/offers", payload);
            A.toast(item ? "Offre mise a jour." : "Offre ajoutee.");
            load();
        } catch (error) {
            A.toast(error.message, "error");
        }
    }

    async function remove(item) {
        if (!confirm("Supprimer cette offre ?")) return;
        try {
            await api.apiDelete("/api/admin/offers/" + encodeURIComponent(item.id));
            A.toast("Offre supprimee.");
            A.closePanels();
            load();
        } catch (error) {
            A.toast(error.message, "error");
        }
    }

    function bind() {
        A.disableUnsupported("#sectorFilter", "Le filtre secteur n'est pas disponible sur la table offre.");
        A.setStaticSelect(document.getElementById("statusFilter"), [
            { value: "admin", label: "admin" },
            { value: "linkedin", label: "LinkedIn" },
            { value: "indeed", label: "Indeed" },
            { value: "remoteok", label: "Remote OK" }
        ], "Source: Toutes");
        document.getElementById("searchInput")?.addEventListener("input", A.debounce(event => {
            state.search = event.target.value;
            state.page = 1;
            load();
        }, 250));
        document.getElementById("contractFilter")?.addEventListener("change", event => {
            state.contract = event.target.value;
            state.page = 1;
            load();
        });
        document.getElementById("statusFilter")?.addEventListener("change", event => {
            state.source = event.target.value;
            state.page = 1;
            load();
        });
        document.querySelector(".btn-add")?.addEventListener("click", () => save(null));
        document.querySelector("#tableBody")?.addEventListener("click", event => {
            const tr = event.target.closest("tr[data-id]");
            if (!tr) return;
            const item = state.offers.find(entry => entry.id === tr.dataset.id);
            if (!item) return;
            const action = event.target.closest("[data-action]")?.dataset.action || "view";
            if (action === "edit") save(item);
            else if (action === "delete") remove(item);
            else show(item);
        });
        document.querySelector(".btn-view")?.addEventListener("click", () => {
            if (state.selected && state.selected.source_url) window.open(state.selected.source_url, "_blank", "noopener");
            else A.toast("Aucune URL source disponible.", "error");
        });
        document.querySelector(".btn-suspend")?.addEventListener("click", () => A.toast("Statut offre indisponible dans le schema actuel.", "error"));
    }

    A.ready(() => {
        bind();
        load();
    });
})(window, document);
