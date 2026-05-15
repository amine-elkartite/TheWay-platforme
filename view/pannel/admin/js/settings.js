(function (window, document) {
    "use strict";

    const A = window.TheWayAdmin;
    const api = window.TheWayAPI;
    let settings = null;

    function ensureSettingsCard() {
        let card = document.getElementById("adminSettingsDynamicCard");
        if (card) return card;
        const target = document.getElementById("tab-general") || document.querySelector(".page-content");
        card = document.createElement("div");
        card.id = "adminSettingsDynamicCard";
        card.className = "settings-card";
        card.style.marginBottom = "20px";
        card.innerHTML = `
            <h3><i class="bx bx-slider-alt"></i> Parametres connectes</h3>
            <div class="form-row">
                <label><i class="bx bx-envelope"></i> Notifications email</label>
                <div class="form-control"><select class="select-input" id="settingNotificationEmail"><option value="enabled">Activees</option><option value="disabled">Desactivees</option></select></div>
            </div>
            <div class="form-row">
                <label><i class="bx bx-bell"></i> Notifications push</label>
                <div class="form-control"><select class="select-input" id="settingNotificationPush"><option value="enabled">Activees</option><option value="disabled">Desactivees</option></select></div>
            </div>
            <div class="form-row">
                <label><i class="bx bx-user"></i> Visibilite profil</label>
                <div class="form-control"><select class="select-input" id="settingVisibility"><option value="public">Public</option><option value="private">Prive</option></select></div>
            </div>
            <div class="form-row">
                <label><i class="bx bx-share-alt"></i> Partage donnees</label>
                <div class="form-control"><select class="select-input" id="settingDataSharing"><option value="enabled">Active</option><option value="disabled">Desactive</option></select></div>
            </div>
        `;
        if (target) target.prepend(card);
        return card;
    }

    function setControl(id, value) {
        const control = document.getElementById(id);
        if (control) control.value = value || control.value;
    }

    function getPayload() {
        return {
            notification_email: document.getElementById("settingNotificationEmail")?.value || "enabled",
            notification_push: document.getElementById("settingNotificationPush")?.value || "enabled",
            visibilite_profil: document.getElementById("settingVisibility")?.value || "public",
            partage_donnees: document.getElementById("settingDataSharing")?.value || "disabled"
        };
    }

    function render() {
        ensureSettingsCard();
        setControl("settingNotificationEmail", settings.notification_email);
        setControl("settingNotificationPush", settings.notification_push);
        setControl("settingVisibility", settings.visibilite_profil);
        setControl("settingDataSharing", settings.partage_donnees);
        A.setKpiByLabels(["configurations"], "4");
        A.setKpiByLabels(["integrations"], "Non renseigne");
        A.setKpiByLabels(["alertes"], "Non renseigne");
        A.setKpiByLabels(["sauvegarde"], "Non renseigne");
        const center = document.querySelector(".donut-center .value");
        if (center) center.textContent = "4";
        document.querySelectorAll(".security-item .right,.system-item .status,.legend-item .lvalue").forEach(node => {
            node.textContent = "Non renseigne";
        });
        renderCharts();
    }

    function renderCharts() {
        const changes = document.getElementById("changesChart");
        if (changes && changes.parentElement) {
            changes.parentElement.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-light);font-size:13px">Aucune donnee trouvee.</div>';
        }
        const donut = document.getElementById("donutChart");
        if (!donut || !window.Chart) return;
        const values = [
            settings.notification_email === "enabled" ? 1 : 0,
            settings.notification_push === "enabled" ? 1 : 0,
            settings.visibilite_profil === "public" ? 1 : 0,
            settings.partage_donnees === "enabled" ? 1 : 0
        ];
        if (window.thewaySettingsChart) window.thewaySettingsChart.destroy();
        window.thewaySettingsChart = new Chart(donut.getContext("2d"), {
            type: "doughnut",
            data: {
                labels: ["Email", "Push", "Profil public", "Partage"],
                datasets: [{ data: values, backgroundColor: ["#3b82f6", "#22c55e", "#a855f7", "#f59e0b"], borderWidth: 0 }]
            },
            options: { responsive: true, maintainAspectRatio: true, cutout: "72%", plugins: { legend: { display: false } } }
        });
    }

    async function load() {
        ensureSettingsCard();
        try {
            settings = A.data(await api.apiGet("/api/admin/settings"));
            render();
        } catch (error) {
            const card = ensureSettingsCard();
            card.insertAdjacentHTML("beforeend", '<div style="color:#ef4444;font-size:13px;margin-top:12px">Impossible de charger les donnees. Verifiez le serveur API.</div>');
        }
    }

    async function save() {
        try {
            settings = A.data(await api.apiPut("/api/admin/settings", getPayload()));
            A.toast("Parametres enregistres.");
            render();
        } catch (error) {
            A.toast(error.message, "error");
        }
    }

    function bind() {
        document.querySelector(".btn-save")?.addEventListener("click", save);
        document.querySelectorAll(".action-item").forEach(item => {
            const text = A.normalize(item.textContent);
            if (text.includes("enregistrer")) item.addEventListener("click", save);
            else {
                item.style.cursor = "not-allowed";
                item.title = "Action indisponible sans endpoint API dedie.";
                item.addEventListener("click", () => A.toast("Action indisponible sans endpoint API dedie.", "error"));
            }
        });
        const upload = document.getElementById("uploadBtn");
        if (upload) {
            upload.disabled = true;
            upload.title = "Aucun endpoint upload logo admin disponible.";
        }
    }

    A.ready(() => {
        bind();
        load();
    });
})(window, document);
