(function (window, document) {
    "use strict";

    const A = window.TheWayAdmin;
    const api = window.TheWayAPI;
    const charts = {};
    let analytics = null;

    function labelsAndValues(rows, labelKey, valueKey) {
        const list = Array.isArray(rows) ? rows : [];
        return {
            labels: list.map(item => A.value(item[labelKey] || item.label, "Non renseigne")),
            values: list.map(item => Number(item[valueKey] || item.value) || 0)
        };
    }

    function renderChart(canvasId, type, rows, labelKey, valueKey, colors) {
        const canvas = document.getElementById(canvasId);
        if (!canvas || !window.Chart) return;
        const prepared = labelsAndValues(rows, labelKey, valueKey);
        const hasData = prepared.values.some(value => value > 0);
        if (!hasData) {
            const parent = canvas.parentElement;
            if (parent) parent.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-light);font-size:13px">Aucune donnee trouvee.</div>';
            return;
        }
        if (charts[canvasId]) charts[canvasId].destroy();
        charts[canvasId] = new Chart(canvas.getContext("2d"), {
            type,
            data: {
                labels: prepared.labels,
                datasets: [{
                    data: prepared.values,
                    label: "Total",
                    backgroundColor: colors || ["#3b82f6", "#22c55e", "#a855f7", "#f59e0b", "#06b6d4", "#94a3b8"],
                    borderColor: type === "line" ? "#3b82f6" : undefined,
                    borderWidth: type === "line" ? 2 : 0,
                    fill: type === "line",
                    tension: 0.35
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: type !== "bar" } },
                scales: type === "doughnut" ? {} : { y: { beginAtZero: true } }
            }
        });
    }

    function renderTable() {
        const tbody = document.getElementById("tableBody");
        if (!tbody || !analytics) return;
        const rows = (analytics.mostDemandedSkills || []).map((item, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${A.escape(item.label)}</td>
                <td>Competence demandee</td>
                <td>${A.number(item.value)}</td>
                <td><span class="status-badge active">Database</span></td>
                <td>${A.escape(A.date(new Date()))}</td>
                <td><button class="table-action" data-action="details" title="Voir"><i class="bx bx-show"></i></button></td>
            </tr>
        `);
        if (!rows.length) A.empty(tbody);
        else tbody.innerHTML = rows.join("");
        A.updateFooter({ page: 1, limit: rows.length || 10, total: rows.length }, "analyses");
        A.renderPagination(document.querySelector(".pagination"), { page: 1, limit: 10, total: rows.length }, () => {});
    }

    function renderCards() {
        if (!analytics) return;
        A.setKpiByLabels(["utilisateurs"], A.number((analytics.usersByRole || []).reduce((sum, item) => sum + Number(item.value || 0), 0)));
        A.setKpiByLabels(["offres"], A.number((analytics.offersByLocation || []).reduce((sum, item) => sum + Number(item.value || 0), 0)));
        A.setKpiByLabels(["matching"], A.number((analytics.matchingScoreDistribution || []).reduce((sum, item) => sum + Number(item.value || 0), 0)));
        A.setKpiByLabels(["competences", "skills"], A.number((analytics.mostDemandedSkills || []).length));
    }

    async function load() {
        const tbody = document.getElementById("tableBody");
        A.loading(tbody);
        try {
            analytics = A.data(await api.apiGet("/api/admin/analytics"));
            renderCards();
            renderTable();
            renderChart("donutChart", "doughnut", analytics.usersByRole, "label", "value");
            renderChart(document.getElementById("lineChart") ? "lineChart" : "precisionChart", "line", analytics.cvUploadsOverTime, "label", "value");
            renderChart("barChart", "bar", analytics.offersByLocation, "label", "value");
        } catch (error) {
            A.error(tbody);
        }
    }

    function bind() {
        document.querySelector(".btn-export")?.addEventListener("click", () => {
            if (!analytics) return;
            A.downloadCsv("theway-analytics.csv", [
                ["Type", "Libelle", "Total"],
                ...(analytics.usersByRole || []).map(item => ["Utilisateurs par role", item.label, item.value]),
                ...(analytics.offersByLocation || []).map(item => ["Offres par localisation", item.label, item.value]),
                ...(analytics.offersBySource || []).map(item => ["Offres par source", item.label, item.value]),
                ...(analytics.opportunitiesBySource || []).map(item => ["Opportunites par source", item.label, item.value]),
                ...(analytics.mostDemandedSkills || []).map(item => ["Competences demandees", item.label, item.value]),
                ...(analytics.enterprisesBySector || []).map(item => ["Entreprises par secteur", item.label, item.value])
            ]);
        });
        document.getElementById("searchInput")?.addEventListener("input", A.debounce(event => {
            const term = A.normalize(event.target.value);
            document.querySelectorAll("#tableBody tr").forEach(row => {
                row.style.display = A.normalize(row.textContent).includes(term) ? "" : "none";
            });
        }, 200));
        document.getElementById("statusFilter")?.addEventListener("change", event => {
            const term = A.normalize(event.target.value);
            document.querySelectorAll("#tableBody tr").forEach(row => {
                row.style.display = !term || A.normalize(row.textContent).includes(term) ? "" : "none";
            });
        });
        document.querySelector("#tableBody")?.addEventListener("click", event => {
            if (event.target.closest("[data-action]")) A.toast("Details alimentes par les agregations API.");
        });
    }

    A.ready(() => {
        bind();
        load();
    });
})(window, document);
